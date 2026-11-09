"""Register background schedules without querying during app startup."""

from django.db import migrations
from django.utils import timezone


def register_schedules(apps, schema_editor):
    Schedule = apps.get_model("django_q", "Schedule")
    now = timezone.now()
    Schedule.objects.get_or_create(
        func="apps.core.tasks.check_upcoming_lessons",
        defaults={
            "name": "Lesson reminders",
            "schedule_type": "H",
            "repeats": -1,
            "next_run": now,
        },
    )
    Schedule.objects.get_or_create(
        func="apps.gigs.tasks.sync_all_band_calendars",
        defaults={
            "name": "Sync band calendars",
            "schedule_type": "I",
            "minutes": 30,
            "repeats": -1,
            "next_run": now,
        },
    )


def unregister_schedules(apps, schema_editor):
    Schedule = apps.get_model("django_q", "Schedule")
    Schedule.objects.filter(
        func__in=[
            "apps.core.tasks.check_upcoming_lessons",
            "apps.gigs.tasks.sync_all_band_calendars",
        ]
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0018_security_schema_sync"),
        ("gigs", "0003_security_schema_sync"),
        ("django_q", "0018_task_success_index"),
    ]

    operations = [
        migrations.RunPython(register_schedules, unregister_schedules),
    ]
