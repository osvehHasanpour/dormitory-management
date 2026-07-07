from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('classes', '0002_class_location_status_rating_comment'),
    ]

    operations = [
        migrations.AddField(
            model_name='class',
            name='day_of_week',
            field=models.CharField(
                blank=True,
                choices=[
                    ('saturday', 'شنبه'),
                    ('sunday', 'یکشنبه'),
                    ('monday', 'دوشنبه'),
                    ('tuesday', 'سه‌شنبه'),
                    ('wednesday', 'چهارشنبه'),
                    ('thursday', 'پنج‌شنبه'),
                    ('friday', 'جمعه'),
                ],
                default='',
                max_length=20,
                verbose_name='روز برگزاری',
            ),
        ),
        migrations.AddField(
            model_name='class',
            name='end_time',
            field=models.TimeField(blank=True, null=True, verbose_name='زمان پایان کلاس'),
        ),
        migrations.AddField(
            model_name='class',
            name='start_time',
            field=models.TimeField(blank=True, null=True, verbose_name='زمان شروع کلاس'),
        ),
    ]
