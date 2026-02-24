from django.urls import path, include
from rest_framework.routers import DefaultRouter  # noqa: F401
from config.routers import OptionalSlashRouter
from .views import NotificationViewSet

router = OptionalSlashRouter()
router.register(r'', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]
