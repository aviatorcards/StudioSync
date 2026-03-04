"""
Seed script to generate random calendar events and "chaos" to make the schedule look busy.
Adds workshops, recitals, makeup lessons, and band rehearsals.
Run this after seed_data.py and seed_extra.py.
"""

import os
import random
from datetime import date, datetime, timedelta
from decimal import Decimal

import django
from django.utils import timezone

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from faker import Faker  # noqa: E402

from apps.core.models import Band, Student, Studio, Teacher  # noqa: E402
from apps.inventory.models import PracticeRoom  # noqa: E402
from apps.lessons.models import Lesson, LessonNote  # noqa: E402

fake = Faker()


def seed_chaos(days_back=30, days_forward=60, density=0.7):
    print(f"🎲 Generating calendar chaos for the next {days_forward} days and past {days_back} days...")

    # 1. Get existing data
    studio = Studio.objects.first()
    if not studio:
        print("❌ Error: No studio found. Please run seed_data.py first.")
        return

    teachers = list(Teacher.objects.filter(studio=studio))
    students = list(Student.objects.filter(studio=studio))
    bands = list(Band.objects.filter(studio=studio))
    rooms = list(PracticeRoom.objects.all())

    if not teachers or not students:
        print("❌ Error: No teachers or students found. Please run seed_data.py first.")
        return

    # 2. Define event types and their characteristics
    EVENT_TYPES = [
        {"type": "workshop", "name": "Masterclass", "duration": 120, "prob": 0.05},
        {"type": "recital", "name": "Studio Recital", "duration": 180, "prob": 0.02},
        {"type": "group", "name": "Group Theory Class", "duration": 60, "prob": 0.1},
        {"type": "makeup", "name": "Makeup Lesson", "duration": 45, "prob": 0.15},
        {"type": "private", "name": "Ad-hoc Private Session", "duration": 60, "prob": 0.2},
    ]

    total_events = 0
    start_date = timezone.now().date() - timedelta(days=days_back)
    end_date = timezone.now().date() + timedelta(days=days_forward)
    
    current_date = start_date
    while current_date <= end_date:
        # Determine how many "extra" events happen today
        # Weekends might have more or fewer depending on studio type, let's just go with random density
        num_events_today = random.randint(0, 5) if random.random() < density else 0
        
        for _ in range(num_events_today):
            event_config = random.choices(
                EVENT_TYPES, 
                weights=[e["prob"] for e in EVENT_TYPES], 
                k=1
            )[0]
            
            # Pick a random teacher
            teacher = random.choice(teachers)
            
            # Pick a random student or band
            student = None
            band = None
            if event_config["type"] == "private" or event_config["type"] == "makeup":
                student = random.choice(students)
            elif event_config["type"] == "group" or event_config["type"] == "workshop":
                # Group lessons might have one primary student or none (if handled differently)
                # For this script, we'll assign a random student as the "primary"
                student = random.choice(students)
            
            # Occasionally link to a band instead
            if bands and random.random() < 0.2:
                band = random.choice(bands)
                student = None # Band lessons usually don't have a single student focus in this model
            
            # Pick a random room
            room = random.choice(rooms) if rooms else None
            
            # Pick a random time between 9 AM and 8 PM
            hour = random.randint(9, 19)
            minute = random.choice([0, 15, 30, 45])
            
            # Create the datetime
            # Use timezone-aware datetime
            scheduled_start = timezone.make_aware(
                datetime.combine(current_date, datetime.min.time().replace(hour=hour, minute=minute))
            )
            scheduled_end = scheduled_start + timedelta(minutes=event_config["duration"])
            
            # Check for overlaps for the same teacher (simple check)
            if Lesson.objects.filter(
                teacher=teacher,
                scheduled_start__lt=scheduled_end,
                scheduled_end__gt=scheduled_start
            ).exists():
                continue

            status = "scheduled"
            if current_date < timezone.now().date():
                status = random.choice(["completed", "no_show", "cancelled"])
            elif current_date == timezone.now().date():
                # If it's today, it could be anything
                if scheduled_start < timezone.now():
                    status = "completed"
                else:
                    status = "scheduled"

            lesson, created = Lesson.objects.get_or_create(
                studio=studio,
                teacher=teacher,
                scheduled_start=scheduled_start,
                defaults={
                    "student": student,
                    "band": band,
                    "room": room,
                    "scheduled_end": scheduled_end,
                    "lesson_type": event_config["type"],
                    "status": status,
                    "rate": teacher.hourly_rate or Decimal("50.00"),
                    "summary": f"{event_config['name']} for {student.user.get_full_name() if student else (band.name if band else 'General')}",
                    "location": room.name if room else "Main Hall",
                }
            )
            
            if created:
                total_events += 1
                # Enhance lesson note with realistic musical data
                MUSICAL_PIECES = ["Für Elise", "Moonlight Sonata", "Clair de Lune", "Canon in D", "Autumn Leaves", "Imagine"]
                TECHNIQUES = ["Major Scales", "Arpeggios", "Vibrato", "Sight Reading", "Ear Training"]
                
                if status == "completed":
                    pieces = random.sample(MUSICAL_PIECES, random.randint(1, 2))
                    LessonNote.objects.create(
                        lesson=lesson,
                        teacher=teacher,
                        content=f"Today we focused on {', '.join(pieces)}. {fake.paragraph(nb_sentences=2)}",
                        pieces_practiced=pieces,
                        practice_assignments=f"Focus on {random.choice(TECHNIQUES)} and the first 16 bars of {pieces[0]}.",
                        strengths=f"Good {random.choice(TECHNIQUES)} control.",
                        progress_rating=random.randint(3, 5)
                    )

        current_date += timedelta(days=1)

    print(f"✅ Successfully added {total_events} random events to the calendar.")
    print("🎉 Chaos seeding complete!")


if __name__ == "__main__":
    # Allow running with custom parameters
    import sys
    
    db = 30
    df = 60
    dens = 0.7
    
    if len(sys.argv) > 1:
        db = int(sys.argv[1])
    if len(sys.argv) > 2:
        df = int(sys.argv[2])
    if len(sys.argv) > 3:
        dens = float(sys.argv[3])
        
    seed_chaos(days_back=db, days_forward=df, density=dens)
