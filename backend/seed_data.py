"""
Seed script to populate the database with test data.
Creates an admin, a studio, 5 teachers, and 20 students.

SECURITY NOTE: This script is for development/testing only.
For production/CI, set SEED_SECURE_MODE=true and provide passwords via env vars.

Environment Variables:
    SEED_SECURE_MODE: Set to 'true' to require env var passwords (for CI/production)
    SEED_ADMIN_PASSWORD: Password for admin user (defaults to 'admin123' in dev mode)
    SEED_TEACHER_PASSWORD: Password for teacher users (defaults to 'teacher123' in dev mode)
    SEED_STUDENT_PASSWORD: Password for student users (defaults to 'student123' in dev mode)
"""
import os
import django
import random
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.utils import timezone
from apps.core.models import User, Studio, Teacher, Student, SetupStatus

# Security mode for CI/production
SECURE_MODE = os.getenv('SEED_SECURE_MODE', 'false').lower() == 'true'

# Data for seeding
FIRST_NAMES = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]
INSTRUMENTS = ["Piano", "Guitar", "Violin", "Drums", "Vocal", "Saxophone", "Flute", "Cello"]

def get_password(env_var, default, role):
    """Get password from env var or use default in dev mode."""
    if SECURE_MODE:
        password = os.getenv(env_var)
        if not password:
            print(f"❌ ERROR: {env_var} is required when SEED_SECURE_MODE=true")
            sys.exit(1)
        return password
    else:
        # In dev mode, use default but show warning
        password = os.getenv(env_var, default)
        if password == default:
            print(f"⚠️  WARNING: Using default password for {role}. Set {env_var} or use SEED_SECURE_MODE=true for production.")
        return password


def seed():
    print("🌱 Starting database seed...")

    # Get passwords based on security mode
    admin_password = get_password('SEED_ADMIN_PASSWORD', 'admin123', 'admin')
    teacher_password = get_password('SEED_TEACHER_PASSWORD', 'teacher123', 'teachers')
    student_password = get_password('SEED_STUDENT_PASSWORD', 'student123', 'students')

    # 1. Ensure Admin exists
    admin, created = User.objects.get_or_create(
        email='admin@test.com',
        defaults={
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True
        }
    )
    if created or not admin.has_usable_password():
        admin.set_password(admin_password)
        admin.save()
        if SECURE_MODE:
            print("✅ Admin user created/updated: admin@test.com (password set from env)")
        else:
            print("✅ Admin user created/updated: admin@test.com / admin123")

    # 2. Ensure Studio exists
    studio, created = Studio.objects.get_or_create(
        name="StudioSync Academy",
        owner=admin,
        defaults={
            'email': 'contact@studiosync.com',
            'address_line1': '123 Music Lane',
            'city': 'Nashville',
            'state': 'TN'
        }
    )
    if created:
        print(f"✅ Studio created: {studio.name}")

    # 2.5 Ensure SetupStatus is complete (to prevent redirect to wizard)
    setup_status, status_created = SetupStatus.objects.get_or_create(
        defaults={
            'is_completed': True,
            'completed_at': timezone.now(),
            'setup_version': '1.0',
            'features_enabled': {
                'billing': True, 'inventory': True, 'messaging': True, 
                'resources': True, 'goals': True, 'bands': True, 
                'analytics': True, 'practice_rooms': True
            },
            'setup_data': {'completed_by': admin.email}
        }
    )
    if not setup_status.is_completed:
        setup_status.is_completed = True
        setup_status.save()
        print("✅ SetupStatus marked as complete")
    elif status_created:
        print("✅ SetupStatus created (complete)")

    # 3. Create 5 Teachers
    teachers = []
    for i in range(5):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        email = f"teacher{i+1}@test.com"
        
        user, user_created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first,
                'last_name': last,
                'role': 'teacher',
                'is_active': True
            }
        )
        if user_created or not user.has_usable_password():
            user.set_password(teacher_password)
            user.save()
        
        teacher, _ = Teacher.objects.get_or_create(
            user=user,
            defaults={
                'studio': studio,
                'bio': f"Experienced {random.choice(INSTRUMENTS)} instructor.",
                'instruments': [random.choice(INSTRUMENTS)],
                'hourly_rate': random.randint(40, 80)
            }
        )
        teachers.append(teacher)
    
    print(f"✅ Created/Verified 5 Teachers")

    # 4. Create 20 Students
    for i in range(1, 21):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        email = f"student{i}@test.com"
        
        user, user_created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first,
                'last_name': last,
                'role': 'student',
                'is_active': True
            }
        )
        if user_created or not user.has_usable_password():
            user.set_password(student_password)
            user.save()
            
        Student.objects.get_or_create(
            user=user,
            defaults={
                'studio': studio,
                'instrument': random.choice(INSTRUMENTS),
                'primary_teacher': random.choice(teachers),
                'enrollment_date': timezone.now().date()
            }
        )
    
    print(f"✅ Created/Verified 20 Students")
    print("🎉 Seeding complete!")

if __name__ == "__main__":
    seed()
