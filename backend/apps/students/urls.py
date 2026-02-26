from django.urls import include, path

from rest_framework.routers import DefaultRouter  # noqa: F401

from apps.students.views import FamilyViewSet, StudentViewSet
from config.routers import OptionalSlashRouter

router = OptionalSlashRouter()
router.register(r"", StudentViewSet, basename="student")
router.register(r"families", FamilyViewSet, basename="family")

urlpatterns = [
    path("", include(router.urls)),
]
