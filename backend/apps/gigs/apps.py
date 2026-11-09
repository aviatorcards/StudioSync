from django.apps import AppConfig


class GigsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.gigs"
    verbose_name = "Gigs Management"

    def ready(self):
        # Schedules are registered in a data migration so app startup does not
        # query the database. See core migration that creates django-q rows.
        return None
