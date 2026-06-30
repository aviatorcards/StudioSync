import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("gigs", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("core", "0017_user_is_approved"),
    ]

    operations = [
        # 1. Create Venue table
        migrations.CreateModel(
            name="Venue",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=200)),
                ("address", models.CharField(blank=True, max_length=300)),
                ("notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "studio",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="venues",
                        to="core.studio",
                    ),
                ),
                (
                    "allowed_posters",
                    models.ManyToManyField(
                        blank=True,
                        help_text="Users authorized to post gigs here. Empty = admin only.",
                        related_name="authorized_venues",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "gig_venues",
                "ordering": ["name"],
                "unique_together": {("studio", "name")},
            },
        ),
        # 2. Allow the existing venue CharField to be blank (old rows stay; new rows fill from FK)
        migrations.AlterField(
            model_name="gig",
            name="venue",
            field=models.CharField(blank=True, max_length=200),
        ),
        # 3. Add nullable venue_ref FK on Gig
        migrations.AddField(
            model_name="gig",
            name="venue_ref",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="gigs",
                to="gigs.venue",
            ),
        ),
    ]
