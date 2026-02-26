import os
import django
from django.core.files.base import ContentFile
from django.utils import timezone

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.core.models import Studio, User
from apps.resources.models import Resource

def seed_resources():
    print("🌱 Seeding resources...")
    
    studio = Studio.objects.first()
    if not studio:
        print("❌ Error: No studio found. Run seed_data.py first.")
        return
        
    admin = User.objects.filter(role='admin').first()
    if not admin:
        print("❌ Error: No admin found. Run seed_data.py first.")
        return

    sample_resources = [
        {
            "title": "Autumn Leaves - Piano Arrangement",
            "description": "Advanced jazz piano arrangement of Autumn Leaves.",
            "resource_type": "pdf",
            "category": "Sheet Music",
            "instrument": "Piano",
            "composer": "Joseph Kosma",
            "content": b"%PDF-1.4\n1 0 obj\n<< /Title (Autumn Leaves) >>\nendobj",
            "filename": "autumn_leaves.pdf",
            "tags": ["jazz", "standard", "advanced"],
            "is_public": True
        },
        {
            "title": "Blues Scale Basics",
            "description": "Handout covering the blues scale in all 12 keys.",
            "resource_type": "pdf",
            "category": "Education",
            "instrument": "Guitar",
            "tags": ["blues", "theory", "beginner"],
            "content": b"%PDF-1.4\n1 0 obj\n<< /Title (Blues Scales) >>\nendobj",
            "filename": "blues_scales.pdf",
            "is_public": True
        },
        {
            "title": "Metronome Track - 120 BPM",
            "description": "Steady click at 120 BPM for practice.",
            "resource_type": "audio",
            "category": "Audio Tools",
            "content": b"ID3\x03\x00\x00\x00\x00\x00\x00\x00",
            "filename": "metronome_120.mp3",
            "tags": ["practice", "timing"],
            "is_public": False
        },
        {
            "title": "Vocal Warm-up Routine",
            "description": "Daily warm-up exercises for singers.",
            "resource_type": "audio",
            "category": "Education",
            "instrument": "Voice",
            "content": b"ID3\x03\x00\x00\x00\x00\x00\x00\x00",
            "filename": "vocal_warmup.mp3",
            "tags": ["vocal", "warmup"],
            "is_public": True
        },
        {
            "title": "Studio Inventory: Digital Piano",
            "description": "Manual for the studio's Roland FP-30.",
            "resource_type": "physical",
            "is_physical_item": True,
            "quantity_total": 2,
            "quantity_available": 2,
            "category": "Equipment",
            "tags": ["inventory", "piano"],
            "is_public": False
        },
        {
            "title": "Music Theory Online Course",
            "description": "Link to a free music theory course.",
            "resource_type": "link",
            "external_url": "https://www.musictheory.net/lessons",
            "category": "Links",
            "tags": ["theory", "online"],
            "is_public": True
        }
    ]

    for res_data in sample_resources:
        content = res_data.pop("content", None)
        filename = res_data.pop("filename", None)
        
        resource, created = Resource.objects.get_or_create(
            title=res_data["title"],
            studio=studio,
            defaults={
                "uploaded_by": admin,
                **res_data
            }
        )
        
        if created:
            if content and filename:
                resource.file.save(filename, ContentFile(content))
            print(f"✅ Created resource: {resource.title}")
        else:
            print(f"➖ Resource already exists: {resource.title}")

    print("🎉 Resource seeding complete!")

if __name__ == "__main__":
    seed_resources()
