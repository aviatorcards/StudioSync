"""Regression tests for the security fixes around setup, sessions, uploads, and tenancy."""

import pytest
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken

from apps.core.authentication import GENERIC_AUTH_DETAIL
from apps.core.models import Band, Student, Studio, Teacher, User
from apps.resources.models import Resource


def _user(email, role, **extra):
    fields = {
        "email": email,
        "password": "testpass123",
        "first_name": "Test",
        "last_name": role.title(),
        "role": role,
        "is_approved": True,
    }
    fields.update(extra)
    return User.objects.create_user(**fields)


def _auth(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def school(db):
    owner = _user("owner-sec@test.com", "admin", is_staff=True)
    studio = Studio.objects.create(name="Security School", owner=owner, email="sec@test.com")
    return owner, studio


@pytest.fixture
def other_school(db):
    owner = _user("owner-other@test.com", "admin")
    studio = Studio.objects.create(
        name="Other School", owner=owner, email="other@test.com", subdomain="other"
    )
    return owner, studio


@pytest.mark.django_db
def test_setup_requires_the_boot_token_and_does_not_return_jwts(api_client):
    from apps.core.setup_token import get_setup_token

    url = "/api/core/setup/complete/"
    payload = {
        "studio_name": "Locked Studio",
        "studio_email": "locked@test.com",
        "admin_email": "locked-admin@test.com",
        "admin_first_name": "Lock",
        "admin_last_name": "Admin",
        "admin_password": "Secur3P@ss!",
    }
    missing = api_client.post(url, payload, format="json")
    assert missing.status_code == status.HTTP_403_FORBIDDEN

    done = api_client.post(url, payload, format="json", HTTP_X_SETUP_TOKEN=get_setup_token())
    assert done.status_code == status.HTTP_201_CREATED
    assert "tokens" not in done.data
    assert "access" not in done.data


@override_settings(FRONTEND_BASE_URL="https://studio.example.com")
def test_password_reset_ignores_origin_and_always_returns_200(api_client, school):
    owner, _studio = school
    from django.test import RequestFactory

    from apps.auth import views as auth_views
    from apps.core.email_utils import get_frontend_url

    request = RequestFactory().post("/", HTTP_ORIGIN="https://evil.example")
    assert get_frontend_url(request) == "https://studio.example.com"

    captured = {}

    def capture(subject, message, from_email, recipient_list, fail_silently=False):
        captured["message"] = message

    original = auth_views.send_mail
    auth_views.send_mail = capture
    try:
        known = api_client.post(
            "/api/auth/password/reset/",
            {"email": owner.email},
            format="json",
            HTTP_ORIGIN="https://evil.example",
        )
        unknown = api_client.post(
            "/api/auth/password/reset/",
            {"email": "nobody@example.com"},
            format="json",
            HTTP_ORIGIN="https://evil.example",
        )
        auth_views.send_mail = lambda *args, **kwargs: (_ for _ in ()).throw(RuntimeError("smtp down"))
        failed = api_client.post(
            "/api/auth/password/reset/",
            {"email": owner.email},
            format="json",
            HTTP_ORIGIN="https://evil.example",
        )
    finally:
        auth_views.send_mail = original

    assert known.status_code == unknown.status_code == failed.status_code == status.HTTP_200_OK
    assert known.data == unknown.data == failed.data
    assert captured["message"].startswith(
        "Click the link to reset your password: https://studio.example.com/reset-password?"
    )
    assert "evil.example" not in captured["message"]


def test_login_errors_do_not_reveal_why(api_client, school):
    owner, _studio = school
    pending = _user("pending-sec@test.com", "student", is_approved=False)
    bad = api_client.post(
        "/api/auth/token/", {"email": owner.email, "password": "wrong-password"}, format="json"
    )
    missing = api_client.post(
        "/api/auth/token/", {"email": "missing@example.com", "password": "wrong-password"}, format="json"
    )
    unapproved = api_client.post(
        "/api/auth/token/", {"email": pending.email, "password": "testpass123"}, format="json"
    )
    assert bad.status_code == missing.status_code == unapproved.status_code == status.HTTP_401_UNAUTHORIZED
    assert bad.data == missing.data == unapproved.data
    assert bad.data["detail"] == GENERIC_AUTH_DETAIL


def test_unapproved_token_is_rejected_on_later_requests(api_client, school):
    _owner, _studio = school
    pending = _user("later-pending@test.com", "student", is_approved=False)
    token = str(AccessToken.for_user(pending))
    response = api_client.get("/api/auth/me/", HTTP_AUTHORIZATION=f"Bearer {token}")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_password_change_validates_and_blacklist_refresh(api_client, school):
    owner, _studio = school
    login = api_client.post(
        "/api/auth/token/",
        {"email": owner.email, "password": "testpass123"},
        format="json",
        HTTP_X_RETURN_TOKENS="1",
    )
    refresh = login.data["refresh"]
    client = _auth(owner)
    weak = client.post(
        "/api/core/users/change_password/",
        {"current_password": "testpass123", "new_password": "a"},
        format="json",
    )
    assert weak.status_code == status.HTTP_400_BAD_REQUEST

    changed = client.post(
        "/api/core/users/change_password/",
        {"current_password": "testpass123", "new_password": "BetterPass1!"},
        format="json",
    )
    assert changed.status_code == status.HTTP_200_OK
    reused = api_client.post(
        "/api/auth/token/refresh/", {"refresh": refresh}, format="json", HTTP_X_RETURN_TOKENS="1"
    )
    assert reused.status_code == status.HTTP_401_UNAUTHORIZED


def test_logout_blacklists_the_refresh_cookie(api_client, school):
    owner, _studio = school
    login = api_client.post(
        "/api/auth/token/",
        {"email": owner.email, "password": "testpass123"},
        format="json",
        HTTP_X_RETURN_TOKENS="1",
    )
    refresh = login.data["refresh"]
    csrf = login.cookies["studiosync_csrf"].value
    api_client.cookies["studiosync_refresh"] = login.cookies["studiosync_refresh"].value
    api_client.cookies["studiosync_csrf"] = csrf
    logged_out = api_client.post("/api/auth/logout/", HTTP_X_CSRFTOKEN=csrf)
    assert logged_out.status_code == status.HTTP_200_OK
    reused = api_client.post(
        "/api/auth/token/refresh/", {"refresh": refresh}, format="json", HTTP_X_RETURN_TOKENS="1"
    )
    assert reused.status_code == status.HTTP_401_UNAUTHORIZED


def test_login_is_rate_limited(api_client, school):
    from django.core.cache import cache

    from apps.auth.views import LoginRateThrottle

    LoginRateThrottle.rate = "2/min"
    cache.clear()
    owner, _studio = school
    try:
        codes = [
            api_client.post(
                "/api/auth/token/",
                {"email": owner.email, "password": "nope"},
                format="json",
            ).status_code
            for _ in range(4)
        ]
    finally:
        LoginRateThrottle.rate = None
    assert status.HTTP_429_TOO_MANY_REQUESTS in codes


def test_student_cannot_edit_or_delete_a_bandmate(school):
    _owner, studio = school
    teacher_user = _user("band-teacher@test.com", "teacher")
    teacher = Teacher.objects.create(user=teacher_user, studio=studio)
    first = _user("band-one@test.com", "student")
    second = _user("band-two@test.com", "student")
    student = Student.objects.create(user=first, studio=studio, primary_teacher=teacher, instrument="Piano")
    mate = Student.objects.create(user=second, studio=studio, instrument="Violin", birth_date="2015-01-01")
    band = Band.objects.create(studio=studio, name="Ensemble", billing_email="band@test.com")
    band.members.add(student, mate)

    client = _auth(first)
    edited = client.patch(
        f"/api/students/{mate.id}/",
        {"first_name": "Hacked", "last_name": "Pupil", "birth_date": "2000-01-01"},
        format="json",
    )
    assert edited.status_code == status.HTTP_403_FORBIDDEN
    removed = client.delete(f"/api/students/{mate.id}/")
    assert removed.status_code == status.HTTP_403_FORBIDDEN
    mate.refresh_from_db()
    assert mate.user.first_name == "Test"

    own = client.patch(f"/api/students/{student.id}/", {"instrument": "Organ"}, format="json")
    assert own.status_code == status.HTTP_200_OK
    student.refresh_from_db()
    assert student.instrument == "Organ"


def test_student_cannot_move_themselves_to_another_studio(school, other_school):
    _owner, _studio = school
    _other_owner, other = other_school
    pupil = _user("mover@test.com", "student")
    student = Student.objects.create(user=pupil, studio=_studio, instrument="Piano")
    client = _auth(pupil)
    moved = client.patch(
        f"/api/core/students/{student.id}/",
        {"studio": str(other.id), "user_id": str(_other_owner.id)},
        format="json",
    )
    assert moved.status_code == status.HTTP_403_FORBIDDEN
    student.refresh_from_db()
    assert student.studio_id == _studio.id


def test_teacher_cannot_edit_a_student_they_do_not_teach(school):
    _owner, studio = school
    teacher_user = _user("only-mine@test.com", "teacher")
    teacher = Teacher.objects.create(user=teacher_user, studio=studio)
    mine_user = _user("mine@test.com", "student")
    other_user = _user("not-mine@test.com", "student")
    mine = Student.objects.create(user=mine_user, studio=studio, primary_teacher=teacher, instrument="Piano")
    other = Student.objects.create(user=other_user, studio=studio, instrument="Harp", notes="private")
    client = _auth(teacher_user)

    hidden = client.get("/api/core/students/")
    rows = hidden.data["results"] if isinstance(hidden.data, dict) else hidden.data
    ids = {row["id"] for row in rows}
    assert str(mine.id) in ids
    assert str(other.id) not in ids

    edited = client.patch(f"/api/core/students/{other.id}/", {"notes": "rewritten"}, format="json")
    assert edited.status_code in (status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND)
    other.refresh_from_db()
    assert other.notes == "private"

    ok = client.patch(f"/api/core/students/{mine.id}/", {"notes": "lesson note"}, format="json")
    assert ok.status_code == status.HTTP_200_OK


def test_messages_cannot_address_another_studio(school, other_school):
    owner, _studio = school
    _other_owner, other = other_school
    victim = _user("victim-msg@test.com", "student")
    Student.objects.create(user=victim, studio=other, instrument="Cello")
    response = _auth(owner).post(
        "/api/messaging/threads/",
        {"recipient_ids": [str(victim.id)], "subject": "hi", "message": "cross tenant"},
        format="json",
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "victim-msg@test.com" not in str(response.data)


def test_html_upload_is_rejected_and_public_list_is_scoped(school, other_school):
    _owner, studio = school
    _other_owner, other = other_school
    pupil = _user("uploader@test.com", "student")
    Student.objects.create(user=pupil, studio=studio, instrument="Piano")
    client = _auth(pupil)
    from django.core.files.uploadedfile import SimpleUploadedFile

    html_file = SimpleUploadedFile("warmup.html", b"<html><script>bad</script></html>", content_type="text/html")
    rejected = client.post(
        "/api/resources/library/",
        {"title": "Warmup", "resource_type": "other", "is_public": "true", "file": html_file},
        format="multipart",
    )
    assert rejected.status_code == status.HTTP_400_BAD_REQUEST

    pdf = SimpleUploadedFile("scale.pdf", b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\n", content_type="application/pdf")
    created = client.post(
        "/api/resources/library/",
        {"title": "Scale", "resource_type": "pdf", "is_public": "true", "file": pdf},
        format="multipart",
    )
    assert created.status_code == status.HTTP_201_CREATED
    assert created.data["is_public"] is False

    Resource.objects.create(
        studio=other, uploaded_by=_other_owner, title="Foreign", resource_type="pdf", is_public=True
    )
    Resource.objects.create(
        studio=studio, uploaded_by=pupil, title="Local", resource_type="pdf", is_public=True
    )
    anon = APIClient()
    everything = anon.get("/api/resources/public/")
    body = everything.data["results"] if isinstance(everything.data, dict) else everything.data
    assert body == []
    scoped = anon.get("/api/resources/public/", {"studio": str(studio.id)})
    titles = [row["title"] for row in (scoped.data["results"] if isinstance(scoped.data, dict) else scoped.data)]
    assert "Local" in titles
    assert "Foreign" not in titles


def test_uploaded_file_is_an_attachment(school, tmp_path, settings):
    _owner, studio = school
    media = tmp_path / "media"
    media.mkdir()
    settings.MEDIA_ROOT = media
    target = media / "resources"
    target.mkdir()
    (target / "notes.html").write_bytes(b"<html><script>bad</script></html>")
    client = _auth(_owner)
    response = client.get("/media/resources/notes.html")
    assert response.status_code == status.HTTP_200_OK
    assert "attachment" in response["Content-Disposition"]
    assert response["X-Content-Type-Options"] == "nosniff"
    assert response["Content-Type"].startswith("application/octet-stream")
    assert "sandbox" in response["Content-Security-Policy"]
