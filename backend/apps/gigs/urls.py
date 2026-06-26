from django.urls import include, path
from config.routers import OptionalSlashRouter
from . import views

router = OptionalSlashRouter()
router.register(r"availabilities", views.BandAvailabilityViewSet, basename="band-availability")
router.register(r"gigs", views.GigViewSet, basename="gig")
router.register(r"claims", views.GigClaimViewSet, basename="gig-claim")

urlpatterns = [
    path("", include(router.urls)),
]
