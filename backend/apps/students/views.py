from django.db import models

from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.core.models import Family, Student
from apps.core.tenancy import studio_for_request, studios_for_request
from apps.students.serializers import (
    StudentCreateUpdateSerializer,
    StudentDetailSerializer,
    StudentListSerializer,
)
from apps.students.serializers_family import FamilySerializer


class StudentViewSet(viewsets.ModelViewSet):
    """
    API endpoints for managing students
    """

    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["user__first_name", "user__last_name", "instrument"]
    ordering_fields = ["user__last_name", "enrollment_date"]
    ordering = ["user__last_name"]

    def get_serializer_class(self):
        if self.action == "list":
            return StudentListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return StudentCreateUpdateSerializer
        return StudentDetailSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Student.objects.select_related("user", "primary_teacher__user", "family").filter(
            user__role="student", studio__in=studios_for_request(self.request)
        )

        if user.role == "admin":
            return queryset

        if user.role == "teacher" and hasattr(user, "teacher_profile"):
            return queryset.filter(primary_teacher=user.teacher_profile)

        if user.role == "parent":
            return queryset.filter(
                models.Q(family__primary_parent=user) | models.Q(family__secondary_parent=user)
            )

        if hasattr(user, "student_profile"):
            student_profile = user.student_profile
            # Bandmates are visible for scheduling, but retrieve() hides medical fields.
            user_bands = student_profile.bands.all()
            if user_bands.exists():
                return queryset.filter(
                    models.Q(id=student_profile.id) | models.Q(bands__in=user_bands)
                ).distinct()
            return queryset.filter(id=student_profile.id)

        return queryset.none()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.role == "student" and instance.user_id != request.user.id:
            serializer = StudentListSerializer(instance, context={"request": request})
            return Response(serializer.data)
        return super().retrieve(request, *args, **kwargs)

    @action(detail=False, methods=["get"], url_path="instruments")
    def instruments(self, request):
        """Return sorted unique instrument list: studio curated list + instruments used by existing students."""
        # 1. Instruments already assigned to students
        student_instruments = (
            self.get_queryset()
            .exclude(instrument="")
            .exclude(instrument__isnull=True)
            .values_list("instrument", flat=True)
            .distinct()
        )

        # 2. Curated list stored in studio settings
        curated: list = []
        studio = studio_for_request(request)
        if studio and isinstance(studio.settings, dict):
            curated = studio.settings.get("instruments", [])

        merged = sorted(
            {i.strip().title() for i in list(student_instruments) + curated if i and i.strip()}
        )
        return Response(merged)

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        """Return aggregate stats for the students the current user can access."""
        qs = self.get_queryset()
        total = qs.count()
        active = qs.filter(is_active=True).count()
        unassigned = qs.filter(primary_teacher__isnull=True).count()
        return Response(
            {
                "total_students": total,
                "active_students": active,
                "unassigned_students": unassigned,
            }
        )

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != "admin":
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("Only admins can create students.")
        studio = studio_for_request(self.request)
        if studio is None:
            from rest_framework.exceptions import ValidationError

            raise ValidationError("No studio is associated with this account.")
        serializer.save(studio=studio)


class FamilyViewSet(viewsets.ModelViewSet):
    """
    API endpoints for managing families
    """

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FamilySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["primary_parent__last_name", "primary_parent__email"]

    def get_queryset(self):
        user = self.request.user
        queryset = Family.objects.select_related(
            "primary_parent", "secondary_parent"
        ).prefetch_related("students__user").filter(studio__in=studios_for_request(self.request))
        if user.role in ("admin", "teacher"):
            return queryset
        if user.role == "parent":
            return queryset.filter(models.Q(primary_parent=user) | models.Q(secondary_parent=user))
        if hasattr(user, "student_profile") and user.student_profile.family_id:
            return queryset.filter(pk=user.student_profile.family_id)
        return queryset.none()

    def _require_manager(self):
        if self.request.user.role not in ("admin", "teacher"):
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("Only admins and teachers can change families.")

    def create(self, request, *args, **kwargs):
        self._require_manager()
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        studio = studio_for_request(self.request)
        if studio is None:
            from rest_framework.exceptions import ValidationError

            raise ValidationError("No studio is associated with this account.")
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
