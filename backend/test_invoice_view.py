import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.billing.models import Invoice, Payment
from apps.billing.serializers import InvoiceSerializer

inv = Invoice.objects.filter(status='paid').exclude(stripe_session_id='').first()
if not inv:
    inv = Invoice.objects.filter(status='paid').first()

if inv:
    p = Payment.objects.filter(invoice=inv).first()
    if p and not p.transaction_id:
        p.transaction_id = 'pi_3Qt4vYBGsOYAIhUs1wL3zR2U'
        p.save()
    
    print("Payment transaction id:", p.transaction_id if p else "None found")
    data = InvoiceSerializer(inv).data
    print("Serialized stripe_transaction_id:", data.get('stripe_transaction_id'))
