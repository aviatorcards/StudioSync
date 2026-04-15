# Migration: Add band association, status, gig context to Setlist,
# notes field to SetlistResource, and create SetlistComment model.

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0014_remove_student_skill_level"),
        ("resources", "0007_bulk_upload_folders"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Remove unique_together on Setlist (studio, name)
        migrations.AlterUniqueTogether(
            name="setlist",
            unique_together=set(),
        ),
        # Add band FK to Setlist
        migrations.AddField(
            model_name="setlist",
            name="band",
            field=models.ForeignKey(
                blank=True,
                help_text="If set, this setlist belongs to a specific band",
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="setlists",
                to="core.band",
            ),
        ),
        # Add status field to Setlist
        migrations.AddField(
            model_name="setlist",
            name="status",
            field=models.CharField(
                choices=[
                    ("draft", "Draft"),
                    ("proposed", "Proposed"),
                    ("confirmed", "Confirmed"),
                    ("archived", "Archived"),
                ],
                default="draft",
                max_length=20,
            ),
        ),
        # Add event_date to Setlist
        migrations.AddField(
            model_name="setlist",
            name="event_date",
            field=models.DateTimeField(
                blank=True,
                help_text="Date/time of the gig or performance",
                null=True,
            ),
        ),
        # Add venue to Setlist
        migrations.AddField(
            model_name="setlist",
            name="venue",
            field=models.CharField(
                blank=True,
                help_text="Venue or location name",
                max_length=300,
            ),
        ),
        # Add notes field to SetlistResource
        migrations.AddField(
            model_name="setlistresource",
            name="notes",
            field=models.CharField(
                blank=True,
                help_text="Per-song notes (e.g. key change, tempo)",
                max_length=500,
            ),
        ),
        # Create SetlistComment model
        migrations.CreateModel(
            name="SetlistComment",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("text", models.TextField(help_text="Comment text")),
                (
                    "is_approval",
                    models.BooleanField(
                        default=False,
                        help_text="If True, this comment doubles as an approval confirmation",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "setlist",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="comments",
                        to="resources.setlist",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="setlist_comments",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "resource_setlist_comments",
                "ordering": ["created_at"],
            },
        ),
    ]
