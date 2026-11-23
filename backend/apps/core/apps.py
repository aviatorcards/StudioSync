from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.core"

    def ready(self):
        import apps.core.signals  # noqa: F401

        try:
            from apps.core.setup_token import log_setup_token

            log_setup_token()
        except Exception:
            # Migrations and the first import can run before the table exists.
            return
