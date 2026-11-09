from datetime import timedelta

from django.db.models import Q
from django.utils import timezone

from django.db import transaction

from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.core.tenancy import studio_for_request, studios_for_request

from .models import CheckoutLog, InventoryItem, PracticeRoom, RoomReservation
from .serializers import (
    CheckoutLogSerializer,
    InventoryItemSerializer,
    PracticeRoomSerializer,
    RoomReservationSerializer,
)


class InventoryItemViewSet(viewsets.ModelViewSet):
    """ViewSet for inventory items"""

    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter based on query params and the caller's studio."""
        queryset = super().get_queryset().filter(studio__in=studios_for_request(self.request))

        # Filter by category
        category = self.request.query_params.get("category")
        if category and category != "all":
            queryset = queryset.filter(category=category)

        # Filter by status
        status = self.request.query_params.get("status")
        if status:
            queryset = queryset.filter(status=status)

        # Search by name or location
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(location__icontains=search))

        return queryset

    def _require_manager(self):
        if self.request.user.role not in ("admin", "teacher"):
            raise PermissionDenied("Only admins and teachers can change inventory.")

    def create(self, request, *args, **kwargs):
        self._require_manager()
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        self._require_manager()
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        self._require_manager()
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        self._require_manager()
        return super().destroy(request, *args, **kwargs)

    def perform_create(self, serializer):
        studio = studio_for_request(self.request)
        if studio is None:
            raise serializers.ValidationError("No studio is associated with this account.")
        serializer.save(created_by=self.request.user, studio=studio)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Get inventory statistics"""
        items = self.get_queryset()

        total_items = items.count()
        total_value = sum(item.value * item.quantity for item in items)
        low_stock = items.filter(available_quantity__lte=2).count()
        needs_repair = items.filter(condition="needs-repair").count()

        return Response(
            {
                "total_items": total_items,
                "total_value": f"${total_value:,.2f}",
                "low_stock": low_stock,
                "needs_repair": needs_repair,
            }
        )


class CheckoutLogViewSet(viewsets.ModelViewSet):
    """ViewSet for checkout logs"""

    queryset = CheckoutLog.objects.select_related("item", "student", "approved_by")
    serializer_class = CheckoutLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter checkouts to the caller's studio."""
        queryset = super().get_queryset().filter(item__studio__in=studios_for_request(self.request))

        if self.request.user.role == "student":
            queryset = queryset.filter(student__user=self.request.user)
        elif self.request.user.role == "parent":
            queryset = queryset.filter(
                Q(student__family__primary_parent=self.request.user)
                | Q(student__family__secondary_parent=self.request.user)
            )

        # Filter by status
        status = self.request.query_params.get("status")
        if status:
            queryset = queryset.filter(status=status)

        # Filter by student
        student_id = self.request.query_params.get("student")
        if student_id:
            queryset = queryset.filter(student_id=student_id)

        return queryset

    @transaction.atomic
    def perform_create(self, serializer):
        """Create a new checkout request for the signed-in student."""
        student = getattr(self.request.user, "student_profile", None)
        if self.request.user.role != "student" or student is None:
            raise PermissionDenied("Only students can request a checkout.")

        item = InventoryItem.objects.select_for_update().get(
            pk=serializer.validated_data["item"].pk, studio=student.studio
        )
        quantity = serializer.validated_data.get("quantity", 1)

        if item.available_quantity < quantity:
            raise serializers.ValidationError(
                {"quantity": f"Only {item.available_quantity} available"}
            )

        if "due_date" not in serializer.validated_data:
            serializer.validated_data["due_date"] = timezone.now().date() + timedelta(
                days=item.max_checkout_days
            )

        serializer.save(student=student, status="pending", item=item)

        item.available_quantity -= quantity
        item.save(update_fields=["available_quantity"])

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        """Approve a checkout request (admin/teacher only)"""
        if request.user.role not in ["admin", "teacher"]:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        checkout = self.get_object()
        checkout.status = "approved"
        checkout.approved_by = request.user
        checkout.approved_at = timezone.now()
        checkout.save()

        serializer = self.get_serializer(checkout)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def return_item(self, request, pk=None):
        """Mark item as returned"""
        with transaction.atomic():
            checkout = self.get_object()

            if checkout.status != "approved":
                return Response(
                    {"detail": "Only approved checkouts can be returned"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            checkout.status = "returned"
            checkout.return_date = timezone.now()
            checkout.notes = request.data.get("notes", checkout.notes)
            checkout.save()

            item = InventoryItem.objects.select_for_update().get(pk=checkout.item_id)
            item.available_quantity += checkout.quantity
            item.save(update_fields=["available_quantity"])

        serializer = self.get_serializer(checkout)
        return Response(serializer.data)


class PracticeRoomViewSet(viewsets.ModelViewSet):
    """ViewSet for practice rooms"""

    queryset = PracticeRoom.objects.filter(is_active=True)
    serializer_class = PracticeRoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(studio__in=studios_for_request(self.request))

    def _require_manager(self):
        if self.request.user.role not in ("admin", "teacher"):
            raise PermissionDenied("Only admins and teachers can change practice rooms.")

    def create(self, request, *args, **kwargs):
        self._require_manager()
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        studio = studio_for_request(self.request)
        if studio is None:
            raise serializers.ValidationError("No studio is associated with this account.")
        serializer.save(studio=studio)

    def update(self, request, *args, **kwargs):
        self._require_manager()
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        self._require_manager()
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        self._require_manager()
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["get"])
    def availability(self, request, pk=None):
        """Get room availability for a specific date"""
        room = self.get_object()
        date_str = request.query_params.get("date", timezone.now().date().isoformat())

        try:
            from datetime import datetime

            target_date = datetime.fromisoformat(date_str).date()
        except (ValueError, TypeError):
            return Response(
                {"detail": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get all reservations for this room on this date
        reservations = RoomReservation.objects.filter(
            room=room, start_time__date=target_date, status__in=["pending", "confirmed"]
        ).order_by("start_time")

        reserved_slots = [
            {
                "start": res.start_time.isoformat(),
                "end": res.end_time.isoformat(),
                "student": (
                    res.student.user.get_full_name()
                    if request.user.role in ("admin", "teacher")
                    or res.student.user_id == request.user.id
                    else "Reserved"
                ),
            }
            for res in reservations
        ]

        return Response({"room": room.name, "date": date_str, "reserved_slots": reserved_slots})


class RoomReservationViewSet(viewsets.ModelViewSet):
    """ViewSet for room reservations"""

    queryset = RoomReservation.objects.select_related("room", "student")
    serializer_class = RoomReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter reservations to the caller's studio."""
        queryset = super().get_queryset().filter(
            room__studio__in=studios_for_request(self.request)
        )

        if self.request.user.role == "student":
            queryset = queryset.filter(student__user=self.request.user)
        elif self.request.user.role == "parent":
            queryset = queryset.filter(
                Q(student__family__primary_parent=self.request.user)
                | Q(student__family__secondary_parent=self.request.user)
            )

        # Filter by date range
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        if start_date:
            queryset = queryset.filter(start_time__gte=start_date)
        if end_date:
            queryset = queryset.filter(end_time__lte=end_date)

        # Filter by room
        room_id = self.request.query_params.get("room")
        if room_id:
            queryset = queryset.filter(room_id=room_id)

        return queryset

    def perform_create(self, serializer):
        """Create a new reservation for the signed-in student."""
        student = getattr(self.request.user, "student_profile", None)
        if self.request.user.role != "student" or student is None:
            raise PermissionDenied("Only students can reserve a room.")
        room = serializer.validated_data["room"]
        if room.studio_id != student.studio_id:
            raise serializers.ValidationError("That room is not in your studio.")
        serializer.save(student=student)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Cancel a reservation"""
        reservation = self.get_object()

        # Students can only cancel their own reservations
        if request.user.role == "student" and reservation.student.user != request.user:
            return Response(
                {"detail": "You can only cancel your own reservations"},
                status=status.HTTP_403_FORBIDDEN,
            )

        reservation.status = "cancelled"
        reservation.save()

        serializer = self.get_serializer(reservation)
        return Response(serializer.data)
