from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResourceViewSet, PublicResourceViewSet, SetlistViewSet

router = DefaultRouter()
router.register(r'library', ResourceViewSet, basename='resource')
router.register(r'public', PublicResourceViewSet, basename='public-resource')
router.register(r'setlists', SetlistViewSet, basename='setlist')

urlpatterns = [
    path('', include(router.urls)),
]
