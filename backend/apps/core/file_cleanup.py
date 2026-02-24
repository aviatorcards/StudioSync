import os
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from .models import User, Band, Studio, SignedDocument
from apps.resources.models import Resource

@receiver(post_delete, sender=User)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    """
    Deletes file from filesystem
    when corresponding User object is deleted.
    """
    if instance.avatar:
        if os.path.isfile(instance.avatar.path):
            os.remove(instance.avatar.path)

@receiver(pre_save, sender=User)
def auto_delete_file_on_change(sender, instance, **kwargs):
    """
    Deletes old file from filesystem
    when corresponding User object is updated
    with new file.
    """
    if not instance.pk:
        return False

    try:
        old_file = User.objects.get(pk=instance.pk).avatar
    except User.DoesNotExist:
        return False

    new_file = instance.avatar
    if not old_file == new_file:
        if old_file and os.path.isfile(old_file.path):
            os.remove(old_file.path)

# Similar handlers for other models with files
@receiver(post_delete, sender=Band)
def auto_delete_band_photo_on_delete(sender, instance, **kwargs):
    if instance.photo:
        if os.path.isfile(instance.photo.path):
            os.remove(instance.photo.path)

@receiver(pre_save, sender=Band)
def auto_delete_band_photo_on_change(sender, instance, **kwargs):
    if not instance.pk: return False
    try:
        old_file = Band.objects.get(pk=instance.pk).photo
    except Band.DoesNotExist: return False
    new_file = instance.photo
    if not old_file == new_file:
        if old_file and os.path.isfile(old_file.path):
            os.remove(old_file.path)

@receiver(post_delete, sender=Studio)
def auto_delete_studio_cover_on_delete(sender, instance, **kwargs):
    if instance.cover_image:
        if os.path.isfile(instance.cover_image.path):
            os.remove(instance.cover_image.path)

@receiver(pre_save, sender=Studio)
def auto_delete_studio_cover_on_change(sender, instance, **kwargs):
    if not instance.pk: return False
    try:
        old_file = Studio.objects.get(pk=instance.pk).cover_image
    except Studio.DoesNotExist: return False
    new_file = instance.cover_image
    if not old_file == new_file:
        if old_file and os.path.isfile(old_file.path):
            os.remove(old_file.path)

@receiver(post_delete, sender=Resource)
def auto_delete_resource_file_on_delete(sender, instance, **kwargs):
    if instance.file:
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)

@receiver(pre_save, sender=Resource)
def auto_delete_resource_file_on_change(sender, instance, **kwargs):
    if not instance.pk: return False
    try:
        old_file = Resource.objects.get(pk=instance.pk).file
    except Resource.DoesNotExist: return False
    new_file = instance.file
    if not old_file == new_file:
        if old_file and os.path.isfile(old_file.path):
            os.remove(old_file.path)
