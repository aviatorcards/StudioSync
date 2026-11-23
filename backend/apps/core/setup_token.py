"""One-time secret required to finish first-run setup."""

import logging
import os
import secrets
import sys

logger = logging.getLogger(__name__)


def _running_tests():
    return any("pytest" in arg or arg == "test" for arg in sys.argv)


def get_setup_token() -> str:
    """Return the bootstrap token.

    SETUP_TOKEN in the environment wins. Otherwise a token is created once and
    stored on the setup row until setup finishes.
    """
    configured = (os.getenv("SETUP_TOKEN") or "").strip()
    if configured:
        return configured

    from apps.core.models import SetupStatus

    row = SetupStatus.objects.order_by("pk").first()
    if row is None:
        row = SetupStatus.objects.create(setup_token=secrets.token_urlsafe(32))
        return row.setup_token
    if row.is_completed:
        return ""
    if not row.setup_token:
        row.setup_token = secrets.token_urlsafe(32)
        row.save(update_fields=["setup_token"])
    return row.setup_token


def clear_setup_token():
    from apps.core.models import SetupStatus

    SetupStatus.objects.exclude(setup_token="").update(setup_token="")


def log_setup_token():
    """Print the bootstrap token when setup is still unfinished."""
    from django.db import connection

    if _running_tests():
        return
    existing = set(connection.introspection.table_names())
    if "setup_status" not in existing:
        return

    from apps.core.models import SetupStatus

    if SetupStatus.is_setup_complete():
        return
    if (os.getenv("SETUP_TOKEN") or "").strip():
        logger.warning(
            "StudioSync setup is incomplete. Finish it with the SETUP_TOKEN value from the environment, sent as X-Setup-Token."
        )
        return
    token = get_setup_token()
    logger.warning("StudioSync setup is incomplete. One-time setup token: %s", token)
    logger.warning(
        "Send that value in the X-Setup-Token header to finish setup. The API never returns it."
    )
