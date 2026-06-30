import os

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import filters, permissions
from rest_framework import serializers as drf_serializers
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response


from .models import Resource, ResourceFolder
from .serializers import ResourceFolderSerializer, ResourceSerializer

from django.db.models import Q

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _detect_resource_type(file) -> str:
    """Derive a resource_type string from a file's content_type."""
    content_type = getattr(file, "content_type", "") or ""
    if content_type == "application/pdf":
        return "pdf"
    for prefix, rtype in [("audio/", "audio"), ("video/", "video"), ("image/", "image")]:
        if content_type.startswith(prefix):
            return rtype
    return "other"


def _get_studio_for_user(user):
    """Return the studio associated with the requesting user, or None."""
    if hasattr(user, "teacher_profile") and user.teacher_profile:
        return user.teacher_profile.studio
    if hasattr(user, "student_profile") and user.student_profile:
        return user.student_profile.studio
    if user.role == "admin":
        from apps.core.models import Studio

        # Try to find studio by owner
        studio = Studio.objects.filter(owner=user).first()
        if studio:
            return studio
        # Fallback: find any studio this user might be part of via profiles (if they have one)
        # or just the first studio in the system if there's only one (dev mode)
        return Studio.objects.first()
    return None


# ---------------------------------------------------------------------------
# ViewSets
# ---------------------------------------------------------------------------


class PublicResourceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for accessing public resources (read-only).
    """

    serializer_class = ResourceSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    filterset_fields = ["resource_type", "instrument", "category"]

    search_fields = ["title", "description", "tags", "composer"]
    ordering_fields = ["created_at", "title"]

    def get_queryset(self):
        return Resource.objects.filter(is_public=True).select_related("studio", "uploaded_by")



class ResourceFolderViewSet(viewsets.ModelViewSet):
    """
    CRUD for virtual resource folders, scoped to the user's studio.
    """

    serializer_class = ResourceFolderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    filterset_fields = ["parent"]
    search_fields = ["name"]

    def get_queryset(self):
        user = self.request.user
        studio = _get_studio_for_user(user)
        if not studio:
            return ResourceFolder.objects.none()
        return ResourceFolder.objects.filter(studio=studio).prefetch_related("children")

    def perform_create(self, serializer):
        user = self.request.user
        studio = _get_studio_for_user(user)
        if not studio:
            raise drf_serializers.ValidationError("Cannot determine studio context for this user.")
        serializer.save(created_by=user, studio=studio)


class ResourceViewSet(viewsets.ModelViewSet):
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    filterset_fields = ["resource_type", "instrument", "category", "folder"]

    search_fields = ["title", "description", "tags", "composer"]
    ordering_fields = ["created_at", "title"]

    def get_queryset(self):
        user = self.request.user
        # Optimize with select_related
        qs = Resource.objects.select_related("studio", "uploaded_by", "folder", "band")

        # 1. Determine the Studio context
        studio = _get_studio_for_user(user)
        if not studio:
            # Fallback for superusers if they don't have a studio-specific role
            if user.is_staff or user.is_superuser:
                # Return everything if admin/staff and no studio context, 
                # but usually they should be linked.
                pass
            else:
                return Resource.objects.none()

        # 2. Filter by studio if we found one
        if studio:
            qs = qs.filter(studio=studio)

        # 3. Role-based visibility
        if user.role == "student" and hasattr(user, "student_profile"):
            student = user.student_profile
            # Students can see:
            # - Public resources in their studio
            # - Resources assigned to bands they are members of
            # - Resources shared with them individually
            qs = qs.filter(
                Q(is_public=True) | 
                Q(band__in=student.bands.all()) | 
                Q(shared_with_students=student)
            ).distinct()
        # Admin and Teachers see all resources within their studio context

        # 4 & 5. Band/folder filtering only applies to list — detail actions (retrieve,
        # update, destroy) must be able to find any studio-scoped resource regardless
        # of whether it belongs to a band or folder.
        if self.action == "list":
            band_param = self.request.query_params.get("band")
            if band_param:
                qs = qs.filter(band_id=band_param)
            else:
                qs = qs.filter(band__isnull=True)

            folder_param = self.request.query_params.get("folder")
            if folder_param == "root":
                qs = qs.filter(folder__isnull=True)
            elif folder_param:
                qs = qs.filter(folder_id=folder_param)

        return qs

    def perform_create(self, serializer):
        """Assign studio and uploader based on user role."""
        user = self.request.user
        studio = _get_studio_for_user(user)
        if not studio:
            raise drf_serializers.ValidationError("Cannot determine studio context for this user")
        serializer.save(uploaded_by=user, studio=studio)

    @action(
        detail=False,
        methods=["post"],
        url_path="bulk-upload",
        parser_classes=[MultiPartParser, FormParser],
    )
    def bulk_upload(self, request):
        """
        Upload multiple files in a single request.

        Expected multipart fields:
          - files           – one or more file fields (repeat the key for each file)
          - resource_type   – optional; auto-detected from MIME type when missing
          - category        – optional shared category for all files
          - folder          – optional UUID of target ResourceFolder
          - description     – optional shared description
        """
        user = request.user
        studio = _get_studio_for_user(user)
        if not studio:
            return Response(
                {"detail": "Cannot determine studio context for this user."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        files = request.FILES.getlist("files")
        if not files:
            return Response(
                {"detail": "No files provided. Send at least one file under the key 'files'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Optional shared metadata
        shared_category = request.data.get("category", "")
        shared_description = request.data.get("description", "")
        folder_id = request.data.get("folder", None)
        explicit_type = request.data.get("resource_type", None)

        # Resolve folder
        folder = None
        if folder_id:
            try:
                folder = ResourceFolder.objects.get(id=folder_id, studio=studio)
            except ResourceFolder.DoesNotExist:
                return Response(
                    {"detail": f"Folder '{folder_id}' not found in this studio."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        created = []
        errors = []

        for file in files:
            resource_type = explicit_type or _detect_resource_type(file)
            # Derive a clean title from the filename
            title = os.path.splitext(file.name)[0].replace("_", " ").replace("-", " ").strip()

            resource = Resource(
                studio=studio,
                uploaded_by=user,
                title=title,
                description=shared_description,
                resource_type=resource_type,
                category=shared_category,
                folder=folder,
                file=file,
                file_size=file.size,
                mime_type=getattr(file, "content_type", ""),
            )
            try:
                resource.full_clean(exclude=["studio", "uploaded_by"])
                resource.save()
                created.append(resource)
            except Exception as exc:  # noqa: BLE001
                errors.append({"file": file.name, "error": str(exc)})

        serializer = ResourceSerializer(created, many=True, context={"request": request})
        response_data = {"created": serializer.data}
        if errors:
            response_data["errors"] = errors

        http_status = status.HTTP_201_CREATED if created else status.HTTP_400_BAD_REQUEST
        return Response(response_data, status=http_status)


