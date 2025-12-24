from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InvoiceViewSet
from .stripe_views import CreateCheckoutSessionView, StripeWebhookView

router = DefaultRouter()
router.register(r'invoices', InvoiceViewSet, basename='invoice')

urlpatterns = [
    path('create-checkout-session/<str:invoice_id>/', CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
    path('', include(router.urls)),
]
