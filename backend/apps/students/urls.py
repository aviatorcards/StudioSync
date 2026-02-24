from django.urls import path, include
from rest_framework.routers import DefaultRouter  # noqa: F401
from config.routers import OptionalSlashRouter
from apps.students.views import StudentViewSet, FamilyViewSet

router = OptionalSlashRouter()
router.register(r'', StudentViewSet, basename='student')
router.register(r'families', FamilyViewSet, basename='family')

urlpatterns = [
    path('', include(router.urls)),
]
