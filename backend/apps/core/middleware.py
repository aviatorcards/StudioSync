import logging

from django.contrib.auth.models import AnonymousUser

from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken

from apps.core.models import User

from urllib.parse import unquote

logger = logging.getLogger(__name__)


@database_sync_to_async
def get_user(token_key):
    try:
        # Decode token if it was URL encoded
        token_key = unquote(token_key)
        # Validate token
        access_token = AccessToken(token_key)
        user_id = access_token.payload.get("user_id")
        user = User.objects.get(id=user_id)
        if not user.is_active or not user.is_approved:
            return AnonymousUser()
        return user
    except Exception as e:
        logger.error(f"WebSocket JWT Auth Error: {e}")
        return AnonymousUser()


class TokenAuthMiddleware:
    """
    Custom middleware that takes a token from the query string and authenticates the user.
    """

    def __init__(self, inner):
        self.inner = inner

    def _token_from_scope(self, scope):
        cookies = {}
        for key, value in scope.get("headers") or []:
            if key.lower() != b"cookie":
                continue
            for part in value.decode(errors="ignore").split(";"):
                if "=" not in part:
                    continue
                name, raw = part.split("=", 1)
                cookies[name.strip()] = unquote(raw.strip())
        if cookies.get("studiosync_access"):
            return cookies["studiosync_access"]
        query_string = scope.get("query_string", b"").decode()
        query_params = dict(qp.split("=", 1) for qp in query_string.split("&") if "=" in qp)
        return query_params.get("token")

    async def __call__(self, scope, receive, send):
        token_key = self._token_from_scope(scope)

        if token_key:
            scope["user"] = await get_user(token_key)
        else:
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)
