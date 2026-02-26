import logging

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

import stripe
from rest_framework import permissions, status, views
from rest_framework.response import Response

from .models import Invoice, Payment

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY


class CreateCheckoutSessionView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, invoice_id):
        invoice = get_object_or_404(Invoice, id=invoice_id)

        # Determine success/cancel URLs
        # In production, use settings.FRONTEND_URL
        domain_url = (
            settings.CORS_ALLOWED_ORIGINS[0]
            if settings.CORS_ALLOWED_ORIGINS
            else "http://localhost:3000"
        )

        try:
            checkout_session = stripe.checkout.Session.create(
                client_reference_id=str(invoice.id),
                success_url=domain_url + "/payment/success?session_id={CHECKOUT_SESSION_ID}",
                cancel_url=domain_url + "/payment/cancel",
                payment_method_types=["card"],
                mode="payment",
                line_items=[
                    {
                        "price_data": {
                            "currency": "usd",
                            "product_data": {
                                "name": f"Invoice {invoice.invoice_number}",
                                "description": f"Payment for Invoice {invoice.invoice_number}",
                            },
                            "unit_amount": int(float(invoice.total_amount) * 100),
                        },
                        "quantity": 1,
                    }
                ],
                customer_email=(
                    invoice.student.user.email if invoice.student and invoice.student.user else None
                ),
                metadata={"invoice_id": str(invoice.id), "invoice_number": invoice.invoice_number},
            )

            invoice.stripe_session_id = checkout_session["id"]
            invoice.save()

            return Response({"sessionId": checkout_session["id"], "url": checkout_session["url"]})
        except Exception as e:
            logger.error(f"Stripe Checkout Error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name="dispatch")
class StripeWebhookView(views.APIView):
    permission_classes = []

    def post(self, request):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
        event = None

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            self.handle_checkout_session(session)

        return Response(status=status.HTTP_200_OK)

    def handle_checkout_session(self, session):
        invoice_id = session.get("client_reference_id")
        if invoice_id:
            try:
                invoice = Invoice.objects.get(id=invoice_id)
                # Avoid duplicates
                if invoice.status != "paid":
                    invoice.status = "paid"
                    invoice.amount_paid = invoice.total_amount
                    invoice.save()

                    Payment.objects.create(
                        invoice=invoice,
                        amount=invoice.total_amount,
                        payment_method="stripe",
                        status="completed",
                        transaction_id=session.get("payment_intent") or session.get("id"),
                        payment_date=invoice.updated_at.date(),  # Or now
                    )
                    logger.info(f"Invoice {invoice.invoice_number} marked as paid via Stripe.")
            except Invoice.DoesNotExist:
                logger.error(f"Invoice {invoice_id} not found during webhook processing.")
