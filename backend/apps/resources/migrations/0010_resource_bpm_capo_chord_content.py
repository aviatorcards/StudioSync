from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("resources", "0009_setlist_item_standalone"),
    ]

    operations = [
        migrations.AddField(
            model_name="resource",
            name="bpm",
            field=models.PositiveIntegerField(
                blank=True,
                null=True,
                help_text="Beats per minute (numeric)",
            ),
        ),
        migrations.AddField(
            model_name="resource",
            name="capo",
            field=models.PositiveSmallIntegerField(
                blank=True,
                null=True,
                help_text="Capo fret (0 = no capo)",
            ),
        ),
        migrations.AddField(
            model_name="resource",
            name="chord_content",
            field=models.TextField(
                blank=True,
                help_text="ChordPro-format chord chart text",
            ),
        ),
    ]
