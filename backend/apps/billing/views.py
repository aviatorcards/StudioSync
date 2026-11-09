from django.db.models import Q

from rest_framework import permissions, status, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from apps.core.tenancy import studio_for_request, studios_for_request

from .models import Invoice, Subscription, SubscriptionPlan
from .serializers import InvoiceSerializer, SubscriptionPlanSerializer, SubscriptionSerializer


def visible_invoices(user):
    """Invoices the user is allowed to see. No cross-studio fallback."""
    from apps.core.tenancy import studios_for_user

    studios = studios_for_user(user)
    if getattr(user, "role", None) == "admin":
        return Invoice.objects.filter(studio__in=studios)
    if getattr(user, "role", None) == "teacher" and hasattr(user, "teacher_profile"):
        return Invoice.objects.filter(studio=user.teacher_profile.studio)
    if hasattr(user, "student_profile"):
        student = user.student_profile
        return Invoice.objects.filter(Q(student=student) | Q(band__in=student.bands.all())).distinct()
    if getattr(user, "role", None) == "parent":
        return Invoice.objects.filter(
            Q(student__family__primary_parent=user) | Q(student__family__secondary_parent=user)
        ).distinct()
    return Invoice.objects.none()


def payable_invoices(user):
    """Invoices this user is allowed to pay. Teachers are read-only."""
    if getattr(user, "role", None) == "teacher":
        return Invoice.objects.none()
    return visible_invoices(user)


class InvoiceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing invoices
    """

    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return visible_invoices(self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != "admin":
            raise PermissionDenied("Only admins can create invoices.")

        studio = studio_for_request(self.request)
        if studio is None:
            raise ValidationError("No studio found to associate with this invoice.")
        serializer.save(studio=studio)

    def update(self, request, *args, **kwargs):
        if request.user.role != "admin":
            return Response(
                {"detail": "Only admins can update invoices."}, status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if request.user.role != "admin":
            return Response(
                {"detail": "Only admins can update invoices."}, status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.role != "admin":
            return Response(
                {"detail": "Only admins can delete invoices."}, status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        studios = studios_for_request(self.request)
        if user.role == "admin":
            return SubscriptionPlan.objects.filter(studio__in=studios)
        if user.role == "teacher" and hasattr(user, "teacher_profile"):
            return SubscriptionPlan.objects.filter(studio=user.teacher_profile.studio)
        if hasattr(user, "student_profile"):
            return SubscriptionPlan.objects.filter(studio=user.student_profile.studio, is_active=True)
        return SubscriptionPlan.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role != "admin":
            raise permissions.PermissionDenied("Only admins can create subscription plans.")
        studio = studio_for_request(self.request)
        if studio is None:
            raise ValidationError("No studio found to associate with this plan.")
        serializer.save(studio=studio)

    def update(self, request, *args, **kwargs):
        if request.user.role != "admin":
            raise permissions.PermissionDenied("Only admins can update subscription plans.")
        return super().update(request, *args, **kwargs)


class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        studios = studios_for_request(self.request)
        if user.role == "admin":
            return Subscription.objects.filter(studio__in=studios)
        if user.role == "teacher" and hasattr(user, "teacher_profile"):
            return Subscription.objects.filter(studio=user.teacher_profile.studio)
        if hasattr(user, "student_profile"):
            return Subscription.objects.filter(student=user.student_profile)
        return Subscription.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role not in ["admin", "student"]:
            raise permissions.PermissionDenied("Only admins or students can create subscriptions.")

        if user.role == "admin":
            studio = studio_for_request(self.request)
        else:
            student = getattr(user, "student_profile", None)
            studio = getattr(student, "studio", None)
        if studio is None:
            raise ValidationError("No studio found to associate with this subscription.")
        plan = serializer.validated_data.get("plan")
        if plan is not None and plan.studio_id != studio.id:
            raise ValidationError("That plan belongs to a different studio.")
        serializer.save(studio=studio)

