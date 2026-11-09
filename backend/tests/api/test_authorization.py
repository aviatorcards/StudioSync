"""Authorization regressions for the security review."""

from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.billing.models import Invoice
from apps.core.models import Family, Student, Studio, User
from apps.lessons.models import Lesson


def _auth(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


def _user(email, role, **extra):
    return User.objects.create_user(
        email=email,
        password="testpass123",
        first_name="Test",
        last_name=role.title(),
        role=role,
        is_approved=True,
        **extra,
    )


@pytest.fixture
def school(db):
    owner = _user("owner-a@test.com", "admin")
    studio = Studio.objects.create(name="School A", owner=owner, email="a@test.com")
    return owner, studio


@pytest.fixture
def other_school(db):
    owner = _user("owner-b@test.com", "admin")
    studio = Studio.objects.create(name="School B", owner=owner, email="b@test.com")
    return owner, studio


@pytest.mark.django_db
def test_user_cannot_escalate_role_via_me(school):
    owner, studio = school
    student_user = _user("pupil@test.com", "student")
    Student.objects.create(user=student_user, studio=studio, instrument="Piano")
    client = _auth(student_user)

    response = client.patch(
        "/api/core/users/me/",
        {"role": "admin", "is_approved": True, "is_active": True},
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    student_user.refresh_from_db()
    assert student_user.role == "student"
    assert response.data["role"] == "student"


@pytest.mark.django_db
def test_student_cannot_update_or_delete_studio(school):
    owner, studio = school
    student_user = _user("pupil2@test.com", "student")
    Student.objects.create(user=student_user, studio=studio, instrument="Violin")
    client = _auth(student_user)

    update = client.patch(f"/api/core/studios/{studio.id}/", {"name": "Hijacked"}, format="json")
    assert update.status_code == status.HTTP_403_FORBIDDEN

    delete = client.delete(f"/api/core/studios/{studio.id}/")
    assert delete.status_code == status.HTTP_403_FORBIDDEN
    assert Studio.objects.filter(pk=studio.pk).exists()


@pytest.mark.django_db
def test_student_cannot_read_other_family_or_medical_notes(school):
    owner, studio = school
    parent_a = _user("parent-a@test.com", "parent")
    parent_b = _user("parent-b@test.com", "parent")
    family_a = Family.objects.create(studio=studio, primary_parent=parent_a, billing_email="a@test.com")
    family_b = Family.objects.create(
        studio=studio,
        primary_parent=parent_b,
        billing_email="b@test.com",
        emergency_contact_name="Secret Contact",
        emergency_contact_phone="555-0100",
    )
    pupil = _user("pupil3@test.com", "student")
    other = _user("other-pupil@test.com", "student")
    student = Student.objects.create(
        user=pupil, studio=studio, family=family_a, instrument="Piano", medical_notes="Allergy"
    )
    Student.objects.create(
        user=other,
        studio=studio,
        family=family_b,
        instrument="Drums",
        medical_notes="Seizures",
        birth_date="2014-01-01",
    )

    client = _auth(pupil)
    families = client.get("/api/students/families/")
    assert families.status_code == status.HTTP_200_OK
    rows = families.data["results"] if isinstance(families.data, dict) else families.data
    ids = {row["id"] for row in rows}
    assert str(family_a.id) in ids or family_a.id in ids
    assert str(family_b.id) not in ids and family_b.id not in ids

    # A bandmate detail response must not include medical fields. This student
    # is not a bandmate, so the record is hidden entirely.
    hidden = client.get(f"/api/students/{other.student_profile.id}/")
    assert hidden.status_code == status.HTTP_404_NOT_FOUND

    own = client.get(f"/api/students/{student.id}/")
    assert own.status_code == status.HTTP_200_OK
    assert own.data["medical_notes"] == "Allergy"


@pytest.mark.django_db
def test_checkout_requires_invoice_ownership(school, other_school):
    owner, studio = school
    _other_owner, other = other_school
    pupil = _user("payer@test.com", "student")
    student = Student.objects.create(user=pupil, studio=studio, instrument="Piano")
    own_invoice = Invoice.objects.create(
        studio=studio, student=student, due_date=timezone.now().date(), total_amount="40.00"
    )
    foreign = Invoice.objects.create(
        studio=other, due_date=timezone.now().date(), total_amount="80.00"
    )
    client = _auth(pupil)

    denied = client.post(f"/api/billing/create-checkout-session/{foreign.id}/")
    assert denied.status_code == status.HTTP_404_NOT_FOUND

    # Stripe is not configured in tests. Ownership passes, then the view refuses
    # to start a session rather than leaking the other studio's invoice.
    allowed = client.post(f"/api/billing/create-checkout-session/{own_invoice.id}/")
    assert allowed.status_code == status.HTTP_503_SERVICE_UNAVAILABLE


@pytest.mark.django_db
def test_lists_are_scoped_to_the_callers_studio(school, other_school):
    owner, studio = school
    other_owner, other = other_school
    local = _user("local-student@test.com", "student")
    remote = _user("remote-student@test.com", "student")
    Student.objects.create(user=local, studio=studio, instrument="Piano")
    Student.objects.create(user=remote, studio=other, instrument="Cello")

    client = _auth(owner)
    response = client.get("/api/core/students/")
    assert response.status_code == status.HTTP_200_OK
    rows = response.data["results"] if isinstance(response.data, dict) else response.data
    emails = {row["email"] for row in rows}
    assert "local-student@test.com" in emails
    assert "remote-student@test.com" not in emails

    foreign_studio = client.get(f"/api/core/studios/{other.id}/")
    assert foreign_studio.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_student_cannot_edit_lesson_status_or_rate(school):
    owner, studio = school
    teacher_user = _user("teacher-a@test.com", "teacher")
    from apps.core.models import Teacher

    teacher = Teacher.objects.create(user=teacher_user, studio=studio)
    pupil = _user("lesson-pupil@test.com", "student")
    student = Student.objects.create(user=pupil, studio=studio, primary_teacher=teacher, instrument="Piano")
    start = timezone.now() + timedelta(days=1)
    lesson = Lesson.objects.create(
        studio=studio,
        teacher=teacher,
        student=student,
        scheduled_start=start,
        scheduled_end=start + timedelta(minutes=30),
        status="scheduled",
        rate="50.00",
    )
    client = _auth(pupil)
    response = client.patch(
        f"/api/lessons/{lesson.id}/",
        {"status": "completed", "rate": "1.00"},
        format="json",
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
    lesson.refresh_from_db()
    assert lesson.status == "scheduled"
    assert str(lesson.rate) == "50.00"


@pytest.mark.django_db
def test_unsigned_317_webhook_is_rejected(school):
    _owner, studio = school
    from apps.core.models import Band

    band = Band.objects.create(studio=studio, name="Unsigned", billing_email="band@test.com")
    client = APIClient()
    response = client.post(
        "/api/gigs/webhooks/317booking/",
        {
            "event": "gig.confirmed",
            "gig": {
                "id": "x",
                "date": "2026-07-15T20:00:00Z",
                "studiosync_band_id": str(band.id),
            },
        },
        format="json",
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_preferences_do_not_echo_smtp_password(school):
    owner, _studio = school
    owner.preferences = {"technical": {"smtp_host": "smtp.example.com", "smtp_password": "super-secret"}}
    owner.save(update_fields=["preferences"])
    client = _auth(owner)
    response = client.get("/api/core/users/me/")
    assert response.status_code == status.HTTP_200_OK
    technical = response.data["preferences"]["technical"]
    assert "smtp_password" not in technical
    assert technical["smtp_password_set"] is True
    assert technical["smtp_host"] == "smtp.example.com"

    saved = client.patch(
        "/api/core/users/me/",
        {"preferences": {"technical": {"smtp_host": "smtp.example.com", "smtp_password": ""}}},
        format="json",
    )
    assert saved.status_code == status.HTTP_200_OK
    owner.refresh_from_db()
    assert owner.preferences["technical"]["smtp_password"] == "super-secret"


@pytest.mark.django_db
def test_teacher_calendar_feed_hides_other_students(school):
    owner, studio = school
    from apps.core.models import Teacher

    teacher_user = _user("cal-teacher@test.com", "teacher")
    teacher = Teacher.objects.create(user=teacher_user, studio=studio)
    pupil = _user("cal-pupil@test.com", "student")
    student = Student.objects.create(user=pupil, studio=studio, primary_teacher=teacher, instrument="Piano")
    start = timezone.now() + timedelta(days=2)
    Lesson.objects.create(
        studio=studio,
        teacher=teacher,
        student=student,
        scheduled_start=start,
        scheduled_end=start + timedelta(minutes=30),
    )
    stranger_user = _user("stranger@test.com", "student")
    Student.objects.create(user=stranger_user, studio=studio, instrument="Harp")
    response = _auth(stranger_user).get(f"/api/lessons/calendar/teacher/{teacher.id}/lessons.ics")
    assert response.status_code == status.HTTP_403_FORBIDDEN

    own = _auth(teacher_user).get(f"/api/lessons/calendar/teacher/{teacher.id}/lessons.ics")
    assert own.status_code == status.HTTP_200_OK
    assert b"cal-pupil" in own.content or b"Test" in own.content
