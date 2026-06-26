import pytest
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient
from apps.core.models import Band
from apps.gigs.models import BandAvailability, Gig, GigClaim, GigPayout


@pytest.fixture
def band(db, studio, student):
    # Create a band for the student
    band = Band.objects.create(
        studio=studio,
        primary_contact=student.user,
        name="Test Rock Band",
        billing_email="band@test.com"
    )
    student.bands.add(band)
    return band


@pytest.fixture
def test_gig(db, studio):
    return Gig.objects.create(
        studio=studio,
        title="Rock Show",
        venue="The Club",
        scheduled_start=timezone.now() + timezone.timedelta(days=1),
        scheduled_end=timezone.now() + timezone.timedelta(days=1, hours=2),
        status="open",
        pay_rate=200.00,
        pay_type="flat"
    )


def test_create_gig(admin_user, studio):
    client = APIClient()
    client.force_authenticate(user=admin_user)
    
    url = "/api/gigs/gigs/"
    data = {
        "studio": str(studio.id),
        "title": "Jazz Night",
        "venue": "Blue Note",
        "scheduled_start": (timezone.now() + timezone.timedelta(days=2)).isoformat(),
        "scheduled_end": (timezone.now() + timezone.timedelta(days=2, hours=3)).isoformat(),
        "pay_rate": "150.00",
        "pay_type": "flat",
        "status": "open"
    }
    response = client.post(url, data, format="json")
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["title"] == "Jazz Night"


def test_claim_gig(student_user, test_gig, band):
    client = APIClient()
    client.force_authenticate(user=student_user)
    
    url = f"/api/gigs/gigs/{test_gig.id}/claim/"
    data = {"band_id": str(band.id), "notes": "We would love to play!"}
    response = client.post(url, data, format="json")
    
    assert response.status_code == status.HTTP_201_CREATED
    test_gig.refresh_from_db()
    assert test_gig.status == "pending_approval"
    assert GigClaim.objects.filter(gig=test_gig, band=band).exists()


def test_approve_claim(admin_user, student_user, test_gig, band):
    # Claim first using student client
    student_client = APIClient()
    student_client.force_authenticate(user=student_user)
    
    claim_url = f"/api/gigs/gigs/{test_gig.id}/claim/"
    student_client.post(claim_url, {"band_id": str(band.id)}, format="json")
    
    claim = GigClaim.objects.get(gig=test_gig, band=band)
    
    # Approve using admin client
    admin_client = APIClient()
    admin_client.force_authenticate(user=admin_user)
    
    approve_url = f"/api/gigs/gigs/{test_gig.id}/approve_claim/"
    response = admin_client.post(approve_url, {"claim_id": str(claim.id)}, format="json")
    
    assert response.status_code == status.HTTP_200_OK
    test_gig.refresh_from_db()
    assert test_gig.status == "assigned"
    assert test_gig.band == band
    claim.refresh_from_db()
    assert claim.status == "approved"


def test_payout(admin_user, student_user, test_gig, band):
    # Claim first using student client
    student_client = APIClient()
    student_client.force_authenticate(user=student_user)
    claim_url = f"/api/gigs/gigs/{test_gig.id}/claim/"
    student_client.post(claim_url, {"band_id": str(band.id)}, format="json")
    
    claim = GigClaim.objects.get(gig=test_gig, band=band)
    
    # Approve using admin client
    admin_client = APIClient()
    admin_client.force_authenticate(user=admin_user)
    
    approve_url = f"/api/gigs/gigs/{test_gig.id}/approve_claim/"
    admin_client.post(approve_url, {"claim_id": str(claim.id)}, format="json")
    
    # Payout using admin client
    payout_url = f"/api/gigs/gigs/{test_gig.id}/payout/"
    response = admin_client.post(payout_url, {"amount": 250.00, "payment_method": "cash"}, format="json")
    
    assert response.status_code == status.HTTP_200_OK
    test_gig.refresh_from_db()
    assert test_gig.status == "completed"
    
    payout = GigPayout.objects.get(gig=test_gig)
    assert payout.amount == 250.00
    assert payout.status == "processed"
    assert payout.payment is not None
    assert payout.payment.invoice.total_amount == 250.00
    assert payout.payment.status == "completed"
