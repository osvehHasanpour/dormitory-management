from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('requests_app', '0004_maintenance_category_remove_extra_description'),
    ]

    operations = [
        migrations.AddField(
            model_name='requestbase',
            name='supervisor_response',
            field=models.TextField(
                blank=True,
                null=True,
                verbose_name='پاسخ سرپرست',
            ),
        ),
    ]
