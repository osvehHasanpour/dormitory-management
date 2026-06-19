from django.db import migrations, models


CATEGORY_LABEL_TO_VALUE = {
    'سرویس بهداشتی': 'bathroom',
    'حمام': 'bath',
    'آشپزخانه': 'kitchen',
    'اتاق': 'room',
    'تأسیسات': 'facilities',
}


def migrate_maintenance_category(apps, schema_editor):
    MaintenanceRequest = apps.get_model('requests_app', 'MaintenanceRequest')

    for request in MaintenanceRequest.objects.all():
        extra_description = getattr(request, 'extra_description', '') or ''
        category = 'facilities'

        if extra_description.startswith('دسته\u200cبندی خرابی:'):
            label = extra_description.replace('دسته\u200cبندی خرابی:', '').strip()
            category = CATEGORY_LABEL_TO_VALUE.get(label, 'facilities')

        request.category = category
        request.save(update_fields=['category'])


class Migration(migrations.Migration):

    dependencies = [
        ('requests_app', '0003_rename_requests_ap_assigne_6e0f0d_idx_requests_ap_assigne_24443d_idx_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='maintenancerequest',
            name='category',
            field=models.CharField(
                choices=[
                    ('bathroom', 'سرویس بهداشتی'),
                    ('bath', 'حمام'),
                    ('kitchen', 'آشپزخانه'),
                    ('room', 'اتاق'),
                    ('facilities', 'تأسیسات'),
                ],
                default='facilities',
                max_length=100,
                verbose_name='دسته\u200cبندی',
            ),
            preserve_default=False,
        ),
        migrations.RunPython(migrate_maintenance_category, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='maintenancerequest',
            name='extra_description',
        ),
    ]
