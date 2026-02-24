from django.urls import path, include
from rest_framework.routers import DefaultRouter  # noqa: F401
from config.routers import OptionalSlashRouter
from .views import ResourceViewSet, PublicResourceViewSet, SetlistViewSet

router = OptionalSlashRouter()
router.register(r'library', ResourceViewSet, basename='resource')
router.register(r'public', PublicResourceViewSet, basename='public-resource')
router.register(r'setlists', SetlistViewSet, basename='setlist')

urlpatterns = [
    path('', include(router.urls)),
]
