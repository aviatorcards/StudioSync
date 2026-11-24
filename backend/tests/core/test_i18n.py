"""Language preference and catalog wiring."""

from types import SimpleNamespace

import pytest
from django.utils import translation
from django.utils.translation import gettext
from rest_framework import status

from apps.core.i18n import UserLanguageMiddleware, format_when, normalize_language


@pytest.mark.django_db
def test_user_language_round_trip(authenticated_client, admin_user):
    assert admin_user.language == ""

    response = authenticated_client.patch("/api/core/users/me/", {"language": "de"}, format="json")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["language"] == "de"

    admin_user.refresh_from_db()
    assert admin_user.language == "de"

    cleared = authenticated_client.patch("/api/core/users/me/", {"language": ""}, format="json")
    assert cleared.status_code == status.HTTP_200_OK
    assert cleared.data["language"] == ""


@pytest.mark.django_db
def test_unknown_language_is_rejected(authenticated_client):
    response = authenticated_client.patch("/api/core/users/me/", {"language": "fr"}, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_saved_language_activates_for_the_request():
    user = SimpleNamespace(is_authenticated=True, language="de")
    request = SimpleNamespace(user=user)
    seen = {}

    def get_response(req):
        seen["language"] = translation.get_language()
        return SimpleNamespace()

    UserLanguageMiddleware(get_response)(request)
    assert seen["language"] == "de"
    assert request.LANGUAGE_CODE == "de"


def test_blank_language_does_not_override_the_request():
    user = SimpleNamespace(is_authenticated=True, language="")
    request = SimpleNamespace(user=user, LANGUAGE_CODE="en")

    def get_response(req):
        return SimpleNamespace()

    with translation.override("en"):
        UserLanguageMiddleware(get_response)(request)
        assert translation.get_language() == "en"


def test_german_stub_catalog_resolves_a_marked_string():
    with translation.override("de"):
        assert gettext("Password Reset Request") == "Passwort zurücksetzen (STUB)"
    with translation.override("en"):
        assert gettext("Password Reset Request") == "Password Reset Request"


def test_format_when_follows_the_active_locale():
    from datetime import datetime

    from django.utils import timezone

    moment = timezone.make_aware(datetime(2026, 3, 15, 15, 30))
    user = SimpleNamespace(timezone="Europe/Berlin")
    with translation.override("de"):
        german = format_when(moment, user)
    with translation.override("en"):
        english = format_when(moment, user)
    assert german != english
    assert normalize_language("de-DE") == "de"
    assert normalize_language("zz") == "en"
