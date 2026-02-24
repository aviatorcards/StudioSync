from django.urls import path, include
from rest_framework.routers import DefaultRouter  # noqa: F401
from config.routers import OptionalSlashRouter
from .views import InvoiceViewSet
from .stripe_views import CreateCheckoutSessionView, StripeWebhookView

router = OptionalSlashRouter()
router.register(r'invoices', InvoiceViewSet, basename='invoice')

urlpatterns = [
    path('create-checkout-session/<str:invoice_id>/', CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
    path('', include(router.urls)),
]
