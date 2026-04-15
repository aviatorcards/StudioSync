import os

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import filters, permissions
from rest_framework import serializers as drf_serializers
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from apps.core.models import Student, Teacher

from .models import Resource, ResourceFolder, Setlist, SetlistComment, SetlistResource
from .serializers import ResourceFolderSerializer, ResourceSerializer, SetlistCommentSerializer, SetlistSerializer

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

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def add_to_songbook(self, request, pk=None):
        """
        Adds a public resource to the current user's studio songbook.
        """
        original_resource = self.get_object()
        user = request.user
        studio = _get_studio_for_user(user)

        if not studio:
            return Response(
                {"detail": "User is not associated with a studio."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Clone the resource
        new_resource = original_resource
        new_resource.pk = None
        new_resource.studio = studio
        new_resource.uploaded_by = user
        new_resource.is_public = False
        new_resource.save()

        serializer = self.get_serializer(new_resource)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


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

        # 4. Handle Band filtering via query params
        # This allows the frontend to show "Band Repository" vs "General Library"
        band_param = self.request.query_params.get("band")
        if band_param:
            qs = qs.filter(band_id=band_param)
        else:
            # By default (in the main library), only show resources NOT assigned to a band
            # to prevent cluttering the main library with band-specific charts.
            qs = qs.filter(band__isnull=True)

        # 5. Handle Folder filtering
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


class SetlistViewSet(viewsets.ModelViewSet):
    """
    ViewSet for creating and managing songbook setlists.
    Supports band-scoped setlists with comments and approval workflows.
    """

    serializer_class = SetlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        studio = None

        try:
            if user.role == "teacher":
                studio = user.teacher_profile.studio
            elif user.role == "student":
                studio = user.student_profile.studio
            elif user.role == "admin":
                from apps.core.models import Studio

                studio = Studio.objects.filter(owner=user).first()
        except (Teacher.DoesNotExist, Student.DoesNotExist):
            return Setlist.objects.none()

        if not studio:
            return Setlist.objects.none()

        qs = Setlist.objects.filter(studio=studio).prefetch_related(
            "resources", "comments", "comments__user"
        ).select_related("band", "created_by")

        # Filter by band if query param is provided
        band_param = self.request.query_params.get("band")
        if band_param:
            qs = qs.filter(band_id=band_param)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        studio = _get_studio_for_user(user)
        if not studio:
            raise drf_serializers.ValidationError("Could not determine user's studio.")
        serializer.save(created_by=user, studio=studio)

    @action(detail=True, methods=["post"], url_path="add-item")
    def add_item(self, request, pk=None):
        """Add a song or break to a setlist. No file upload required."""
        setlist = self.get_object()

        title = request.data.get("title", "").strip()
        artist = request.data.get("artist", "").strip()
        item_type = request.data.get("item_type", "song")
        notes = request.data.get("notes", "")
        duration_minutes = request.data.get("duration_minutes")
        resource_id = request.data.get("resource_id")

        if item_type == "song" and not title:
            return Response(
                {"error": "Song title is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        if item_type == "break" and not title:
            title = "Break"

        order = setlist.setlistresource_set.count()

        item_data = {
            "setlist": setlist,
            "title": title,
            "artist": artist,
            "item_type": item_type,
            "notes": notes,
            "order": order,
        }

        if duration_minutes:
            try:
                item_data["duration_minutes"] = int(duration_minutes)
            except (ValueError, TypeError):
                pass

        if resource_id:
            try:
                resource = Resource.objects.get(id=resource_id, studio=setlist.studio)
                item_data["resource"] = resource
            except Resource.DoesNotExist:
                pass

        SetlistResource.objects.create(**item_data)
        return Response(SetlistSerializer(setlist).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="add-resource")
    def add_resource(self, request, pk=None):
        """Add a resource (chart/file) to a setlist as a song entry."""
        setlist = self.get_object()
        resource_id = request.data.get("resource_id")

        if not resource_id:
            return Response(
                {"error": "Resource ID is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            resource = Resource.objects.get(id=resource_id, studio=setlist.studio)
        except Resource.DoesNotExist:
            return Response(
                {"error": "Resource not found in this studio."}, status=status.HTTP_404_NOT_FOUND
            )

        order = setlist.setlistresource_set.count()
        notes = request.data.get("notes", "")
        SetlistResource.objects.create(
            setlist=setlist, resource=resource, order=order, notes=notes,
            title=resource.title, artist=resource.composer or "",
        )

        return Response(SetlistSerializer(setlist).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="remove-item")
    def remove_item(self, request, pk=None):
        """Remove an item from a setlist by its item ID."""
        setlist = self.get_object()
        item_id = request.data.get("item_id")

        if not item_id:
            return Response(
                {"error": "Item ID is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            item = SetlistResource.objects.get(id=item_id, setlist=setlist)
            item.delete()
        except SetlistResource.DoesNotExist:
            return Response(
                {"error": "Item not found in this setlist."}, status=status.HTTP_404_NOT_FOUND
            )

        # Re-number remaining items
        for i, item in enumerate(setlist.setlistresource_set.all()):
            item.order = i
            item.save()

        return Response(SetlistSerializer(setlist).data)

    @action(detail=True, methods=["post"], url_path="reorder")
    def reorder(self, request, pk=None):
        """Re-order items in a setlist by item IDs."""
        setlist = self.get_object()
        item_ids = request.data.get("item_ids", [])

        if not isinstance(item_ids, list):
            return Response(
                {"error": "`item_ids` must be a list."}, status=status.HTTP_400_BAD_REQUEST
            )

        for i, item_id in enumerate(item_ids):
            try:
                item = SetlistResource.objects.get(id=item_id, setlist=setlist)
                item.order = i
                item.save()
            except SetlistResource.DoesNotExist:
                pass

        return Response(SetlistSerializer(setlist).data)

    @action(detail=True, methods=["post"], url_path="comment")
    def add_comment(self, request, pk=None):
        """Add a comment to a setlist."""
        setlist = self.get_object()
        text = request.data.get("text", "").strip()
        is_approval = request.data.get("is_approval", False)

        if not text:
            return Response(
                {"error": "Comment text is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        comment = SetlistComment.objects.create(
            setlist=setlist,
            user=request.user,
            text=text,
            is_approval=is_approval,
        )

        # If approval and setlist is in proposed status, check if all members approved
        if is_approval and setlist.status == "proposed" and setlist.band:
            total_members = setlist.band.members.count()
            approval_count = setlist.comments.filter(
                is_approval=True
            ).values("user").distinct().count()
            if total_members > 0 and approval_count >= total_members:
                setlist.status = "confirmed"
                setlist.save()

        return Response(SetlistSerializer(setlist).data)

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        """Quick-approve a setlist (creates an approval comment)."""
        setlist = self.get_object()

        # Check if user already approved
        already_approved = SetlistComment.objects.filter(
            setlist=setlist, user=request.user, is_approval=True
        ).exists()

        if already_approved:
            return Response(
                {"error": "You have already approved this setlist."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        text = request.data.get("text", "Looks good. Let's ship! \U0001f3b8")
        SetlistComment.objects.create(
            setlist=setlist,
            user=request.user,
            text=text,
            is_approval=True,
        )

        # Auto-confirm if all band members have approved
        if setlist.band and setlist.status == "proposed":
            total_members = setlist.band.members.count()
            approval_count = setlist.comments.filter(
                is_approval=True
            ).values("user").distinct().count()
            if total_members > 0 and approval_count >= total_members:
                setlist.status = "confirmed"
                setlist.save()

        return Response(SetlistSerializer(setlist).data)

    @action(detail=True, methods=["post"], url_path="revoke-approval")
    def revoke_approval(self, request, pk=None):
        """Revoke a previous approval."""
        setlist = self.get_object()

        deleted, _ = SetlistComment.objects.filter(
            setlist=setlist, user=request.user, is_approval=True
        ).delete()

        if not deleted:
            return Response(
                {"error": "No approval found to revoke."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # If setlist was confirmed and someone revokes, revert to proposed
        if setlist.status == "confirmed":
            setlist.status = "proposed"
            setlist.save()

        return Response(SetlistSerializer(setlist).data)
