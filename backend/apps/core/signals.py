from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from stream_chat import StreamChat
import logging

logger = logging.getLogger(__name__)

from .models import Family, Student, Studio, Teacher, User


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
