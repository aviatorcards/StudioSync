import logging
import os
from pathlib import Path

from django.conf import settings
from django.core.cache import cache
from django.core.mail import EmailMultiAlternatives, get_connection
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from django_q.tasks import async_task

from .email_utils import get_email_settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Version helpers
# ---------------------------------------------------------------------------

# URL where the canonical version manifest is published.
# Override via the UPDATE_MANIFEST_URL env var if self-hosting the manifest.
UPDATE_MANIFEST_URL = os.getenv(
    "UPDATE_MANIFEST_URL",
    "https://raw.githubusercontent.com/your-org/studiosync/main/version-manifest.json",
)

CACHE_KEY_UPDATE_INFO = "studiosync_update_info"
CACHE_TTL_SECONDS = 60 * 60  # re-check at most once per hour


def _get_local_version() -> str:
    """Return the version string from the VERSION file at the repo root."""
    # Works whether running inside Docker (where BASE_DIR is /app) or bare-metal
    candidates = [
        Path(settings.BASE_DIR).parent / "VERSION",  # repo root when backend/ is BASE_DIR
        Path(settings.BASE_DIR) / "VERSION",          # fallback: VERSION next to manage.py
    ]
    for path in candidates:
        if path.exists():
            return path.read_text().strip()
    return "unknown"


def _parse_version(version_str: str):
    """Return a tuple of ints for semver comparison, e.g. '1.2.3' → (1, 2, 3)."""
    try:
        return tuple(int(x) for x in version_str.lstrip("v").split(".")[:3])
    except Exception:
        return (0, 0, 0)


def check_for_updates() -> dict:
    """
    Periodic task: fetch the remote version manifest, compare with the local
    VERSION file, and cache the result.

    Returns a dict with keys:
        current_version  – what is running right now
        latest_version   – what the manifest says is current
        update_available – bool
        release_notes    – str or None
        download_url     – str or None
        manifest_url     – the URL that was checked
    """
    import urllib.request
    import json as _json

    local_version = _get_local_version()
    result = {
        "current_version": local_version,
        "latest_version": local_version,
        "update_available": False,
        "release_notes": None,
        "download_url": None,
        "manifest_url": UPDATE_MANIFEST_URL,
        "error": None,
    }

    try:
        req = urllib.request.Request(
            UPDATE_MANIFEST_URL,
            headers={"User-Agent": f"StudioSync/{local_version}"},
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            manifest = _json.loads(resp.read().decode())

        latest = manifest.get("version", local_version)
        result["latest_version"] = latest
        result["release_notes"] = manifest.get("release_notes")
        result["download_url"] = manifest.get("download_url")

        if _parse_version(latest) > _parse_version(local_version):
            result["update_available"] = True
            logger.info(f"StudioSync update available: {local_version} → {latest}")
        else:
            logger.debug(f"StudioSync is up to date ({local_version})")

    except Exception as exc:
        result["error"] = str(exc)
        logger.warning(f"Could not fetch update manifest: {exc}")

    cache.set(CACHE_KEY_UPDATE_INFO, result, CACHE_TTL_SECONDS)
    return result


def trigger_update() -> dict:
    """
    Attempt an in-place update.

    Docker  → runs `docker compose pull && docker compose up -d`
    Bare-metal → runs `git pull && pip install -r requirements.txt`

    Returns {"success": bool, "output": str, "strategy": str}
    """
    import subprocess

    def _run(*cmd, cwd=None):
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            cwd=cwd,
            timeout=300,
        )
        return proc.returncode, proc.stdout + proc.stderr

    # Detect environment ---------------------------------------------------
    # Running inside a Docker container if /.dockerenv exists
    in_docker = Path("/.dockerenv").exists()

    strategy = "docker" if in_docker else "bare-metal"
    output_lines = []
    success = False

    try:
        repo_root = str(Path(settings.BASE_DIR).parent)

        if in_docker:
            # Pull latest images and restart; compose file is at repo root
            rc, out = _run("docker", "compose", "pull", cwd=repo_root)
            output_lines.append(out)
            if rc == 0:
                rc, out = _run("docker", "compose", "up", "-d", cwd=repo_root)
                output_lines.append(out)
                success = rc == 0
        else:
            # Bare-metal: git pull then reinstall deps
            rc, out = _run("git", "pull", cwd=repo_root)
            output_lines.append(out)
            if rc == 0:
                req_file = str(Path(settings.BASE_DIR) / "requirements.txt")
                rc, out = _run("pip", "install", "-r", req_file)
                output_lines.append(out)
                success = rc == 0

        if success:
            # Bust the cached update info so the banner re-evaluates
            cache.delete(CACHE_KEY_UPDATE_INFO)
            logger.info(f"StudioSync update triggered successfully (strategy={strategy})")
        else:
            logger.error(f"StudioSync update failed (strategy={strategy})")

    except Exception as exc:
        output_lines.append(str(exc))
        logger.error(f"StudioSync update exception: {exc}")

    return {
        "success": success,
        "strategy": strategy,
        "output": "\n".join(output_lines),
    }


def send_email_async(subject, to_email, template_name, context, from_email=None, from_name=None):
    """
    Background task to send emails asynchronously using HTML templates.
    """
    try:
        email_settings = get_email_settings()

        real_from_email = from_email or email_settings["from_email"]
        real_from_name = from_name or email_settings["from_name"]

        # Add common context variables
        context["site_name"] = real_from_name

        # Render HTML body
        html_content = render_to_string(template_name, context)
        text_content = strip_tags(html_content)

        # Configure connection if settings found in DB
        connection = None
        smtp_config = email_settings.get("smtp_config")
        if smtp_config and smtp_config.get("host"):
            connection = get_connection(
                backend="django.core.mail.backends.smtp.EmailBackend",
                host=smtp_config["host"],
                port=int(smtp_config["port"]),
                username=smtp_config["username"],
                password=smtp_config["password"],
                use_tls=smtp_config.get("use_tls", True),
                use_ssl=smtp_config.get("use_ssl", False),
                timeout=10,
            )

        # Construct From header
        if real_from_name and real_from_name != real_from_email:
            final_from = f"{real_from_name} <{real_from_email}>"
        else:
            final_from = real_from_email

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=final_from,
            to=[to_email],
            connection=connection,
        )
        email.attach_alternative(html_content, "text/html")
        email.send()

        logger.info(f"✅ Email sent to {to_email} (Template: {template_name})")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to send email to {to_email}: {e}")
        return False


def check_upcoming_lessons():
    """
    Periodic task to check for upcoming lessons and send reminders.
    Runs hourly. Checks for lessons starting between 23 and 25 hours from now.
    """
    from datetime import timedelta

    from django.utils import timezone

    from apps.lessons.models import Lesson
    from apps.notifications.models import Notification

    now = timezone.now()
    start_window = now + timedelta(hours=23)
    end_window = now + timedelta(hours=25)

    # Find active lessons in the window
    upcoming_lessons = Lesson.objects.filter(
        scheduled_start__range=(start_window, end_window), status="scheduled"
    )

    logger.info(
        f"Checking for lesson reminders. Found {upcoming_lessons.count()} lessons in window."
    )

    reminders_sent = 0

    for lesson in upcoming_lessons:
        # Check if reminder already sent to student
        student_reminder_exists = Notification.objects.filter(
            related_lesson_id=lesson.id,
            notification_type="lesson_reminder",
            user=lesson.student.user,
        ).exists()

        if not student_reminder_exists:
            try:
                user = lesson.student.user
                
                # Create in-app notification (respecting prefs)
                if user.wants_notification("lesson_reminder", "push"):
                    Notification.create_notification(
                        user=user,
                        notification_type="lesson_reminder",
                        title="Upcoming Lesson Reminder",
                        message=f'Your {lesson.student.instrument} lesson is tomorrow at {lesson.scheduled_start.strftime("%I:%M %p")}',
                        link=f"/dashboard/lessons/{lesson.id}",
                    )

                # Send Email (respecting prefs)
                if user.wants_notification("lesson_reminder", "email"):
                    context = {
                        "instructor_name": lesson.teacher.user.get_full_name(),
                        "lesson_start_time": lesson.scheduled_start.strftime("%A, %B %d at %I:%M %p"),
                        "location": lesson.location,
                        "student_name": lesson.student.user.get_full_name(),
                        "instrument": lesson.student.instrument,
                        "duration_minutes": lesson.duration_minutes,
                        "lesson_url": f"{settings.FRONTEND_BASE_URL}/dashboard/lessons/{lesson.id}",
                    }

                    async_task(
                        send_email_async,
                        "Lesson Reminder 🎵",
                        user.email,
                        "emails/lesson_reminder.html",
                        context,
                    )
                    reminders_sent += 1
            except Exception as e:
                logger.error(f"Failed to send reminder for lesson {lesson.id}: {e}")

    return f"Sent {reminders_sent} reminders"
