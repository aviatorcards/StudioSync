"""
Seed script to populate the database with instructors, students, bands, and gigs.
Requires seed_data.py to have been run first (needs Studio to exist).

Usage:
    python seed_gigs.py
    docker compose exec backend python seed_gigs.py
"""

import os
import random
import sys
from datetime import timedelta

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.utils import timezone  # noqa: E402

from apps.core.models import Band, Student, Studio, Teacher, User  # noqa: E402
from apps.gigs.models import BandAvailability, Gig, GigClaim  # noqa: E402

FIRST_NAMES = [
    "Aria", "Blake", "Chloe", "Diego", "Elena", "Felix", "Grace", "Hugo",
    "Iris", "Jordan", "Kira", "Liam", "Maya", "Noah", "Olivia", "Pedro",
    "Quinn", "Rosa", "Sam", "Tara", "Uma", "Victor", "Willow", "Xena",
    "Yara", "Zach",
]
LAST_NAMES = [
    "Adams", "Bishop", "Cruz", "Dean", "Ellis", "Ford", "Grant", "Hayes",
    "Irwin", "James", "King", "Lane", "Moss", "Nash", "Owen", "Parks",
    "Quinn", "Reed", "Scott", "Torres", "Upton", "Vega", "Walsh", "Xavier",
    "Young", "Zimmerman",
]
INSTRUMENTS = ["Piano", "Guitar", "Bass", "Violin", "Drums", "Vocals", "Saxophone", "Flute", "Trumpet", "Cello"]
GENRES = ["Rock", "Jazz", "Classical", "Pop", "Blues", "Country", "R&B", "Folk", "Metal", "Indie"]
BAND_ADJECTIVES = ["Electric", "Acoustic", "Midnight", "Golden", "Silver", "Crystal", "Thunder", "Neon", "Wild", "Velvet"]
BAND_NOUNS = ["Wolves", "Rivers", "Echoes", "Storm", "Sparks", "Tide", "Horizon", "Drift", "Pulse", "Cadence"]
VENUES = [
    "The Blue Note Lounge", "Riverside Amphitheater", "The Grand Ballroom",
    "Murphy's Pub", "City Park Stage", "The Jazz Cellar", "Rooftop Sessions",
    "The Mill Concert Hall", "Harbor Festival Grounds", "Blackwood Theater",
]
GIG_TITLES = [
    "Summer Showcase", "Friday Night Live", "Charity Benefit Concert",
    "Season Opener", "Downtown Street Festival", "Open Mic Night",
    "New Year's Eve Gala", "Alumni Showcase", "Battle of the Bands",
    "Community Arts Night", "Spring Recital Reception", "Jazz Brunch",
    "Rock the Block", "Acoustic Evening", "Holiday Celebration",
]


def random_name():
    return random.choice(FIRST_NAMES), random.choice(LAST_NAMES)


def seed():
    print("🌱 Seeding instructors, students, bands, and gigs...")

    studio = Studio.objects.first()
    if not studio:
        print("❌ No Studio found. Run seed_data.py first.")
        sys.exit(1)

    print(f"   Using studio: {studio.name}")

    # --- Instructors ---
    new_teachers = []
    for i in range(1, 6):
        email = f"instructor{i}@test.com"
        first, last = random_name()
        user, created = User.objects.get_or_create(
            email=email,
            defaults={"first_name": first, "last_name": last, "role": "teacher", "is_active": True},
        )
        if created or not user.has_usable_password():
            user.set_password("teacher123")
            user.save()

        primary_instrument = random.choice(INSTRUMENTS)
        secondary_instrument = random.choice([i for i in INSTRUMENTS if i != primary_instrument])
        teacher, _ = Teacher.objects.get_or_create(
            user=user,
            defaults={
                "studio": studio,
                "bio": f"Specializes in {primary_instrument} and {secondary_instrument} with over {random.randint(5, 20)} years of teaching experience.",
                "instruments": [primary_instrument, secondary_instrument],
                "hourly_rate": random.randint(50, 120),
            },
        )
        new_teachers.append(teacher)

    print(f"✅ Created/verified 5 instructors (instructor1@test.com … instructor5@test.com / teacher123)")

    # Gather all teachers for student assignment
    all_teachers = list(Teacher.objects.filter(studio=studio))

    # --- Students ---
    new_students = []
    for i in range(1, 16):
        email = f"gig_student{i}@test.com"
        first, last = random_name()
        user, created = User.objects.get_or_create(
            email=email,
            defaults={"first_name": first, "last_name": last, "role": "student", "is_active": True},
        )
        if created or not user.has_usable_password():
            user.set_password("student123")
            user.save()

        student, _ = Student.objects.get_or_create(
            user=user,
            defaults={
                "studio": studio,
                "instrument": random.choice(INSTRUMENTS),
                "primary_teacher": random.choice(all_teachers) if all_teachers else None,
                "enrollment_date": timezone.now().date() - timedelta(days=random.randint(30, 365)),
            },
        )
        new_students.append(student)

    print(f"✅ Created/verified 15 students (gig_student1@test.com … gig_student15@test.com / student123)")

    all_students = list(Student.objects.filter(studio=studio))

    # --- Bands ---
    bands = []
    band_defs = [
        {"name": f"{random.choice(BAND_ADJECTIVES)} {random.choice(BAND_NOUNS)}", "genre": random.choice(GENRES)}
        for _ in range(6)
    ]
    # Deduplicate names in case of collision
    seen_names = set()
    unique_band_defs = []
    for bd in band_defs:
        if bd["name"] not in seen_names:
            seen_names.add(bd["name"])
            unique_band_defs.append(bd)
        else:
            bd["name"] = f"The {random.choice(LAST_NAMES)} Collective"
            seen_names.add(bd["name"])
            unique_band_defs.append(bd)

    admin_user = User.objects.filter(role="admin").first()

    for i, bd in enumerate(unique_band_defs, start=1):
        band, created = Band.objects.get_or_create(
            studio=studio,
            name=bd["name"],
            defaults={
                "genre": bd["genre"],
                "primary_contact": admin_user,
                "billing_email": f"band{i}@test.com",
                "billing_phone": f"555-010{i}",
                "city": studio.city or "Nashville",
                "state": studio.state or "TN",
                "notes": f"A {bd['genre']} band with {random.randint(3, 6)} members.",
            },
        )
        bands.append(band)

    print(f"✅ Created/verified {len(bands)} bands")

    # --- Band Members ---
    # Assign 2–4 students to each band so they can interact with gigs/availability
    for band in bands:
        members = random.sample(all_students, min(random.randint(2, 4), len(all_students)))
        band.members.set(members)

    print("✅ Assigned students to bands")

    # --- Band Availability ---
    now = timezone.now()
    for band in bands:
        for month_offset in range(3):  # current month + 2 ahead
            month_start = (now.replace(day=1) + timedelta(days=32 * month_offset)).replace(day=1)
            # Compute real days in month
            next_month = month_start.replace(month=month_start.month % 12 + 1, day=1) if month_start.month < 12 else month_start.replace(year=month_start.year + 1, month=1, day=1)
            days_in_month = (next_month - timedelta(days=1)).day
            # Use { available_days: [...], notes: "" } — the shape the frontend expects
            available_days = sorted(random.sample(range(1, days_in_month + 1), random.randint(8, 18)))
            availability_data = {
                "available_days": available_days,
                "notes": random.choice(["", "", "Available evenings only", "No Sundays", "Prefer weekends"]),
            }
            BandAvailability.objects.get_or_create(
                band=band,
                month=month_start.date(),
                defaults={
                    "availability_data": availability_data,
                    "is_submitted": True,
                    "submitted_at": now,
                },
            )

    print("✅ Created band availability for 3 months")

    # --- Gigs ---
    gig_statuses = ["open", "open", "pending_approval", "assigned", "completed", "cancelled"]
    created_gigs = 0

    for i in range(20):
        days_out = random.randint(-14, 60)  # mix of past and future
        start_hour = random.randint(17, 21)
        gig_start = now.replace(hour=start_hour, minute=0, second=0, microsecond=0) + timedelta(days=days_out)
        duration_hours = random.choice([1, 2, 3])
        gig_end = gig_start + timedelta(hours=duration_hours)

        status = random.choice(gig_statuses)
        assigned_band = random.choice(bands) if status in ("assigned", "completed") else None
        pay_type = random.choice(["flat", "hourly"])
        pay_rate = random.randint(200, 1500) if pay_type == "flat" else random.randint(50, 150)

        title = random.choice(GIG_TITLES)
        venue = random.choice(VENUES)

        gig, created = Gig.objects.get_or_create(
            studio=studio,
            title=title,
            scheduled_start=gig_start,
            defaults={
                "description": f"Join us for a great night of live music at {venue}. Dress code: smart casual.",
                "venue": venue,
                "scheduled_end": gig_end,
                "band": assigned_band,
                "status": status,
                "pay_rate": pay_rate,
                "pay_type": pay_type,
            },
        )
        if created:
            created_gigs += 1

            # For open/pending gigs, create a claim from a random band
            if status in ("open", "pending_approval") and bands:
                claiming_band = random.choice(bands)
                claim_status = "pending" if status == "open" else "approved"
                GigClaim.objects.get_or_create(
                    gig=gig,
                    band=claiming_band,
                    defaults={"status": claim_status, "notes": "We're available and would love to play this one!"},
                )

    print(f"✅ Created {created_gigs} gigs (open, pending, assigned, completed, cancelled)")
    print("🎉 Gig seeding complete!")
    print()
    print("   Credentials summary:")
    print("   Instructors: instructor1@test.com … instructor5@test.com  /  teacher123")
    print("   Students:    gig_student1@test.com … gig_student15@test.com  /  student123")


if __name__ == "__main__":
    seed()
