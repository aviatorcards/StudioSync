import hashlib
import hmac
import json
import logging

import requests
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from stream_chat import StreamChat

logger = logging.getLogger(__name__)

from .models import Band, Family, Student, Studio, Teacher, User


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if not created:
        return

    # Assign to a default studio if none exists for simplicity in this demo
    studio = Studio.objects.first()
    
    # If no studio exists, and this is NOT an admin being created, we can't do much yet
    # If this IS an admin being created, they will become the owner of the first studio
    if not studio and instance.role == 'admin':
        studio = Studio.objects.create(name="My Studio", owner=instance)
    
    if not studio:
        # Fallback for students/teachers created before any studio exists (rare)
        # In a real app, studio selection would be mandatory
        return

    if instance.role == "student":
        Student.objects.get_or_create(user=instance, studio=studio)
    elif instance.role == "teacher":
        Teacher.objects.get_or_create(user=instance, studio=studio)
    elif instance.role == "parent":
        Family.objects.get_or_create(primary_parent=instance, studio=studio)

    # Sync User to Stream Chat
    if not settings.STREAM_API_KEY or not settings.STREAM_API_SECRET:
        logger.warning("Stream API keys are not set. Skipping user sync.")
        return

    try:
        client = StreamChat(api_key=settings.STREAM_API_KEY, api_secret=settings.STREAM_API_SECRET)
        
        user_data = {
            "id": str(instance.id),
            "name": instance.get_full_name(),
        }
        
        # Add avatar if it exists
        if instance.avatar:
            request = getattr(instance, '_request', None)
            if request:
                user_data["image"] = request.build_absolute_uri(instance.avatar.url)
            else:
                user_data["image"] = f"{settings.FRONTEND_BASE_URL}{instance.avatar.url}"

        client.upsert_user(user_data)
        logger.info(f"Successfully synced user {instance.id} to Stream Chat.")

    except Exception as e:
        logger.error(f"Error syncing user {instance.id} to Stream Chat: {e}")


@receiver(post_save, sender=Band)
def sync_band_to_317booking(sender, instance, created, **kwargs):
    """Push band.created / band.updated to 317booking so it can mirror the band record."""
    url = getattr(settings, "BOOKING_317_URL", "")
    if not url:
        return

    event = "band.created" if created else "band.updated"
    payload = {
        "event": event,
        "band": {
            "id": str(instance.id),
            "name": instance.name,
            "genre": instance.genre or "",
            "billing_email": instance.billing_email,
        },
    }
    body = json.dumps(payload)
    headers = {"Content-Type": "application/json"}

    secret = getattr(settings, "BOOKING_317_WEBHOOK_SECRET", "")
    if secret:
        sig = hmac.new(secret.encode(), body.encode(), hashlib.sha256).hexdigest()
        headers["x-studiosync-signature"] = f"sha256={sig}"

    try:
        resp = requests.post(
            f"{url}/api/webhooks/studiosync",
            data=body,
            headers=headers,
            timeout=10,
        )
        # On band.created, 317booking returns the iCal URL — store it
        if created and resp.status_code == 201:
            ical_url = resp.json().get("icalUrl")
            if ical_url:
                Band.objects.filter(pk=instance.pk).update(ical_feed_url=ical_url)
    except Exception as e:
        logger.error(f"Error syncing band {instance.id} to 317booking: {e}")
