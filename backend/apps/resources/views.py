from rest_framework import viewsets, permissions, filters, status, serializers as drf_serializers
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Resource
from .serializers import ResourceSerializer

class ResourceViewSet(viewsets.ModelViewSet):
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    filterset_fields = ['resource_type', 'instrument', 'skill_level', 'category']
    search_fields = ['title', 'description', 'tags', 'composer']
    ordering_fields = ['created_at', 'title']

    def get_queryset(self):
        user = self.request.user
        qs = Resource.objects.select_related('studio', 'uploaded_by')

        # Filter by band if specified
        band_id = self.request.query_params.get('band', None)
        
        if band_id:
            # Filter resources for specific band
            qs = qs.filter(band_id=band_id)
        else:
            # Default: show only studio-level resources (not band-specific)
            qs = qs.filter(band__isnull=True)

        # Apply role-based permissions
        if user.role == 'admin':
            # Admin sees all resources in their studio(s)
            qs = qs.filter(studio__owner=user)
        elif hasattr(user, 'teacher_profile') and user.teacher_profile:
            # Teacher sees all resources in their studio
            studio = user.teacher_profile.studio
            qs = qs.filter(studio=studio)
        elif hasattr(user, 'student_profile') and user.student_profile:
            # Student sees public resources in their studio
            student = user.student_profile
            studio = student.studio
            qs = qs.filter(studio=studio, is_public=True)
        else:
            qs = qs.none()

        return qs

    def perform_create(self, serializer):
        """Assign studio and uploader based on user role"""
        user = self.request.user
        studio = None

        # Determine studio based on user role
        if hasattr(user, 'teacher_profile') and user.teacher_profile:
            studio = user.teacher_profile.studio
        elif hasattr(user, 'student_profile') and user.student_profile:
            studio = user.student_profile.studio
        elif user.role == 'admin':
            from apps.core.models import Studio
            studio = Studio.objects.filter(owner=user).first()

        if not studio:
            raise drf_serializers.ValidationError("Cannot determine studio context for this user")

        serializer.save(uploaded_by=user, studio=studio)
