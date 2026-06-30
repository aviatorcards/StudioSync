import hashlib
import logging
import secrets

from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.decorators import action
from rest_framework.mixins import ListModelMixin
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from apps.core.models import APIKey, Studio
from apps.core.serializers import APIKeyCreateSerializer, APIKeySerializer

logger = logging.getLogger(__name__)


class APIKeyViewSet(ListModelMixin, GenericViewSet):
    serializer_class = APIKeySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        studio = Studio.objects.filter(owner=self.request.user).first()
        if not studio:
            return APIKey.objects.none()
        return APIKey.objects.filter(studio=studio)

    def create(self, request):
        serializer = APIKeyCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        studio = Studio.objects.filter(owner=request.user).first()
        if not studio:
            return Response({"detail": "No studio found."}, status=status.HTTP_400_BAD_REQUEST)

        raw_key = "ss_" + secrets.token_hex(32)
        prefix = raw_key[:16]  # "ss_" + 13 hex chars
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()

        api_key = APIKey.objects.create(
            studio=studio,
            created_by=request.user,
            name=serializer.validated_data["name"],
            prefix=prefix,
            key_hash=key_hash,
        )

        return Response(
            {
                "id": str(api_key.id),
                "name": api_key.name,
                "key": raw_key,  # returned ONCE — never stored in plaintext
                "prefix": prefix,
                "created_at": api_key.created_at,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def revoke(self, request, pk=None):
        api_key = self.get_object()
        api_key.is_active = False
        api_key.revoked_at = timezone.now()
        api_key.save(update_fields=["is_active", "revoked_at"])
        return Response({"status": "revoked"})
