from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("notifications", "0002_alter_notification_notification_type"),
    ]

    operations = [
        migrations.AddField(
            model_name="notification",
            name="updated_at",
            field=models.DateTimeField(auto_now=True),
        ),
    ]
