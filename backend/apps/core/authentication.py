import hashlib
import logging

from django.utils import timezone
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

logger = logging.getLogger(__name__)


class APIKeyAuthentication(BaseAuthentication):
    """
    Authenticate via a StudioSync API key sent as:
      Authorization: Bearer ss_<key>
    or:
      X-Api-Key: ss_<key>
    """

    def authenticate(self, request):
        from .models import APIKey

        key = None
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if auth_header.startswith("Bearer ss_"):
            key = auth_header[len("Bearer "):]
        elif request.META.get("HTTP_X_API_KEY", "").startswith("ss_"):
            key = request.META["HTTP_X_API_KEY"]

        if not key:
            return None

        key_hash = hashlib.sha256(key.encode()).hexdigest()
        try:
            api_key = (
                APIKey.objects.select_related("created_by", "studio")
                .get(key_hash=key_hash, is_active=True)
            )
        except APIKey.DoesNotExist:
            raise AuthenticationFailed("Invalid API key.")

        if api_key.revoked_at:
            raise AuthenticationFailed("API key has been revoked.")

        APIKey.objects.filter(pk=api_key.pk).update(last_used_at=timezone.now())
        # Attach studio for multi-tenancy enforcement downstream
        request.studio = api_key.studio
        return (api_key.created_by, api_key)

    def authenticate_header(self, request):
        return 'Bearer realm="StudioSync API"'
