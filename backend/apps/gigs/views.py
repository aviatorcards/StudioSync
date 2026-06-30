import hashlib
import hmac
import logging
from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.db import transaction
from django.db.models import Q
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.models import Studio, Band
from apps.billing.models import Invoice, Payment, InvoiceLineItem
from .models import BandAvailability, BandExternalEvent, Gig, GigClaim, GigPayout, Venue
from .serializers import (
    BandAvailabilitySerializer,
    BandExternalEventSerializer,
    GigSerializer,
    GigClaimSerializer,
    GigPayoutSerializer,
    VenueSerializer,
)

logger = logging.getLogger(__name__)


class BandAvailabilityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing monthly band availability
    """
    serializer_class = BandAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = BandAvailability.objects.select_related("band")

        # Admin sees all availabilities in their studios
        if user.role == "admin":
            studios = Studio.objects.filter(owner=user)
            return queryset.filter(band__studio__in=studios)

        # Teachers see availabilities in their studio
        if hasattr(user, "teacher_profile"):
            return queryset.filter(band__studio=user.teacher_profile.studio)

        # Band leaders/members see availabilities for their own bands
        if user.role == "student" or user.role == "parent":
            # Filter bands where user is primary contact OR a member
            bands = Band.objects.filter(Q(primary_contact=user) | Q(members__user=user)).distinct()
            return queryset.filter(band__in=bands)

        return queryset.none()

    def perform_create(self, serializer):
        band = serializer.validated_data["band"]
        user = self.request.user

        # Permission check: Only admin or the band leader can submit/edit
        if user.role != "admin" and band.primary_contact != user and not band.members.filter(user=user).exists():
            raise permissions.exceptions.PermissionDenied("You do not have permission to manage this band's availability.")

        is_submitted = serializer.validated_data.get("is_submitted", False)
        submitted_at = timezone.now() if is_submitted else None
        
        serializer.save(submitted_at=submitted_at)

    def perform_update(self, serializer):
        instance = self.get_object()
        user = self.request.user

        # Cannot edit if already submitted unless admin
        if instance.is_submitted and user.role != "admin":
            raise Response(
                {"detail": "Cannot modify availability once submitted."},
                status=status.HTTP_400_BAD_REQUEST
            )

        is_submitted = serializer.validated_data.get("is_submitted", False)
        submitted_at = timezone.now() if is_submitted else instance.submitted_at

        serializer.save(submitted_at=submitted_at)

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        """Finalize and submit availability"""
        availability = self.get_object()
        user = request.user

        if user.role != "admin" and availability.band.primary_contact != user and not availability.band.members.filter(user=user).exists():
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        availability.is_submitted = True
        availability.submitted_at = timezone.now()
        availability.save()

        serializer = self.get_serializer(availability)
        return Response(serializer.data)


class VenueViewSet(viewsets.ModelViewSet):
    """
    CRUD for venues. Only admins can create/update/delete; all authenticated users can list.
    """
    serializer_class = VenueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        studio = self._get_studio(user)
        if not studio:
            return Venue.objects.none()
        return Venue.objects.filter(studio=studio).prefetch_related("allowed_posters")

    def _get_studio(self, user):
        if user.role == "admin":
            return Studio.objects.filter(owner=user).first()
        if hasattr(user, "teacher_profile"):
            return user.teacher_profile.studio
        if hasattr(user, "student_profile"):
            return user.student_profile.studio
        return None

    def perform_create(self, serializer):
        if self.request.user.role != "admin":
            raise permissions.exceptions.PermissionDenied("Only admins can manage venues.")
        studio = Studio.objects.filter(owner=self.request.user).first()
        if not studio:
            from rest_framework import serializers as drf_s
            raise drf_s.ValidationError("Cannot determine studio.")
        serializer.save(studio=studio)

    def perform_update(self, serializer):
        if self.request.user.role != "admin":
            raise permissions.exceptions.PermissionDenied("Only admins can manage venues.")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role != "admin":
            raise permissions.exceptions.PermissionDenied("Only admins can manage venues.")
        instance.delete()


class GigViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing gigs & the marketplace
    """
    serializer_class = GigSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Gig.objects.select_related("studio", "band", "venue_ref").prefetch_related("claims")

        # Admin sees all gigs in their studios
        if user.role == "admin":
            studios = Studio.objects.filter(owner=user)
            return queryset.filter(studio__in=studios)

        # Teachers see gigs in their studio
        if hasattr(user, "teacher_profile"):
            return queryset.filter(studio=user.teacher_profile.studio)

        # Band members see gigs assigned to their band OR open gigs in their studio
        if user.role == "student" or user.role == "parent":
            bands = Band.objects.filter(Q(primary_contact=user) | Q(members__user=user)).distinct()
            studios = Studio.objects.filter(bands__in=bands).distinct()
            return queryset.filter(
                Q(band__in=bands) | Q(status="open", studio__in=studios)
            ).distinct()

        return queryset.none()

    def perform_create(self, serializer):
        user = self.request.user
        venue_ref = serializer.validated_data.get("venue_ref")

        # Venue-level authorization:
        # - If venue has allowed_posters defined, only those users (plus admin) can post.
        # - If venue has no allowed_posters, only admin can post.
        # - If no venue_ref provided at all, only admin can post.
        if venue_ref and venue_ref.allowed_posters.exists():
            if user.role != "admin" and not venue_ref.allowed_posters.filter(pk=user.pk).exists():
                raise permissions.exceptions.PermissionDenied(
                    f"You are not authorized to post gigs at {venue_ref.name}."
                )
        elif user.role != "admin":
            raise permissions.exceptions.PermissionDenied("Only admins can create gigs.")

        # Populate the legacy venue text field from the FK for display consistency.
        if venue_ref and not serializer.validated_data.get("venue"):
            serializer.validated_data["venue"] = venue_ref.name

        studio = serializer.validated_data.get("studio")
        if not studio:
            if venue_ref:
                studio = venue_ref.studio
            else:
                studio = Studio.objects.filter(owner=user).first()
            if not studio:
                from rest_framework import serializers as drf_s
                raise drf_s.ValidationError({"studio": "Cannot determine studio context."})
            serializer.validated_data["studio"] = studio

        serializer.save()

    @action(detail=True, methods=["post"])
    def claim(self, request, pk=None):
        """Band claims an open gig"""
        gig = self.get_object()
        user = request.user

        if gig.status != "open":
            return Response({"detail": "This gig is not open for claims."}, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve band ID from request body
        band_id = request.data.get("band_id")
        if not band_id:
            return Response({"detail": "band_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            band = Band.objects.get(id=band_id)
        except Band.DoesNotExist:
            return Response({"detail": "Band not found"}, status=status.HTTP_404_NOT_FOUND)

        # Permission check: Only band leader or member can claim
        if user.role != "admin" and band.primary_contact != user and not band.members.filter(user=user).exists():
            return Response({"detail": "You do not have permission to claim gigs for this band."}, status=status.HTTP_403_FORBIDDEN)

        # Create or retrieve claim
        claim, created = GigClaim.objects.get_or_create(
            gig=gig,
            band=band,
            defaults={"notes": request.data.get("notes", "")}
        )

        if not created:
            return Response({"detail": "You have already claimed this gig."}, status=status.HTTP_400_BAD_REQUEST)

        # If a band leader claims it, gig status moves to pending_approval
        gig.status = "pending_approval"
        gig.save()

        serializer = GigSerializer(gig)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def release(self, request, pk=None):
        """Band releases an assigned gig"""
        gig = self.get_object()
        user = request.user
        band = gig.band

        if not band:
            return Response({"detail": "This gig is not assigned to a band."}, status=status.HTTP_400_BAD_REQUEST)

        # Permission check: Only admin, or band leader/member can release
        if user.role != "admin" and band.primary_contact != user and not band.members.filter(user=user).exists():
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        # Revert gig to open
        gig.band = None
        gig.status = "open"
        gig.save()

        # Delete any claims associated with this gig so they can be re-applied
        gig.claims.all().delete()

        serializer = GigSerializer(gig)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def approve_claim(self, request, pk=None):
        """Admin approves a band's claim for a gig"""
        if request.user.role != "admin":
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        gig = self.get_object()
        claim_id = request.data.get("claim_id")
        if not claim_id:
            return Response({"detail": "claim_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            approved_claim = gig.claims.get(id=claim_id)
        except GigClaim.DoesNotExist:
            return Response({"detail": "Claim not found for this gig"}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            # Approve this claim
            approved_claim.status = "approved"
            approved_claim.save()

            # Decline all other claims for this gig
            gig.claims.exclude(id=claim_id).update(status="declined")

            # Assign gig to the band
            gig.band = approved_claim.band
            gig.status = "assigned"
            gig.save()

        serializer = GigSerializer(gig)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def payout(self, request, pk=None):
        """Admin processes gig payout and logs payment in billing ledger"""
        if request.user.role != "admin":
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        gig = self.get_object()
        if gig.status != "assigned":
            return Response({"detail": "Only assigned gigs can be paid out."}, status=status.HTTP_400_BAD_REQUEST)

        if not gig.band:
            return Response({"detail": "Gig has no band assigned."}, status=status.HTTP_400_BAD_REQUEST)

        amount = request.data.get("amount", gig.pay_rate)
        payment_method = request.data.get("payment_method", "bank_transfer")

        with transaction.atomic():
            # 1. Create Invoice for the booking payout
            invoice = Invoice.objects.create(
                studio=gig.studio,
                band=gig.band,
                status="paid",
                total_amount=amount,
                amount_paid=amount,
                due_date=timezone.localdate(),
                notes=f"Payout for gig: '{gig.title}' at {gig.venue}",
                internal_notes="Gig Payout automated ledger record"
            )

            # Create line item
            InvoiceLineItem.objects.create(
                invoice=invoice,
                description=f"Performance payout for gig: {gig.title}",
                quantity=1,
                unit_price=amount,
                total_price=amount
            )

            # 2. Log corresponding payment completed
            payment = Payment.objects.create(
                invoice=invoice,
                amount=amount,
                payment_method=payment_method,
                status="completed",
                notes=f"Gig Payout processed for: {gig.title}",
                processed_by=request.user,
                processed_at=timezone.now()
            )

            # 3. Create GigPayout
            payout = GigPayout.objects.create(
                gig=gig,
                band=gig.band,
                amount=amount,
                status="processed",
                payment=payment,
                processed_at=timezone.now()
            )

            # 4. Mark gig completed
            gig.status = "completed"
            gig.save()

        serializer = GigSerializer(gig)
        return Response(serializer.data)


class GigClaimViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing gig claims
    """
    serializer_class = GigClaimSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = GigClaim.objects.select_related("gig", "band")

        # Admin sees all claims
        if user.role == "admin":
            studios = Studio.objects.filter(owner=user)
            return queryset.filter(gig__studio__in=studios)

        # Band leaders/members see claims for their bands
        if user.role == "student" or user.role == "parent":
            bands = Band.objects.filter(Q(primary_contact=user) | Q(members__user=user)).distinct()
            return queryset.filter(band__in=bands)

        return queryset.none()


class BandExternalEventViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only access to BandExternalEvent records (confirmed gigs from 317booking).

    GET /api/gigs/external-events/?band=<uuid>   — list events for a band
    POST /api/gigs/external-events/<id>/sync/     — trigger an immediate iCal re-sync for that band
    """

    serializer_class = BandExternalEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = BandExternalEvent.objects.select_related("band")

        if user.role == "admin":
            studios = Studio.objects.filter(owner=user)
            qs = qs.filter(band__studio__in=studios)
        elif hasattr(user, "teacher_profile"):
            qs = qs.filter(band__studio=user.teacher_profile.studio)
        else:
            bands = Band.objects.filter(Q(primary_contact=user) | Q(members__user=user)).distinct()
            qs = qs.filter(band__in=bands)

        band_id = self.request.query_params.get("band")
        if band_id:
            qs = qs.filter(band_id=band_id)

        return qs.order_by("start_time")

    @action(detail=False, methods=["post"], url_path="sync")
    def sync(self, request):
        """Trigger an immediate iCal re-sync for a specific band."""
        band_id = request.data.get("band_id")
        if not band_id:
            return Response({"detail": "band_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            band = Band.objects.get(id=band_id)
        except Band.DoesNotExist:
            return Response({"detail": "Band not found"}, status=status.HTTP_404_NOT_FOUND)

        if not band.ical_feed_url:
            return Response({"detail": "This band has no iCal feed configured."}, status=status.HTTP_400_BAD_REQUEST)

        from .tasks import sync_band_calendar
        try:
            sync_band_calendar(band_id)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        events = BandExternalEvent.objects.filter(band=band).order_by("start_time")
        serializer = BandExternalEventSerializer(events, many=True)
        return Response({"synced": True, "events": serializer.data})


class ThreeSeventeenBookingWebhookView(APIView):
    """
    Inbound webhook from 317booking.
    Handles gig.confirmed and gig.cancelled events, creating/deleting BandExternalEvent records
    so confirmed gigs block availability on the StudioSync gig marketplace.
    """

    authentication_classes = []
    permission_classes = []

    def post(self, request):
        secret = getattr(settings, "BOOKING_317_WEBHOOK_SECRET", "")
        if secret:
            signature = request.META.get("HTTP_X_317BOOKING_SIGNATURE", "")
            expected = "sha256=" + hmac.new(
                secret.encode(), request.body, hashlib.sha256
            ).hexdigest()
            if not hmac.compare_digest(expected.encode(), signature.encode()):
                return Response({"error": "Invalid signature"}, status=status.HTTP_401_UNAUTHORIZED)

        event = request.data.get("event")
        gig_data = request.data.get("gig", {})
        gig_id = gig_data.get("id")

        if not gig_id:
            return Response({"error": "Missing gig.id"}, status=status.HTTP_400_BAD_REQUEST)

        uid = f"gig-{gig_id}@317booking"

        if event == "gig.confirmed":
            band_id = gig_data.get("studiosync_band_id")
            try:
                band = Band.objects.get(id=band_id)
            except Band.DoesNotExist:
                return Response({"error": "Band not found"}, status=status.HTTP_404_NOT_FOUND)

            start_time = parse_datetime(gig_data.get("date", ""))
            if not start_time:
                return Response({"error": "Invalid or missing date"}, status=status.HTTP_400_BAD_REQUEST)

            BandExternalEvent.objects.update_or_create(
                band=band,
                uid=uid,
                defaults={
                    "title": f"Gig @ {gig_data.get('venue_name', 'Venue')}",
                    "description": gig_data.get("description", ""),
                    "start_time": start_time,
                    "end_time": start_time + timedelta(hours=3),
                },
            )
            return Response({"ok": True})

        if event == "gig.cancelled":
            BandExternalEvent.objects.filter(uid=uid).delete()
            return Response({"ok": True})

        return Response({"error": "Unknown event"}, status=status.HTTP_400_BAD_REQUEST)
