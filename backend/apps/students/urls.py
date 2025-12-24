from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.students.views import StudentViewSet, FamilyViewSet

router = DefaultRouter()
router.register(r'', StudentViewSet, basename='student')
router.register(r'families', FamilyViewSet, basename='family')

urlpatterns = [
    path('', include(router.urls)),
]
