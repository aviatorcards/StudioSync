"""Locale helpers for the signed-in user, emails, and notifications."""

from __future__ import annotations

import zoneinfo

from django.utils import timezone, translation
from django.utils.formats import date_format

SUPPORTED_LANGUAGE_CODES = ("en", "de")
DEFAULT_LANGUAGE = "en"


def normalize_language(code) -> str:
    """Map a cookie, header, or stored value onto a language we ship."""
    if not code:
        return DEFAULT_LANGUAGE
    primary = str(code).replace("_", "-").split("-", 1)[0].lower()
    if primary in SUPPORTED_LANGUAGE_CODES:
        return primary
    return DEFAULT_LANGUAGE


def language_for_user(user) -> str:
    """Saved preference, or English when the user has not chosen one."""
    if user is None:
        return DEFAULT_LANGUAGE
    saved = getattr(user, "language", "") or ""
    if not saved:
        return DEFAULT_LANGUAGE
    return normalize_language(saved)


def format_when(value, user=None) -> str:
    """Locale-aware date and time in the user's timezone.

    Call this while the recipient's language is active so month and
    day-period names follow that catalog.
    """
    if value is None:
        return ""
    tz = None
    zone_name = getattr(user, "timezone", None) if user is not None else None
    if zone_name:
        try:
            tz = zoneinfo.ZoneInfo(zone_name)
        except (zoneinfo.ZoneInfoNotFoundError, ValueError):
            tz = None
    if timezone.is_naive(value):
        value = timezone.make_aware(value, timezone.get_current_timezone())
    local = timezone.localtime(value, tz) if tz else timezone.localtime(value)
    return date_format(local, "DATETIME_FORMAT")


class UserLanguageMiddleware:
    """Prefer a saved account language over the request cookie.

    DRF authenticates inside the view, so API calls still follow
    LocaleMiddleware (the django_language cookie or Accept-Language).
    This middleware covers session users, including the Django admin.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = getattr(request, "user", None)
        saved = ""
        if getattr(user, "is_authenticated", False):
            saved = getattr(user, "language", "") or ""
        if saved:
            language = normalize_language(saved)
            translation.activate(language)
            request.LANGUAGE_CODE = language
        return self.get_response(request)
