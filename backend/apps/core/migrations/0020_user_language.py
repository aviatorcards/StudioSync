from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0019_register_schedules"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="language",
            field=models.CharField(
                blank=True,
                choices=[("en", "English"), ("de", "German")],
                default="",
                help_text="Preferred UI language. Blank follows the browser cookie.",
                max_length=8,
            ),
        ),
    ]
