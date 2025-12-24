import os
import sys
from pathlib import Path
import django

def create_initial_superuser():
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'tristan@fddl.dev')
    password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'admin123')
    
    if not User.objects.filter(email=email).exists():
        print(f'Creating superuser {email}...')
        User.objects.create_superuser(
            email=email,
            password=password,
            first_name='Admin',
            last_name='User'
        )
        print('Superuser created successfully!')
    else:
        print('Superuser already exists.')

if __name__ == '__main__':
    # Set up Django environment
    BASE_DIR = Path(__file__).resolve().parent
    sys.path.append(str(BASE_DIR))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()

    create_initial_superuser()
