"""
Quick script to update admin email
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.core.models import User

try:
    admin = User.objects.get(email='admin@test.com')
    new_email = input("Enter your real email address: ")
    admin.email = new_email
    admin.save()
    print(f"✅ Admin email updated to: {admin.email}")
except User.DoesNotExist:
    print("❌ Admin user with email 'admin@test.com' not found")
