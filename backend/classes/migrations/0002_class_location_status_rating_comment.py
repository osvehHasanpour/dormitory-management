from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('classes', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='class',
            name='location',
            field=models.CharField(blank=True, max_length=200, verbose_name='مکان'),
        ),
        migrations.AddField(
            model_name='class',
            name='status',
            field=models.CharField(
                choices=[
                    ('active', 'فعال'),
                    ('completed', 'پایان\u200cیافته'),
                    ('cancelled', 'لغو شده'),
                ],
                default='active',
                max_length=20,
                verbose_name='وضعیت',
            ),
        ),
        migrations.AddField(
            model_name='rating',
            name='comment',
            field=models.TextField(blank=True, verbose_name='نظر'),
        ),
    ]
