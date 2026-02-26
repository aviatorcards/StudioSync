from django.urls import include, path

from rest_framework.routers import DefaultRouter  # noqa: F401

from config.routers import OptionalSlashRouter

from .views import PublicResourceViewSet, ResourceViewSet, SetlistViewSet

router = OptionalSlashRouter()
router.register(r"library", ResourceViewSet, basename="resource")
router.register(r"public", PublicResourceViewSet, basename="public-resource")
router.register(r"setlists", SetlistViewSet, basename="setlist")

urlpatterns = [
    path("", include(router.urls)),
]
