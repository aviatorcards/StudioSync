import hashlib
import logging

from django.conf import settings
from django.utils import timezone
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

from apps.core.auth_cookies import ACCESS_COOKIE, enforce_csrf

logger = logging.getLogger(__name__)

GENERIC_AUTH_DETAIL = "No active account found with the given credentials"


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

        if api_key.access == "read" and request.method not in ("GET", "HEAD", "OPTIONS"):
            raise PermissionDenied("This API key is read-only.")

        user = api_key.created_by
        if user is None or not user.is_active or not user.is_approved:
            raise AuthenticationFailed(GENERIC_AUTH_DETAIL)

        APIKey.objects.filter(pk=api_key.pk).update(last_used_at=timezone.now())
        # Views must scope querysets to this studio instead of the user's other studios.
        request.studio = api_key.studio
        return (user, api_key)

    def authenticate_header(self, request):
        return 'Bearer realm="StudioSync API"'


class ApprovedJWTAuthentication(JWTAuthentication):
    """JWT auth that rejects unapproved accounts and accepts the httpOnly access cookie.

    A bearer token is for API clients. The cookie is for the browser. Cookie
    writes must also present the double-submit CSRF header.
    """

    def authenticate(self, request):
        header = self.get_header(request)
        if header is not None:
            raw = self.get_raw_token(header)
            if raw is None:
                return None
            validated = self.get_validated_token(raw)
            user = self.get_user(validated)
            self._require_approved(user)
            return user, validated

        raw = request.COOKIES.get(getattr(settings, "AUTH_ACCESS_COOKIE", ACCESS_COOKIE))
        if not raw:
            return None
        try:
            validated = self.get_validated_token(raw)
        except InvalidToken:
            # An expired cookie must not block anonymous requests such as login.
            return None
        user = self.get_user(validated)
        self._require_approved(user)
        enforce_csrf(request)
        return user, validated

    def _require_approved(self, user):
        if not user.is_active or not getattr(user, "is_approved", False):
            raise AuthenticationFailed(GENERIC_AUTH_DETAIL, code="no_active_account")
