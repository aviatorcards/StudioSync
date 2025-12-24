"""
Seed script to populate the database with test data.
Creates an admin, a studio, 5 teachers, and 20 students.
"""
import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.utils import timezone
from apps.core.models import User, Studio, Teacher, Student

# Data for seeding
FIRST_NAMES = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]
INSTRUMENTS = ["Piano", "Guitar", "Violin", "Drums", "Vocal", "Saxophone", "Flute", "Cello"]
LEVELS = ["beginner", "intermediate", "advanced"]

def seed():
    print("🌱 Starting database seed...")

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
    if created or admin.check_password('admin123') is False:
        admin.set_password('admin123')
        admin.save()
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
        if user_created:
            user.set_password('teacher123')
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
        if user_created:
            user.set_password('student123')
            user.save()
            
        Student.objects.get_or_create(
            user=user,
            defaults={
                'studio': studio,
                'instrument': random.choice(INSTRUMENTS),
                'skill_level': random.choice(LEVELS),
                'primary_teacher': random.choice(teachers),
                'enrollment_date': timezone.now().date()
            }
        )
    
    print(f"✅ Created/Verified 20 Students")
    print("🎉 Seeding complete!")

if __name__ == "__main__":
    seed()
