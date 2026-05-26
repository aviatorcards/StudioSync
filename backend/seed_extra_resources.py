import os
import django
from django.core.files.base import ContentFile

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.core.models import Studio, User
from apps.resources.models import Resource

def seed_more_resources():
    print("🌱 Seeding even more resources...")
    
    studio = Studio.objects.first()
    admin = User.objects.filter(role='admin').first()

    extra_resources = [
        {
            "title": "Cello Suite No. 1 - Prelude",
            "description": "Standard cello repertoire.",
            "resource_type": "pdf",
            "category": "Sheet Music",
            "instrument": "Cello",
            "composer": "J.S. Bach",
            "content": b"%PDF-1.4",
            "filename": "bach_cello_1.pdf",
            "is_public": True
        },
        {
            "title": "Studio Logo - High Res",
            "description": "The official studio logo.",
            "resource_type": "image",
            "category": "Marketing",
            "content": b"\x89PNG\r\n\x1a\n",
            "filename": "logo.png",
            "is_public": False
        },
        {
            "title": "Giant Steps - Saxophone Solo",
            "description": "Transcription of Coltrane's solo.",
            "resource_type": "pdf",
            "category": "Sheet Music",
            "instrument": "Saxophone",
            "composer": "John Coltrane",
            "content": b"%PDF-1.4",
            "filename": "giant_steps.pdf",
            "is_public": True
        }
    ]

    for res_data in extra_resources:
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



    print("🎉 Extra resource seeding complete!")

if __name__ == "__main__":
    seed_more_resources()
