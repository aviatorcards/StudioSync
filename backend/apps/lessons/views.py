"""
Lesson API views
"""

from datetime import timedelta

from django.db.models import Q
from django.utils import timezone

from rest_framework import filters, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.core.tenancy import studios_for_request
from apps.lessons.models import Lesson, LessonPlan, StudentGoal
from apps.lessons.serializers import (
    LessonCreateSerializer,
    LessonDetailSerializer,
    LessonListSerializer,
    LessonPlanSerializer,
    StudentGoalSerializer,
)


class LessonViewSet(viewsets.ModelViewSet):
    """
    API endpoints for lessons
    """

    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "student__user__first_name",
        "student__user__last_name",
        "teacher__user__first_name",
    ]
    ordering_fields = ["scheduled_start", "created_at"]
    ordering = ["scheduled_start"]

    def get_serializer_class(self):
        if self.action == "list":
            return LessonListSerializer
        elif self.action in ["create", "update", "partial_update"]:
            return LessonCreateSerializer
        return LessonDetailSerializer

    def get_queryset(self):
        """
        Role-based privacy filtering:
        - Students: See ONLY their own lessons
        - Teachers: See ONLY their own students' lessons
        - Admins: See all lessons
        """
        user = self.request.user
        queryset = Lesson.objects.select_related(
            "student__user", "teacher__user", "studio", "band"
        ).filter(studio__in=studios_for_request(self.request))

        if user.role == "admin":
            pass
        elif user.role == "teacher" and hasattr(user, "teacher_profile"):
            queryset = queryset.filter(teacher=user.teacher_profile)
        elif user.role == "student" and hasattr(user, "student_profile"):
            queryset = queryset.filter(student=user.student_profile)
        elif user.role == "parent":
            queryset = queryset.filter(
                Q(student__family__primary_parent=user) | Q(student__family__secondary_parent=user)
            )
        else:
            queryset = Lesson.objects.none()

        # Date range filtering (same for all roles)
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        if start_date:
            queryset = queryset.filter(scheduled_start__gte=start_date)
        if end_date:
            queryset = queryset.filter(scheduled_end__lte=end_date)

        # Status filtering (same for all roles)
        status = self.request.query_params.get("status")
        if status:
            queryset = queryset.filter(status=status)

        return queryset

    def paginate_queryset(self, queryset):
        """
        Disable pagination when fetching a specific date range for the calendar.
        Calendar views need all events to render correctly.
        """
        if "start_date" in self.request.query_params and "end_date" in self.request.query_params:
            return None
        return super().paginate_queryset(queryset)

    @action(detail=False, methods=["get"])
    def upcoming(self, request):
        """Get upcoming lessons"""
        queryset = (
            self.get_queryset()
            .filter(scheduled_start__gte=timezone.now(), status="scheduled")
            .order_by("scheduled_start")[:10]
        )

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def today(self, request):
        """Get today's lessons"""
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)

        queryset = (
            self.get_queryset()
            .filter(scheduled_start__gte=today_start, scheduled_start__lt=today_end)
            .order_by("scheduled_start")
        )

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def week(self, request):
        """Get this week's lessons"""
        today = timezone.now()
        week_start = today - timedelta(days=today.weekday())
        week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
        week_end = week_start + timedelta(days=7)

        queryset = (
            self.get_queryset()
            .filter(scheduled_start__gte=week_start, scheduled_start__lt=week_end)
            .order_by("scheduled_start")
        )

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def _reject_student_mutation(self):
        if self.request.user.role in ("student", "parent"):
            raise PermissionDenied("Students and parents cannot edit lessons.")

    def update(self, request, *args, **kwargs):
        self._reject_student_mutation()
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        self._reject_student_mutation()
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        self._reject_student_mutation()
        return super().destroy(request, *args, **kwargs)

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, "teacher_profile") and user.role == "teacher":
            serializer.save(teacher=user.teacher_profile, studio=user.teacher_profile.studio)
        elif hasattr(user, "student_profile") and user.role == "student":
            # Students can request a scheduled lesson for themselves. They cannot
            # set status, rate, or a studio other than their own.
            serializer.save(
                student=user.student_profile,
                studio=user.student_profile.studio,
                status="scheduled",
                rate=None,
            )
        elif user.role == "admin":
            studio = serializer.validated_data.get("studio")
            allowed = studios_for_request(self.request)
            if studio is None or not allowed.filter(pk=studio.pk).exists():
                raise PermissionDenied("Choose a studio you own.")
            serializer.save()
        else:
            raise PermissionDenied("You cannot create lessons.")


class LessonPlanViewSet(viewsets.ModelViewSet):
    """
    API endpoints for lesson plans
    """

    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "tags"]
    ordering_fields = ["created_at", "title"]

    def get_serializer_class(self):
        return LessonPlanSerializer

    def get_queryset(self):
        user = self.request.user
        qs = LessonPlan.objects.select_related("created_by__user", "created_by__studio")

        if user.role == "admin":
            studios = studios_for_request(self.request)
            qs = qs.filter(created_by__studio__in=studios)
        elif hasattr(user, "teacher_profile") and user.teacher_profile:
            # Teacher sees: their own plans + public plans from same studio
            studio = user.teacher_profile.studio
            qs = qs.filter(
                Q(created_by=user.teacher_profile) | Q(is_public=True, created_by__studio=studio)
            )
        elif hasattr(user, "student_profile") and user.student_profile:
            # Students see only public plans from their studio
            studio = user.student_profile.studio
            qs = qs.filter(is_public=True, created_by__studio=studio)
        else:
            qs = qs.none()

        return qs

    def perform_create(self, serializer):
        user = self.request.user

        if hasattr(user, "teacher_profile") and user.teacher_profile:
            serializer.save(created_by=user.teacher_profile)
        elif user.role == "admin":
            # Admin can specify teacher_id in request.data.get('created_by')
            teacher_id = self.request.data.get("created_by")
            teacher = None

            if teacher_id:
                from apps.core.models import Teacher

                try:
                    teacher = Teacher.objects.get(
                        id=teacher_id, studio__in=studios_for_request(self.request)
                    )
                except (Teacher.DoesNotExist, ValueError):
                    raise serializers.ValidationError(
                        {"created_by": "Teacher with this ID does not exist"}
                    ) from None

            if not teacher:
                from apps.core.models import Teacher

                teacher = Teacher.objects.filter(
                    studio__in=studios_for_request(self.request)
                ).first()

            if not teacher:
                raise serializers.ValidationError(
                    {
                        "created_by": "No teacher found to assign this lesson plan to. Please create a teacher profile first."
                    }
                )

            serializer.save(created_by=teacher)
        else:
            raise PermissionDenied("Only teachers and admins can create lesson plans")


class StudentGoalViewSet(viewsets.ModelViewSet):
    """
    API endpoints for student goals
    """

    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "student__user__first_name", "student__user__last_name"]
    ordering_fields = ["target_date", "progress_percentage"]

    def get_serializer_class(self):
        return StudentGoalSerializer  # Make sure to import this

    def get_queryset(self):
        user = self.request.user

        if hasattr(user, "teacher_profile") and user.teacher_profile:
            # Teacher: Goals for their students only
            return StudentGoal.objects.filter(teacher=user.teacher_profile)
        elif hasattr(user, "student_profile") and user.student_profile:
            # Student: Their own goals
            return StudentGoal.objects.filter(student=user.student_profile)
        elif user.role == "admin":
            from apps.core.models import Student

            students = Student.objects.filter(studio__in=studios_for_request(self.request))
            return StudentGoal.objects.filter(student__in=students)
        else:
            return StudentGoal.objects.none()

    def perform_create(self, serializer):
        user = self.request.user

        if hasattr(user, "teacher_profile") and user.teacher_profile:
            # Teacher creating goal for a student
            serializer.save(teacher=user.teacher_profile)
        elif hasattr(user, "student_profile") and user.student_profile:
            # Student creating their own goal
            student = user.student_profile
            # Use primary teacher if available, otherwise require teacher in request
            if hasattr(student, "primary_teacher") and student.primary_teacher:
                serializer.save(student=student, teacher=student.primary_teacher)
            else:
                # Student must have teacher in validated_data
                if "teacher" not in serializer.validated_data:
                    raise serializers.ValidationError(
                        {"teacher": "Teacher must be specified for this goal"}
                    )
                serializer.save(student=student)
        elif user.role == "admin":
            # Admin must specify student
            if "student" not in serializer.validated_data:
                raise serializers.ValidationError({"student": "Admin must specify a student"})

            student = serializer.validated_data.get("student")
            # If teacher is not in validated_data (it's read_only anyway),
            # try to use student's primary teacher.
            teacher = serializer.validated_data.get("teacher")
            if not teacher and student and hasattr(student, "primary_teacher"):
                teacher = student.primary_teacher

            serializer.save(teacher=teacher)
        else:
            raise PermissionDenied("You don't have permission to create goals")
