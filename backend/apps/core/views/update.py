"""
Update-check and one-click update endpoints.
Admin-only.
"""

import logging

from django.core.cache import cache

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from apps.core.tasks import (
    CACHE_KEY_UPDATE_INFO,
    check_for_updates,
    trigger_update,
    _get_local_version,
)

logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def update_status(request):
    """
    Return the cached update-check result, or perform a fresh check if the
    cache is empty or the caller passes ?refresh=true.
    """
    force_refresh = request.query_params.get("refresh", "").lower() in ("1", "true", "yes")

    if force_refresh:
        cache.delete(CACHE_KEY_UPDATE_INFO)

    info = cache.get(CACHE_KEY_UPDATE_INFO)
    if info is None:
        info = check_for_updates()

    return Response(info)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def perform_update(request):
    """
    Trigger an in-place update.  Runs synchronously so the caller gets
    real output; the process typically completes within 30-120 s.

    The update strategy is auto-detected:
      • Docker   — docker compose pull && docker compose up -d
      • Bare-metal — git pull && pip install -r requirements.txt
    """
    result = trigger_update()

    http_status = status.HTTP_200_OK if result["success"] else status.HTTP_500_INTERNAL_SERVER_ERROR
    return Response(result, status=http_status)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def current_version(request):
    """Lightweight endpoint that just returns the running version string."""
    return Response({"version": _get_local_version()})
