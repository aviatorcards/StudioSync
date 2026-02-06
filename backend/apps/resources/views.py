from rest_framework import viewsets, permissions, filters, status, serializers as drf_serializers
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Resource, Setlist, SetlistResource
from .serializers import ResourceSerializer, SetlistSerializer, SetlistResourceSerializer
from apps.core.models import Teacher, Student

class PublicResourceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for accessing public resources (read-only).
    """
    serializer_class = ResourceSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    filterset_fields = ['resource_type', 'instrument', 'skill_level', 'category']
    search_fields = ['title', 'description', 'tags', 'composer']
    ordering_fields = ['created_at', 'title']

    def get_queryset(self):
        """
        This view should return a list of all the public resources
        for any user, even if they are not authenticated.
        """
        return Resource.objects.filter(is_public=True).select_related('studio', 'uploaded_by')

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_to_songbook(self, request, pk=None):
        """
        Adds a public resource to the current user's studio songbook.
        """
        original_resource = self.get_object()
        user = request.user
        studio = None

        if hasattr(user, 'teacher_profile') and user.teacher_profile:
            studio = user.teacher_profile.studio
        elif hasattr(user, 'student_profile') and user.student_profile:
            studio = user.student_profile.studio
        elif user.role == 'admin':
            from apps.core.models import Studio
            studio = Studio.objects.filter(owner=user).first()

        if not studio:
            return Response({'detail': 'User is not associated with a studio.'}, status=status.HTTP_400_BAD_REQUEST)

        # Clone the resource
        new_resource = original_resource
        new_resource.pk = None
        new_resource.studio = studio
        new_resource.uploaded_by = user
        new_resource.is_public = False # Private by default in the user's songbook
        new_resource.save()

        serializer = self.get_serializer(new_resource)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


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


class SetlistViewSet(viewsets.ModelViewSet):
    """
    ViewSet for creating and managing songbook setlists.
    """
    serializer_class = SetlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Users can only see setlists belonging to their studio.
        """
        user = self.request.user
        studio = None

        try:
            if user.role == 'teacher':
                studio = user.teacher_profile.studio
            elif user.role == 'student':
                studio = user.student_profile.studio
            elif user.role == 'admin':
                from apps.core.models import Studio
                studio = Studio.objects.filter(owner=user).first()
        except (Teacher.DoesNotExist, Student.DoesNotExist):
            return Setlist.objects.none()

        if not studio:
            return Setlist.objects.none()

        return Setlist.objects.filter(studio=studio).prefetch_related('resources')

    def perform_create(self, serializer):
        """
        Automatically associate the setlist with the user's studio.
        """
        user = self.request.user
        studio = None
        if hasattr(user, 'teacher_profile') and user.teacher_profile:
            studio = user.teacher_profile.studio
        elif user.role == 'admin':
            from apps.core.models import Studio
            studio = Studio.objects.filter(owner=user).first()

        if not studio:
            raise drf_serializers.ValidationError("Could not determine user's studio.")

        serializer.save(created_by=user, studio=studio)

    @action(detail=True, methods=['post'], url_path='add-resource')
    def add_resource(self, request, pk=None):
        """
        Add a resource to a setlist.
        """
        setlist = self.get_object()
        resource_id = request.data.get('resource_id')

        if not resource_id:
            return Response(
                {'error': 'Resource ID is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            resource = Resource.objects.get(id=resource_id, studio=setlist.studio)
        except Resource.DoesNotExist:
            return Response(
                {'error': 'Resource not found in this studio.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Add the resource to the end of the setlist
        order = setlist.resources.count()
        SetlistResource.objects.create(
            setlist=setlist,
            resource=resource,
            order=order
        )

        return Response(SetlistSerializer(setlist).data)

    @action(detail=True, methods=['post'], url_path='remove-resource')
    def remove_resource(self, request, pk=None):
        """
        Remove a resource from a setlist.
        """
        setlist = self.get_object()
        resource_id = request.data.get('resource_id')

        if not resource_id:
            return Response(
                {'error': 'Resource ID is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            item = SetlistResource.objects.get(
                setlist=setlist,
                resource_id=resource_id
            )
            item.delete()
        except SetlistResource.DoesNotExist:
            return Response(
                {'error': 'Resource not found in this setlist.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Re-order the remaining items
        for i, item in enumerate(setlist.setlistresource_set.all()):
            item.order = i
            item.save()

        return Response(SetlistSerializer(setlist).data)

    @action(detail=True, methods=['post'], url_path='reorder')
    def reorder(self, request, pk=None):
        """
        Re-order the resources in a setlist.
        Expects a list of resource IDs in the desired order.
        """
        setlist = self.get_object()
        resource_ids = request.data.get('resource_ids', [])

        if not isinstance(resource_ids, list):
            return Response(
                {'error': '`resource_ids` must be a list.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update the order for each resource
        for i, resource_id in enumerate(resource_ids):
            try:
                item = SetlistResource.objects.get(
                    setlist=setlist,
                    resource_id=resource_id
                )
                item.order = i
                item.save()
            except SetlistResource.DoesNotExist:
                # This could happen if a resource ID is invalid.
                # We'll just ignore it and continue.
                pass
        
        return Response(SetlistSerializer(setlist).data)
