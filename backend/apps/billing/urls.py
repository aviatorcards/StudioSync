from django.urls import include, path

from rest_framework.routers import DefaultRouter  # noqa: F401

from config.routers import OptionalSlashRouter

from .stripe_views import CreateCheckoutSessionView, StripeWebhookView
from .views import InvoiceViewSet

router = OptionalSlashRouter()
router.register(r"invoices", InvoiceViewSet, basename="invoice")

urlpatterns = [
    path(
        "create-checkout-session/<str:invoice_id>/",
        CreateCheckoutSessionView.as_view(),
        name="create-checkout-session",
    ),
    path("webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
    path("", include(router.urls)),
]
