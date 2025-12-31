#!/usr/bin/env python
"""
Script to create initial feature flags for StudioSync.
Run this after setting up the feature_flags app.
"""

import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.feature_flags.models import FeatureFlag

# Initial feature flags configuration
INITIAL_FLAGS = [
    {
        'key': 'stripe_payments',
        'name': 'Stripe Payments',
        'description': 'Enable Stripe payment processing integration',
        'flag_type': 'boolean',
        'enabled': False,
        'scope': 'global',
    },
    {
        'key': 'email_notifications',
        'name': 'Email Notifications',
        'description': 'Enable email notification system',
        'flag_type': 'boolean',
        'enabled': True,
        'scope': 'global',
    },
    {
        'key': 'sms_notifications',
        'name': 'SMS Notifications',
        'description': 'Enable SMS notification system',
        'flag_type': 'boolean',
        'enabled': False,
        'scope': 'global',
    },
    {
        'key': 'advanced_analytics',
        'name': 'Advanced Analytics',
        'description': 'Premium analytics and reporting features',
        'flag_type': 'boolean',
        'enabled': False,
        'scope': 'studio',
    },
    {
        'key': 'calendar_sync',
        'name': 'Calendar Synchronization',
        'description': 'Enable CalDAV calendar integration',
        'flag_type': 'boolean',
        'enabled': False,
        'scope': 'global',
    },
    {
        'key': 'api_webhooks',
        'name': 'API Webhooks',
        'description': 'Enable webhook functionality for API events',
        'flag_type': 'boolean',
        'enabled': False,
        'scope': 'global',
    },
    {
        'key': 'cloud_storage',
        'name': 'Cloud Storage',
        'description': 'Enable MinIO/R2 cloud storage integration',
        'flag_type': 'boolean',
        'enabled': True,
        'scope': 'global',
    },
    {
        'key': 'messaging_enabled',
        'name': 'In-App Messaging',
        'description': 'Enable in-app messaging between users',
        'flag_type': 'boolean',
        'enabled': False,
        'scope': 'global',
    },
    {
        'key': 'practice_rooms',
        'name': 'Practice Room Reservations',
        'description': 'Enable practice room booking system',
        'flag_type': 'boolean',
        'enabled': False,
        'scope': 'studio',
    },
]

def create_feature_flags():
    """Create initial feature flags if they don't exist."""
    created_count = 0
    updated_count = 0

    for flag_data in INITIAL_FLAGS:
        flag, created = FeatureFlag.objects.get_or_create(
            key=flag_data['key'],
            defaults={
                'name': flag_data['name'],
                'description': flag_data['description'],
                'flag_type': flag_data['flag_type'],
                'enabled': flag_data['enabled'],
                'scope': flag_data['scope'],
            }
        )

        if created:
            created_count += 1
            print(f"✓ Created: {flag.key} ({flag.name})")
        else:
            updated_count += 1
            print(f"- Exists: {flag.key} ({flag.name})")

    print(f"\n Summary:")
    print(f"  Created: {created_count}")
    print(f"  Already existed: {updated_count}")
    print(f"  Total: {len(INITIAL_FLAGS)}")

if __name__ == '__main__':
    print("Creating initial feature flags...\n")
    create_feature_flags()
    print("\n✅ Done!")
