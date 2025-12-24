import os
import sys
from pathlib import Path
import django

def delete_superuser():
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'tristan@fddl.dev')
    
    from apps.core.models import Studio  # Adjust import path if needed
    
    try:
        user = User.objects.get(email=email)
        
        # Delete studios owned by this user
        studios = Studio.objects.filter(owner=user)
        count = studios.count()
        if count > 0:
            print(f'Deleting {count} studios owned by {email}...')
            studios.delete()
            
        user.delete()
        print(f'✅ Successfully deleted superuser: {email}')
    except User.DoesNotExist:
        print(f'ℹ️ User {email} does not exist.')

if __name__ == '__main__':
    # Set up Django environment
    BASE_DIR = Path(__file__).resolve().parent
    sys.path.append(str(BASE_DIR))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()

    delete_superuser()
