"""
Calendar feed views
"""

from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.core.models import Student, Studio, Teacher
from apps.core.tenancy import studios_for_request

from .calendar_utils import (
    generate_student_calendar,
    generate_studio_calendar,
    generate_teacher_calendar,
)


def _can_view_teacher(user, teacher):
    if not getattr(user, "is_authenticated", False):
        return False
    if user.pk == teacher.user_id:
        return True
    return user.role == "admin" and teacher.studio.owner_id == user.id


def _can_view_student(user, student):
    if not getattr(user, "is_authenticated", False):
        return False
    if user.pk == student.user_id:
        return True
    if user.role == "admin" and student.studio.owner_id == user.id:
        return True
    if user.role == "teacher" and hasattr(user, "teacher_profile"):
        if student.primary_teacher_id == user.teacher_profile.id:
            return True
        return student.lessons.filter(teacher=user.teacher_profile).exists()
    if user.role == "parent":
        family = student.family
        return family is not None and user.pk in {family.primary_parent_id, family.secondary_parent_id}
    return False


@api_view(["GET"])
def teacher_calendar_feed(request, teacher_id):
    """
    Generate ICS calendar feed for a teacher's lessons.
    Only that teacher and their studio admin may download it.
    """
    teacher = get_object_or_404(Teacher, id=teacher_id)
    if not _can_view_teacher(request.user, teacher):
        return Response({"error": "Permission denied"}, status=403)

    # Generate calendar
    ical_data = generate_teacher_calendar(teacher)

    # Return as downloadable file
    response = HttpResponse(ical_data, content_type="text/calendar; charset=utf-8")
    response["Content-Disposition"] = f'attachment; filename="teacher-{teacher.id}-lessons.ics"'
    response["Cache-Control"] = "no-cache, no-store, must-revalidate"

    return response


@api_view(["GET"])
def student_calendar_feed(request, student_id):
    """
    Generate ICS calendar feed for a student's lessons
    URL: /api/calendar/student/{student_id}/lessons.ics
    """
    student = get_object_or_404(Student, id=student_id)
    if not _can_view_student(request.user, student):
        return Response({"error": "Permission denied"}, status=403)

    # Generate calendar
    ical_data = generate_student_calendar(student)

    # Return as downloadable file
    response = HttpResponse(ical_data, content_type="text/calendar; charset=utf-8")
    response["Content-Disposition"] = f'attachment; filename="student-{student.id}-lessons.ics"'
    response["Cache-Control"] = "no-cache, no-store, must-revalidate"

    return response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def studio_calendar_feed(request, studio_id):
    """
    Generate ICS calendar feed for all studio lessons
    URL: /api/calendar/studio/{studio_id}/lessons.ics
    Requires authentication
    """
    studio = get_object_or_404(Studio, id=studio_id, pk__in=studios_for_request(request))

    if request.user.role != "admin" or studio.owner_id != request.user.id:
        return Response({"error": "Permission denied"}, status=403)

    # Generate calendar
    ical_data = generate_studio_calendar(studio)

    # Return as downloadable file
    response = HttpResponse(ical_data, content_type="text/calendar; charset=utf-8")
    response["Content-Disposition"] = f'attachment; filename="studio-{studio.id}-lessons.ics"'
    response["Cache-Control"] = "no-cache, no-store, must-revalidate"

    return response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_calendar_feed(request):
    """
    Generate calendar feed for the current user
    Automatically detects if user is a teacher or student
    URL: /api/calendar/my/lessons.ics
    """
    # Check if user is a teacher
    if hasattr(request.user, "teacher_profile"):
        teacher = request.user.teacher_profile
        ical_data = generate_teacher_calendar(teacher)
        filename = "my-lessons.ics"
    # Check if user is a student
    elif hasattr(request.user, "student_profile"):
        student = request.user.student_profile
        ical_data = generate_student_calendar(student)
        filename = "my-lessons.ics"
    else:
        return Response({"error": "User is neither a teacher nor a student"}, status=400)

    # Return as downloadable file
    response = HttpResponse(ical_data, content_type="text/calendar; charset=utf-8")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    response["Cache-Control"] = "no-cache, no-store, must-revalidate"

    return response
