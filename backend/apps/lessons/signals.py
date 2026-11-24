import logging

from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import translation
from django.utils.translation import gettext as _
from django_q.tasks import async_task

from apps.core.i18n import format_when, language_for_user
from apps.core.tasks import send_email_async

from .models import Lesson

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Lesson)
def notify_lesson_scheduled(sender, instance, created, **kwargs):
    """
    Trigger notifications when a new lesson is scheduled.
    """
    if created:
        try:
            # Create in-app notifications
            from apps.notifications.models import Notification

            Notification.notify_lesson_scheduled(instance)

            # 1. Notify Teacher via Email
            if instance.teacher and instance.teacher.user:
                teacher_user = instance.teacher.user

                if teacher_user.wants_notification("lesson_scheduled", "email"):
                    with translation.override(language_for_user(teacher_user)):
                        student_name = _("Group/Band")
                        instrument = _("Music")
                        if instance.student:
                            student_name = instance.student.user.get_full_name()
                            instrument = instance.student.instrument
                        elif instance.band:
                            student_name = instance.band.name
                        subject = _("New Lesson Scheduled 🎵")
                        when = format_when(instance.scheduled_start, teacher_user)

                    context = {
                        "recipient_name": teacher_user.first_name,
                        "instructor_name": teacher_user.get_full_name(),
                        "lesson_start_time": when,
                        "location": instance.location,
                        "student_name": student_name,
                        "instrument": instrument,
                        "duration_minutes": instance.duration_minutes,
                        "lesson_url": f"{settings.FRONTEND_BASE_URL}/dashboard/lessons/{instance.id}",
                        "language": language_for_user(teacher_user),
                    }

                    async_task(
                        send_email_async,
                        subject,
                        teacher_user.email,
                        "emails/lesson_scheduled.html",
                        context,
                    )
                    logger.info(f"Triggered lesson creation email for teacher {teacher_user.email}")

            # 2. Notify Student via Email
            if instance.student and instance.student.user:
                student_user = instance.student.user

                if student_user.wants_notification("lesson_scheduled", "email"):
                    with translation.override(language_for_user(student_user)):
                        subject = _("New Lesson Scheduled 🎵")
                        when = format_when(instance.scheduled_start, student_user)
                    context = {
                        "recipient_name": student_user.first_name,
                        "instructor_name": instance.teacher.user.get_full_name(),
                        "lesson_start_time": when,
                        "location": instance.location,
                        "student_name": student_user.get_full_name(),
                        "instrument": instance.student.instrument,
                        "duration_minutes": instance.duration_minutes,
                        "lesson_url": f"{settings.FRONTEND_BASE_URL}/dashboard/lessons/{instance.id}",
                        "language": language_for_user(student_user),
                    }

                    async_task(
                        send_email_async,
                        subject,
                        student_user.email,
                        "emails/lesson_scheduled.html",
                        context,
                    )
                    logger.info(f"Triggered lesson creation email for student {student_user.email}")

        except Exception as e:
            logger.error(f"Error sending lesson creation notifications: {e}")
