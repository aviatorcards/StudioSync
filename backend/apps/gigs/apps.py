from django.apps import AppConfig


class GigsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.gigs"
    verbose_name = "Gigs Management"

    def ready(self):
        self._register_schedule()

    def _register_schedule(self):
        try:
            from django_q.models import Schedule
            Schedule.objects.get_or_create(
                func="apps.gigs.tasks.sync_all_band_calendars",
                defaults={
                    "name": "Sync 317booking band calendars",
                    "schedule_type": Schedule.MINUTES,
                    "minutes": 30,
                    "repeats": -1,  # run forever
                },
            )
        except Exception:
            # Tables may not exist yet during initial migrations — safe to skip.
            pass
