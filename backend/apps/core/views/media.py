"""Authenticated downloads for private uploads.

Logos, covers, avatars, and band photos stay reachable without a session
because public studio pages render them. Everything else, including signed
documents and the resource library, requires a logged-in user.
"""

from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404, JsonResponse

from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

PUBLIC_PREFIXES = ("avatars/", "studio_logos/", "studio_covers/", "bands/")


class ProtectedMediaView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, path):
        relative = path.lstrip("/")
        if not relative or ".." in Path(relative).parts:
            raise Http404
        root = Path(settings.MEDIA_ROOT).resolve()
        full = (root / relative).resolve()
        if root not in full.parents and full != root:
            raise Http404
        if not full.is_file():
            raise Http404

        is_public = relative.startswith(PUBLIC_PREFIXES)
        if not is_public and not request.user.is_authenticated:
            return JsonResponse({"detail": "Authentication required."}, status=401)

        return FileResponse(full.open("rb"))
