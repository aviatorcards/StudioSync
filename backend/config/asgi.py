"""
ASGI config for Music Studio Manager
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
import apps.messaging.routing
import apps.notifications.routing
from apps.core.middleware import TokenAuthMiddleware

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": TokenAuthMiddleware(URLRouter(
            apps.messaging.routing.websocket_urlpatterns + 
            apps.notifications.routing.websocket_urlpatterns
        )),
    }
)
