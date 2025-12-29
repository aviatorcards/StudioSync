from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeatureFlagViewSet

router = DefaultRouter()
router.register(r'flags', FeatureFlagViewSet, basename='feature-flag')

urlpatterns = [
    path('', include(router.urls)),
]
