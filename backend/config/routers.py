"""
Shared DRF router that strips trailing slashes from all registered routes.

Background: The Next.js proxy (next.config.js rewrites) strips trailing slashes
from URLs before forwarding to Django. With APPEND_SLASH=False (required to avoid
redirect loops through the proxy) and the standard DefaultRouter (which generates
URL patterns like `^studios/$`), slash-less requests return 404.

OptionalSlashRouter sets trailing_slash=False, which tells DRF to generate
patterns without trailing slashes (e.g. `^studios$` instead of `^studios/$`),
matching what the Next.js proxy actually forwards to Django.
"""

from rest_framework.routers import DefaultRouter


class OptionalSlashRouter(DefaultRouter):
    """DRF router that omits trailing slashes to match Next.js proxy behaviour."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
