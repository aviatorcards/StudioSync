from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0019_register_schedules"),
    ]

    operations = [
        migrations.AddField(
            model_name="setupstatus",
            name="setup_token",
            field=models.CharField(blank=True, default="", max_length=128),
        ),
    ]
