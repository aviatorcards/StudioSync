"""Studio scoping for multi-tenant queries.

Every list and write should go through these helpers. They never fall back to
an arbitrary studio in the database.
"""

from django.db.models import Q

from apps.core.models import Studio


def _related(user, name):
    """OneToOne profiles raise if missing. Return None instead."""
    try:
        return getattr(user, name)
    except Exception:
        return None


def studios_for_user(user):
    """Studios this user actually belongs to."""
    if not getattr(user, "is_authenticated", False):
        return Studio.objects.none()

    filters = Q(pk__in=[])
    if getattr(user, "role", None) == "admin":
        filters = filters | Q(owner=user)

    teacher = _related(user, "teacher_profile")
    if teacher is not None and teacher.studio_id:
        filters = filters | Q(pk=teacher.studio_id)

    student = _related(user, "student_profile")
    if student is not None and student.studio_id:
        filters = filters | Q(pk=student.studio_id)

    filters = filters | Q(families__primary_parent=user) | Q(families__secondary_parent=user)
    return Studio.objects.filter(filters).distinct()


def studios_for_request(request):
    """Like studios_for_user, narrowed to the API key's studio when present."""
    qs = studios_for_user(getattr(request, "user", None))
    pinned = getattr(request, "studio", None)
    if pinned is None:
        return qs
    return qs.filter(pk=pinned.pk)


def studio_for_request(request):
    """The studio to attach to a new row, or None if the user has none."""
    return studios_for_request(request).order_by("created_at").first()


def seed_studio():
    """Studio owned by the earliest admin. Seed scripts must not guess."""
    from apps.core.models import User

    admin = User.objects.filter(role="admin").order_by("created_at").first()
    if admin is None:
        raise RuntimeError("No admin user found. Finish /setup before seeding.")
    studio = admin.owned_studios.order_by("created_at").first()
    if studio is None:
        raise RuntimeError("Admin has no studio. Finish /setup before seeding.")
    return studio
