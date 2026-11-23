"""HttpOnly session cookies for browser clients."""

import hmac
import secrets

from django.conf import settings
from rest_framework.exceptions import PermissionDenied

ACCESS_COOKIE = "studiosync_access"
REFRESH_COOKIE = "studiosync_refresh"
CSRF_COOKIE = "studiosync_csrf"
CSRF_HEADER = "X-CSRFToken"
ACCESS_MAX_AGE = 60 * 60
REFRESH_MAX_AGE = 7 * 24 * 60 * 60


def cookie_secure(request) -> bool:
    return bool(getattr(settings, "IS_HTTPS", False) or request.is_secure())


def wants_token_body(request) -> bool:
    """Non-browser clients can still ask for JSON tokens. The web app does not."""
    return request.headers.get("X-Return-Tokens", "").lower() in {"1", "true", "yes"}


def set_auth_cookies(response, request, access: str, refresh: str | None = None):
    secure = cookie_secure(request)
    response.set_cookie(
        ACCESS_COOKIE,
        access,
        max_age=ACCESS_MAX_AGE,
        httponly=True,
        secure=secure,
        samesite="Lax",
        path="/",
    )
    if refresh:
        response.set_cookie(
            REFRESH_COOKIE,
            refresh,
            max_age=REFRESH_MAX_AGE,
            httponly=True,
            secure=secure,
            samesite="Lax",
            path="/api/auth/",
        )
    response.set_cookie(
        CSRF_COOKIE,
        secrets.token_urlsafe(32),
        max_age=REFRESH_MAX_AGE,
        httponly=False,
        secure=secure,
        samesite="Lax",
        path="/",
    )
    return response


def clear_auth_cookies(response):
    response.delete_cookie(ACCESS_COOKIE, path="/", samesite="Lax")
    response.delete_cookie(REFRESH_COOKIE, path="/api/auth/", samesite="Lax")
    response.delete_cookie(CSRF_COOKIE, path="/", samesite="Lax")
    return response


def enforce_csrf(request):
    """Double-submit check for cookie-authenticated writes."""
    if request.method in ("GET", "HEAD", "OPTIONS", "TRACE"):
        return
    cookie = request.COOKIES.get(CSRF_COOKIE, "")
    header = request.headers.get(CSRF_HEADER, "")
    if not cookie or not header or not hmac.compare_digest(str(cookie), str(header)):
        raise PermissionDenied("CSRF check failed.")
