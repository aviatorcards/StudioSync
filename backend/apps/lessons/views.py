"""
Lesson API views
"""
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta

from apps.lessons.models import Lesson, LessonPlan, StudentGoal
from apps.lessons.serializers import (
    LessonListSerializer, LessonDetailSerializer, LessonCreateSerializer, 
    LessonPlanSerializer, StudentGoalSerializer
)


class LessonViewSet(viewsets.ModelViewSet):
    """
    API endpoints for lessons
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['student__user__first_name', 'student__user__last_name', 'teacher__user__first_name']
    ordering_fields = ['scheduled_start', 'created_at']
    ordering = ['scheduled_start']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return LessonListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
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
        queryset = Lesson.objects.select_related('student__user', 'teacher__user', 'studio')
        
        # Admin sees everything
        if user.role == 'admin':
            pass  # No filtering for admins
        
        # Teachers see only their own students
        elif user.role == 'teacher' and hasattr(user, 'teacher_profile'):
            queryset = queryset.filter(teacher=user.teacher_profile)
        
        # Students see only their own lessons
        elif user.role == 'student' and hasattr(user, 'student_profile'):
            queryset = queryset.filter(student=user.student_profile)
        
        # Fallback: If role unclear, show nothing (maximum privacy)
        else:
            queryset = queryset.none()
        
        # Date range filtering (same for all roles)
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(scheduled_start__gte=start_date)
        if end_date:
            queryset = queryset.filter(scheduled_end__lte=end_date)
        
        # Status filtering (same for all roles)
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming lessons"""
        queryset = self.get_queryset().filter(
            scheduled_start__gte=timezone.now(),
            status='scheduled'
        ).order_by('scheduled_start')[:10]
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's lessons"""
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        
        queryset = self.get_queryset().filter(
            scheduled_start__gte=today_start,
            scheduled_start__lt=today_end
        ).order_by('scheduled_start')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def week(self, request):
        """Get this week's lessons"""
        today = timezone.now()
        week_start = today - timedelta(days=today.weekday())
        week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
        week_end = week_start + timedelta(days=7)
        
        queryset = self.get_queryset().filter(
            scheduled_start__gte=week_start,
            scheduled_start__lt=week_end
        ).order_by('scheduled_start')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, 'teacher_profile'):
            serializer.save(
                teacher=user.teacher_profile,
                studio=user.teacher_profile.studio
            )
        elif hasattr(user, 'student_profile'):
            # allow student to book, forcing themselves as the student
            serializer.save(
                 student=user.student_profile,
                 studio=user.student_profile.studio,
                 # If teacher is not in payload, validation would have failed if required.
                 # If it is in payload, it is used.
                 # We could default to primary_teacher if we wanted to make it optional in serializer, 
                 # but for now assume frontend sends it.
            )
        elif user.role == 'admin':
            # Admin needs to provide teacher/studio or we try to guess/default?
            # For now, let validation fail if not provided, or default if possible.
            # But the serializer will require them.
            # If admin is creating, they likely send the data.
            serializer.save()
        else:
             # Fallback
             serializer.save()


class LessonPlanViewSet(viewsets.ModelViewSet):
    """
    API endpoints for lesson plans
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['created_at', 'title']
    
    def get_serializer_class(self):
        return LessonPlanSerializer
        
    def get_queryset(self):
        # Public plans OR plans created by me
        user = self.request.user
        qs = LessonPlan.objects.all()
        # For simplicity, returning all for now, or filter by studio logic if needed
        return qs

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'teacher_profile'):
            serializer.save(created_by=self.request.user.teacher_profile)
        else:
             # If admin, maybe link differently or skip?
             # Raising error might block admin testing.
             pass


class StudentGoalViewSet(viewsets.ModelViewSet):
    """
    API endpoints for student goals
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'student__user__first_name', 'student__user__last_name']
    ordering_fields = ['target_date', 'progress_percentage']
    
    def get_serializer_class(self):
        return StudentGoalSerializer  # Make sure to import this
        
    def get_queryset(self):
        # Teacher: Goals for my students
        # Student: My goals
        user = self.request.user
        if hasattr(user, 'teacher_profile'):
            return StudentGoal.objects.filter(teacher=user.teacher_profile)
        elif hasattr(user, 'student_profile'):
            return StudentGoal.objects.filter(student=user.student_profile)
        return StudentGoal.objects.all()  # Admin

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'teacher_profile'):
            serializer.save(teacher=self.request.user.teacher_profile)

