from django.urls import path, include
from rest_framework.routers import DefaultRouter  # noqa: F401
from config.routers import OptionalSlashRouter
from .views import MessageThreadViewSet

router = OptionalSlashRouter()
router.register(r'threads', MessageThreadViewSet, basename='thread')
# router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]
