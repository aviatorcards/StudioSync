from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'items', views.InventoryItemViewSet, basename='inventory-item')
router.register(r'checkouts', views.CheckoutLogViewSet, basename='checkout')
router.register(r'practice-rooms', views.PracticeRoomViewSet, basename='practice-room')
router.register(r'reservations', views.RoomReservationViewSet, basename='reservation')

urlpatterns = [
    path('', include(router.urls)),
]
