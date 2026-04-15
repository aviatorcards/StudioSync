# Migration: Make SetlistResource a standalone item (song/break) without requiring a file.
# - Make resource FK nullable
# - Add title, artist, item_type, duration_minutes fields
# - Remove unique_together constraint

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("resources", "0008_setlist_band_comments"),
    ]

    operations = [
        # Remove old unique_together first
        migrations.AlterUniqueTogether(
            name="setlistresource",
            unique_together=set(),
        ),
        # Make resource FK nullable
        migrations.AlterField(
            model_name="setlistresource",
            name="resource",
            field=models.ForeignKey(
                blank=True,
                help_text="Optional linked resource (sheet music, chord chart, etc.)",
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="resources.resource",
            ),
        ),
        # Add title
        migrations.AddField(
            model_name="setlistresource",
            name="title",
            field=models.CharField(
                blank=True,
                help_text="Song title or break label",
                max_length=300,
            ),
        ),
        # Add artist
        migrations.AddField(
            model_name="setlistresource",
            name="artist",
            field=models.CharField(
                blank=True,
                help_text="Artist / composer name",
                max_length=300,
            ),
        ),
        # Add item_type
        migrations.AddField(
            model_name="setlistresource",
            name="item_type",
            field=models.CharField(
                choices=[("song", "Song"), ("break", "Break")],
                default="song",
                max_length=20,
            ),
        ),
        # Add duration_minutes
        migrations.AddField(
            model_name="setlistresource",
            name="duration_minutes",
            field=models.PositiveIntegerField(
                blank=True,
                help_text="Estimated duration in minutes",
                null=True,
            ),
        ),
    ]
