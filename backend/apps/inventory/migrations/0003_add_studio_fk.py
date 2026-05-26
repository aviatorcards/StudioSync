import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    """
    Adds studio FK to InventoryItem and PracticeRoom for proper multi-tenant scoping.
    Fields are nullable so existing rows are not broken; backfill studio values manually
    or via a data migration before making them required.
    """

    dependencies = [
        ("core", "0017_user_is_approved"),
        ("inventory", "0002_alter_checkoutlog_student_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="inventoryitem",
            name="studio",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="inventory_items",
                to="core.studio",
            ),
        ),
        migrations.AddField(
            model_name="practiceroom",
            name="studio",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="practice_rooms",
                to="core.studio",
            ),
        ),
    ]
