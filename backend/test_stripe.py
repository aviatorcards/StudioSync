import os
import sys
import django
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from dotenv import load_dotenv
load_dotenv()

django.setup()

from apps.billing.models import Invoice, InvoiceLineItem
from apps.core.models import Studio, Student
from django.utils import timezone
import stripe
from django.conf import settings

print(f"Using STRIPE_SECRET_KEY: {settings.STRIPE_SECRET_KEY[:8]}...")
stripe.api_key = settings.STRIPE_SECRET_KEY

studio = Studio.objects.first()
student = Student.objects.first()

if not studio or not student:
    print("Setting up dummy studio and student for test...")
    from apps.core.models import User
    user, _ = User.objects.get_or_create(email="test@example.com", username="testuser")
    studio, _ = Studio.objects.get_or_create(name="Test Studio", owner=user)
    student, _ = Student.objects.get_or_create(user=user, studio=studio)

invoice = Invoice.objects.create(
    studio=studio,
    student=student,
    status="draft",
    due_date=timezone.now().date(),
)

InvoiceLineItem.objects.create(
    invoice=invoice,
    description="Test Guitar Lesson",
    quantity=1,
    unit_price=Decimal("45.00"),
)
InvoiceLineItem.objects.create(
    invoice=invoice,
    description="Sheet Music",
    quantity=1,
    unit_price=Decimal("15.50"),
)

invoice.calculate_totals()
invoice.status = "sent"
invoice.save()

print(f"✅ Created Invoice {invoice.invoice_number} in local DB. Total: ${invoice.total_amount}")

try:
    checkout_session = stripe.checkout.Session.create(
        client_reference_id=str(invoice.id),
        success_url="http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url="http://localhost:3000/payment/cancel",
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
        customer_email="test_student@example.com",
        metadata={"invoice_id": str(invoice.id), "invoice_number": invoice.invoice_number},
    )
    print("✅ Successfully generated a Stripe Checkout Session via the API!")
    print(f"🔗 Go to this URL to test paying the invoice: \n{checkout_session['url']}\n")
except Exception as e:
    print(f"❌ Stripe Error: {str(e)}")
