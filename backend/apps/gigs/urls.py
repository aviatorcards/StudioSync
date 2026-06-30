from django.urls import include, path
from config.routers import OptionalSlashRouter
from . import views

router = OptionalSlashRouter()
router.register(r"venues", views.VenueViewSet, basename="venue")
router.register(r"availabilities", views.BandAvailabilityViewSet, basename="band-availability")
router.register(r"gigs", views.GigViewSet, basename="gig")
router.register(r"claims", views.GigClaimViewSet, basename="gig-claim")
router.register(r"external-events", views.BandExternalEventViewSet, basename="band-external-event")

urlpatterns = [
    path("webhooks/317booking/", views.ThreeSeventeenBookingWebhookView.as_view(), name="317booking-webhook"),
    path("", include(router.urls)),
]
