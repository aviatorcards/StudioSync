from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Family, Student, Studio, Teacher, User


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    # Assign to a default studio if none exists for simplicity in this demo
    studio = Studio.objects.first()
    if not studio:
        # Create a default studio if none exists
        admin_user = User.objects.filter(role="admin").first() or instance
        studio = Studio.objects.create(name="Default Studio", owner=admin_user)

    if instance.role == "student":
        Student.objects.get_or_create(user=instance, studio=studio)
    elif instance.role == "teacher":
        Teacher.objects.get_or_create(user=instance, studio=studio)
    elif instance.role == "parent":
        Family.objects.get_or_create(primary_parent=instance, studio=studio)
