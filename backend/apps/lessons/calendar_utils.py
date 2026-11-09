"""
Calendar integration utilities
Generate ICS feeds for lessons
"""

from datetime import timedelta

from django.utils import timezone

from icalendar import Calendar, Event

from apps.lessons.models import Lesson


def _subject(lesson):
    if lesson.student_id:
        return lesson.student.user.get_full_name(), lesson.student.instrument or ""
    if lesson.band_id:
        return lesson.band.name, "Group"
    return "Studio hold", ""


def _add_event(calendar, lesson, summary, description_parts):
    event = Event()
    event.add("summary", summary)
    event.add("dtstart", lesson.scheduled_start)
    event.add("dtend", lesson.scheduled_end)
    event.add("dtstamp", timezone.now())
    if lesson.is_online:
        event.add("location", lesson.online_meeting_url or "Online Lesson")
    else:
        event.add("location", lesson.location or "Studio")
    note = (lesson.summary or "").strip()
    if note:
        description_parts.append(f"Notes: {note}")
    event.add("description", "\\n".join(description_parts))
    event.add("uid", f"lesson-{lesson.id}@studiosync.local")
    if lesson.status == "scheduled":
        event.add("status", "CONFIRMED")
    elif lesson.status == "completed":
        event.add("status", "CONFIRMED")
    else:
        event.add("status", "TENTATIVE")
    calendar.add_component(event)


def generate_teacher_calendar(teacher):
    """
    Generate ICS calendar feed for a teacher's lessons
    """
    calendar = Calendar()
    calendar.add("prodid", "-//Music Studio Manager//Teacher Calendar//EN")
    calendar.add("version", "2.0")
    calendar.add("calscale", "GREGORIAN")
    calendar.add("method", "PUBLISH")
    calendar.add("x-wr-calname", f"{teacher.user.get_full_name()} - Lessons")
    calendar.add("x-wr-timezone", "UTC")

    # Get lessons from 1 month ago to 6 months ahead
    start_date = timezone.now() - timedelta(days=30)
    end_date = timezone.now() + timedelta(days=180)

    lessons = (
        Lesson.objects.filter(
            teacher=teacher, scheduled_start__gte=start_date, scheduled_start__lte=end_date
        )
        .exclude(status="cancelled")
        .select_related("student__user", "band")
    )

    for lesson in lessons:
        name, instrument = _subject(lesson)
        _add_event(
            calendar,
            lesson,
            f"{name} - {instrument}".strip(" -"),
            [
                f"Student: {name}",
                f"Instrument: {instrument}",
                f"Type: {lesson.get_lesson_type_display()}",
            ],
        )

    return calendar.to_ical()


def generate_student_calendar(student):
    """
    Generate ICS calendar feed for a student's lessons
    """
    calendar = Calendar()
    calendar.add("prodid", "-//Music Studio Manager//Student Calendar//EN")
    calendar.add("version", "2.0")
    calendar.add("calscale", "GREGORIAN")
    calendar.add("method", "PUBLISH")
    calendar.add("x-wr-calname", f"{student.user.get_full_name()} - Lessons")
    calendar.add("x-wr-timezone", "UTC")

    # Get lessons from 1 month ago to 6 months ahead
    start_date = timezone.now() - timedelta(days=30)
    end_date = timezone.now() + timedelta(days=180)

    lessons = (
        Lesson.objects.filter(
            student=student, scheduled_start__gte=start_date, scheduled_start__lte=end_date
        )
        .exclude(status="cancelled")
        .select_related("teacher__user")
    )

    for lesson in lessons:
        from icalendar import Alarm

        _name, instrument = _subject(lesson)
        _add_event(
            calendar,
            lesson,
            f"{instrument} Lesson with {lesson.teacher.user.get_full_name()}".strip(),
            [
                f"Teacher: {lesson.teacher.user.get_full_name()}",
                f"Instrument: {instrument}",
                f"Type: {lesson.get_lesson_type_display()}",
            ],
        )
        alarm = Alarm()
        alarm.add("action", "DISPLAY")
        alarm.add("description", "Lesson starts in 15 minutes")
        alarm.add("trigger", timedelta(minutes=-15))
        calendar.subcomponents[-1].add_component(alarm)

    return calendar.to_ical()


def generate_studio_calendar(studio):
    """
    Generate ICS calendar feed for all studio lessons
    """
    calendar = Calendar()
    calendar.add("prodid", "-//Music Studio Manager//Studio Calendar//EN")
    calendar.add("version", "2.0")
    calendar.add("calscale", "GREGORIAN")
    calendar.add("method", "PUBLISH")
    calendar.add("x-wr-calname", f"{studio.name} - All Lessons")
    calendar.add("x-wr-timezone", "UTC")

    # Get lessons from 1 month ago to 6 months ahead
    start_date = timezone.now() - timedelta(days=30)
    end_date = timezone.now() + timedelta(days=180)

    lessons = (
        Lesson.objects.filter(
            studio=studio, scheduled_start__gte=start_date, scheduled_start__lte=end_date
        )
        .exclude(status="cancelled")
        .select_related("teacher__user", "student__user", "student", "band")
    )

    for lesson in lessons:
        name, instrument = _subject(lesson)
        _add_event(
            calendar,
            lesson,
            f"{lesson.teacher.user.get_full_name()} → {name}",
            [
                f"Teacher: {lesson.teacher.user.get_full_name()}",
                f"Student: {name}",
                f"Instrument: {instrument}",
            ],
        )

    return calendar.to_ical()
