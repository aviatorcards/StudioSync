from django.db import models
from rest_framework import viewsets, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.core.models import Student, Family
from apps.students.serializers import (
    StudentListSerializer, 
    StudentDetailSerializer, 
    StudentCreateUpdateSerializer
)
from apps.students.serializers_family import FamilySerializer

class StudentViewSet(viewsets.ModelViewSet):
    """
    API endpoints for managing students
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__first_name', 'user__last_name', 'instrument']
    ordering_fields = ['user__last_name', 'enrollment_date']
    ordering = ['user__last_name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return StudentListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return StudentCreateUpdateSerializer
        return StudentDetailSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Only show students whose user role is still 'student' (exclude promoted users)
        queryset = Student.objects.select_related('user', 'primary_teacher__user', 'family').filter(user__role='student')

        # Admin can see everything
        if user.role == 'admin':
            return queryset
            
        # Teachers can see their own students
        if hasattr(user, 'teacher_profile'):
            return queryset.filter(primary_teacher=user.teacher_profile)
            
        # Students can only see themselves and their band members
        if hasattr(user, 'student_profile'):
            student_profile = user.student_profile
            user_bands = student_profile.bands.all()
            if user_bands.exists():
                return queryset.filter(models.Q(id=student_profile.id) | models.Q(bands__in=user_bands)).distinct()
            return queryset.filter(id=student_profile.id)
            
        # Fallback
        return queryset.none()
    
    def perform_create(self, serializer):
        # Automatically assign the studio from the admin's owned studio
        # For MVP, we'll use the first studio or admin's owned studio
        from apps.core.models import Studio
        
        user = self.request.user
        if user.role == 'admin':
            studio = Studio.objects.filter(owner=user).first()
            if not studio:
                studio = Studio.objects.first()  # Fallback to any studio
            if studio:
                serializer.save(studio=studio)
            else:
                serializer.save()  # Will fail if studio is required
        else:
            serializer.save()

class FamilyViewSet(viewsets.ModelViewSet):
    """
    API endpoints for managing families
    """
    permission_classes = [permissions.IsAuthenticated] # Adjust permissions as needed (Admin only?)
    serializer_class = FamilySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['primary_parent__last_name', 'primary_parent__email']

    def get_queryset(self):
        return Family.objects.select_related('primary_parent', 'secondary_parent').prefetch_related('students__user')

