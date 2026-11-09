"""Setup wizard tests against the current first-run API."""

import pytest
from django.urls import reverse
from rest_framework import status

from apps.core.models import SetupStatus, Studio


VALID_PAYLOAD = {
    "studio_name": "New Music Studio",
    "studio_email": "newstudio@test.com",
    "studio_phone": "555-0123",
    "address_line1": "456 Music Ave",
    "city": "Music City",
    "state": "MC",
    "postal_code": "12345",
    "admin_email": "owner@newstudio.test",
    "admin_first_name": "Ada",
    "admin_last_name": "Lovelace",
    "admin_password": "Secur3P@ss!",
}


@pytest.mark.django_db
class TestSetupWizard:
    def test_check_setup_status_incomplete(self, api_client):
        url = reverse("setup-status")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["is_completed"] is False
        assert response.data["setup_required"] is True

    def test_check_setup_status_complete(self, api_client, studio):
        SetupStatus.objects.create(is_completed=True)
        url = reverse("setup-status")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["is_completed"] is True

    def test_complete_setup_wizard_success(self, api_client):
        url = reverse("setup-complete")
        response = api_client.post(url, VALID_PAYLOAD, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert Studio.objects.filter(name="New Music Studio").exists()
        assert response.data["tokens"]["access"]

    def test_complete_setup_wizard_missing_data(self, api_client):
        url = reverse("setup-complete")
        response = api_client.post(url, {"studio_name": "Incomplete Studio"}, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_complete_setup_wizard_is_single_use(self, api_client):
        url = reverse("setup-complete")
        first = api_client.post(url, VALID_PAYLOAD, format="json")
        assert first.status_code == status.HTTP_201_CREATED

        second = api_client.post(
            url,
            {**VALID_PAYLOAD, "admin_email": "other@newstudio.test", "studio_name": "Second"},
            format="json",
        )
        assert second.status_code == status.HTTP_400_BAD_REQUEST
