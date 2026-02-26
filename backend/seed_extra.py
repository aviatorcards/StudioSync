"""
Enhanced seed script to populate the database with comprehensive test data.
Builds on top of the initial seed_data.py.
Creates Families, Bands, Inventory, Lessons, Billing, and Resources.
"""

import os
import random
import uuid
from datetime import date, timedelta
from decimal import Decimal

import django
from django.utils import timezone

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from faker import Faker  # noqa: E402

from apps.billing.models import (  # noqa: E402
    Invoice,
    InvoiceLineItem,
    Payment,
    PaymentMethod,
)
from apps.core.models import (  # noqa: E402
    Band,
    Family,
    Student,
    Studio,
    Teacher,
    User,
)
from apps.inventory.models import (  # noqa: E402
    CheckoutLog,
    InventoryItem,
    PracticeRoom,
    RoomReservation,
)
from apps.lessons.models import (  # noqa: E402
    Lesson,
    LessonNote,
    RecurringPattern,
    StudentGoal,
)
from apps.resources.models import Resource, Setlist, SetlistResource  # noqa: E402

fake = Faker()


def seed_extra():
    print("🌱 Starting enhanced database seed...")

    # 1. Get existing core data
    try:
        studio = Studio.objects.get(name="StudioSync Academy")
        admin = User.objects.get(email="admin@test.com")
        teachers = list(Teacher.objects.filter(studio=studio))
        students = list(Student.objects.filter(studio=studio))
    except (Studio.DoesNotExist, User.DoesNotExist):
        print("❌ Error: Basic seed data not found. Please run seed_data.py first.")
        return

    if not teachers or not students:
        print("❌ Error: No teachers or students found. Please run seed_data.py first.")
        return

    # 2. Create Families
    print("👨‍👩‍👧‍👦 Creating Families...")
    families = []
    # Create 5 families, each with 2 parents and 2-3 students
    for i in range(5):
        last_name = fake.last_name()
        primary_parent, _ = User.objects.get_or_create(
            email=f"parent{i*2+1}@test.com",
            defaults={
                "first_name": fake.first_name(),
                "last_name": last_name,
                "role": "parent",
                "is_active": True,
            },
        )
        if not primary_parent.has_usable_password():
            primary_parent.set_password("parent123")
            primary_parent.save()

        secondary_parent, _ = User.objects.get_or_create(
            email=f"parent{i*2+2}@test.com",
            defaults={
                "first_name": fake.first_name(),
                "last_name": last_name,
                "role": "parent",
                "is_active": True,
            },
        )
        if not secondary_parent.has_usable_password():
            secondary_parent.set_password("parent123")
            secondary_parent.save()

        family, _ = Family.objects.get_or_create(
            studio=studio,
            primary_parent=primary_parent,
            defaults={
                "secondary_parent": secondary_parent,
                "emergency_contact_name": f"{primary_parent.first_name} {primary_parent.last_name}",
                "emergency_contact_phone": "555-0100",
                "address": fake.address(),
                "billing_email": primary_parent.email,
            },
        )
        families.append(family)

        # Assign 2-3 random students to this family
        family_students = random.sample(students, random.randint(2, 3))
        for student in family_students:
            student.family = family
            student.save()

            # Backdate student creation for growth chart
            backdate_days = random.randint(0, 180)
            created_at = timezone.now() - timedelta(days=backdate_days)
            Student.objects.filter(id=student.id).update(created_at=created_at)

    # 3. Create Bands
    print("🎸 Creating Bands...")
    bands = []
    band_names = ["The Rocking Notes", "Jazz Quartet", "Midnight Melodies", "String Ensemble"]
    genres = ["Rock", "Jazz", "Classical", "Pop"]

    for i, name in enumerate(band_names):
        band, _ = Band.objects.get_or_create(
            studio=studio,
            name=name,
            defaults={
                "genre": genres[i % len(genres)],
                "primary_contact": admin,
                "billing_email": f"contact@{name.lower().replace(' ', '')}.com",
                "notes": f"A great {genres[i % len(genres)]} band.",
            },
        )
        bands.append(band)

        # Assign 3-5 random students as members
        member_students = random.sample(students, random.randint(3, 5))
        for student in member_students:
            student.bands.add(band)

    # 4. Create Inventory Items
    print("📦 Creating Inventory...")
    categories = ["instrument", "equipment", "sheet-music", "accessories"]
    for i in range(15):
        category = random.choice(categories)
        name = f"{fake.word().capitalize()} {category.replace('-', ' ').capitalize()}"
        item, _ = InventoryItem.objects.get_or_create(
            name=name,
            category=category,
            defaults={
                "quantity": random.randint(1, 10),
                "available_quantity": random.randint(0, 5),
                "condition": random.choice(["excellent", "good", "fair"]),
                "status": "available",
                "location": f"Shelf {random.randint(1, 10)}",
                "value": Decimal(random.randint(20, 1000)),
                "is_borrowable": True,
                "created_by": admin,
            },
        )

        # Create some checkouts for these items
        if item.available_quantity > 0:
            for _ in range(random.randint(0, 2)):
                student_user = random.choice(students).user
                CheckoutLog.objects.create(
                    item=item,
                    student=student_user,
                    quantity=1,
                    due_date=date.today() + timedelta(days=7),
                    status=random.choice(["pending", "approved"]),
                    approved_by=admin if random.choice([True, False]) else None,
                )

    # 5. Create Practice Rooms
    print("🎹 Creating Practice Rooms...")
    rooms = []
    for name in ["Studio A", "Studio B", "Recital Hall"]:
        room, _ = PracticeRoom.objects.get_or_create(
            name=name,
            defaults={
                "capacity": 2 if "Studio" in name else 50,
                "equipment": "Piano, Music Stand" if "Studio" in name else "Grand Piano, Stage Lights",
                "hourly_rate": Decimal("15.00") if "Studio" in name else Decimal("50.00"),
            },
        )
        rooms.append(room)

        # Create some reservations
        for i in range(5):
            student_user = random.choice(students).user
            start = timezone.now() + timedelta(days=i, hours=random.randint(9, 17))
            RoomReservation.objects.get_or_create(
                room=room,
                student=student_user,
                start_time=start,
                defaults={
                    "end_time": start + timedelta(hours=1),
                    "status": "confirmed",
                    "is_paid": random.choice([True, False]),
                },
            )

    # 6. Create Lessons & Recurring Patterns
    print("📅 Creating Lessons & Recurring Patterns...")
    for student in students:
        teacher = student.primary_teacher or random.choice(teachers)

        # Create Recurring Pattern
        pattern, _ = RecurringPattern.objects.get_or_create(
            teacher=teacher,
            student=student,
            defaults={
                "frequency": "weekly",
                "day_of_week": random.randint(0, 4),
                "time": f"{random.randint(9, 17):02d}:00:00",
                "duration_minutes": 60,
                "start_date": date.today() - timedelta(days=30),
            },
        )

        # Create some past lessons (completed)
        for i in range(1, 5):
            # Use a fixed hour to make it easier to avoid duplicates if re-run on same day
            lesson_start = (timezone.now() - timedelta(weeks=i)).replace(hour=10, minute=0, second=0, microsecond=0)
            lesson, _ = Lesson.objects.get_or_create(
                studio=studio,
                teacher=teacher,
                student=student,
                scheduled_start=lesson_start,
                defaults={
                    "scheduled_end": lesson_start + timedelta(hours=1),
                    "status": "completed",
                    "lesson_type": "private",
                    "rate": teacher.hourly_rate or Decimal("50.00"),
                    "is_paid": True,
                },
            )

            # Add Lesson Note
            LessonNote.objects.get_or_create(
                lesson=lesson,
                teacher=teacher,
                defaults={
                    "content": fake.paragraph(),
                    "practice_assignments": fake.sentence(),
                    "progress_rating": random.randint(3, 5),
                },
            )

        # Create some future lessons (scheduled)
        for i in range(4):
            lesson_start = (timezone.now() + timedelta(weeks=i)).replace(hour=11, minute=0, second=0, microsecond=0)
            Lesson.objects.get_or_create(
                studio=studio,
                teacher=teacher,
                student=student,
                scheduled_start=lesson_start,
                defaults={
                    "scheduled_end": lesson_start + timedelta(hours=1),
                    "status": "scheduled",
                    "lesson_type": "private",
                },
            )

    # 7. Create Billing (Invoices & Payments)
    print("💰 Creating Billing data...")
    # Invoices for students
    for student in students[:10]:
        # Create invoices for the last 4 months
        for m in range(4):
            issue_date = date.today() - timedelta(days=m * 30 + random.randint(0, 15))
            invoice, created = Invoice.objects.get_or_create(
                studio=studio,
                student=student,
                issue_date=issue_date,
                defaults={
                    "teacher": student.primary_teacher,
                    "due_date": issue_date + timedelta(days=14),
                    "status": "paid" if m > 0 else random.choice(["sent", "paid", "partial", "overdue"]),
                }
            )

            if created:
                # Add line items
                InvoiceLineItem.objects.create(
                    invoice=invoice, description="Monthly Tuition - Private Lessons", unit_price=Decimal("200.00")
                )
                invoice.calculate_totals()

                # Add payment for paid invoices
                if invoice.status == "paid":
                    Payment.objects.create(
                        invoice=invoice,
                        amount=invoice.total_amount,
                        payment_method="credit_card",
                        status="completed",
                        processed_by=admin,
                        processed_at=timezone.make_aware(timezone.datetime.combine(issue_date, timezone.datetime.min.time())),
                    )
                    invoice.amount_paid = invoice.total_amount
                    invoice.save()
                    # Backdate invoice created_at too (for charts that use created_at)
                    Invoice.objects.filter(id=invoice.id).update(created_at=timezone.make_aware(timezone.datetime.combine(issue_date, timezone.datetime.min.time())))

    # Invoices for bands
    for band in bands:
        invoice, created = Invoice.objects.get_or_create(
            studio=studio,
            band=band,
            defaults={
                "due_date": date.today() + timedelta(days=14),
                "status": "sent",
            }
        )
        if created:
            InvoiceLineItem.objects.create(
                invoice=invoice, description="Band Rehearsal - Room Rental", unit_price=Decimal("100.00")
            )
            invoice.calculate_totals()

        # Add a Payment Method for the band
        PaymentMethod.objects.get_or_create(
            band=band,
            provider="stripe",
            defaults={
                "provider_payment_method_id": f"pm_{uuid.uuid4().hex[:12]}",
                "card_last_four": f"{random.randint(1000, 9999)}",
                "card_brand": "Visa",
                "is_default": True,
            }
        )

    # 8. Create Student Goals
    print("🎯 Creating Student Goals...")
    goal_titles = [
        "Master C Major Scale",
        "Perform at Winter Recital",
        "Learn 'Für Elise'",
        "Improve Sight Reading",
        "Memorize 3 Jazz Standards",
    ]
    for student in students:
        for title in random.sample(goal_titles, random.randint(1, 2)):
            StudentGoal.objects.get_or_create(
                student=student,
                title=title,
                defaults={
                    "teacher": student.primary_teacher,
                    "description": fake.sentence(),
                    "status": random.choice(["active", "achieved"]),
                    "target_date": date.today() + timedelta(days=random.randint(30, 90)),
                    "progress_percentage": random.randint(0, 100),
                }
            )

    # 9. Create Resources & Setlists
    print("📚 Creating Resources & Setlists...")
    instruments = ["Piano", "Guitar", "Violin", "Drums", "Vocal"]
    resource_types = ["pdf", "audio", "sheet_music", "chord_chart"]

    for i in range(10):
        resource, created = Resource.objects.get_or_create(
            studio=studio,
            title=f"{instruments[i%5]} Practice {i+1}",
            defaults={
                "uploaded_by": admin,
                "description": fake.sentence(),
                "resource_type": random.choice(resource_types),
                "instrument": instruments[i%5],
                "is_public": True,
            }
        )

        if i < 3:
            # Create a setlist for the first few resources
            setlist, _ = Setlist.objects.get_or_create(
                studio=studio,
                name=f"Recital Prep - {instruments[i]}",
                defaults={"created_by": admin, "description": "Songs for the upcoming recital"},
            )
            SetlistResource.objects.get_or_create(setlist=setlist, resource=resource, defaults={"order": i})

    print("🎉 Seeding complete!")


if __name__ == "__main__":
    seed_extra()
