import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
from django.utils import timezone


class Migration(migrations.Migration):

    dependencies = [
        ('ideas', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='ideacomplaint',
            name='category',
            field=models.CharField(
                blank=True,
                choices=[
                    ('cleaning', 'نظافت'),
                    ('facilities', 'امکانات'),
                    ('welfare', 'رفاهی'),
                    ('security', 'امنیتی'),
                    ('education', 'آموزشی'),
                    ('maintenance', 'تعمیرات'),
                    ('other', 'سایر'),
                ],
                default='',
                max_length=20,
                verbose_name='دسته\u200cبندی',
            ),
        ),
        migrations.AddField(
            model_name='ideacomplaint',
            name='created_at',
            field=models.DateTimeField(
                auto_now_add=True,
                default=timezone.now,
                verbose_name='تاریخ ایجاد',
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ideacomplaint',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, verbose_name='تاریخ بروزرسانی'),
        ),
        migrations.AddField(
            model_name='ideacomplaint',
            name='responded_at',
            field=models.DateTimeField(blank=True, null=True, verbose_name='زمان پاسخ'),
        ),
        migrations.AddField(
            model_name='ideacomplaint',
            name='responded_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='feedback_responses',
                to=settings.AUTH_USER_MODEL,
                verbose_name='سرپرست پاسخ\u200cدهنده',
            ),
        ),
        migrations.AddField(
            model_name='ideacomplaint',
            name='responded_within_sla',
            field=models.BooleanField(
                blank=True,
                null=True,
                verbose_name='پاسخ در مهلت ۷۲ ساعته',
            ),
        ),
        migrations.AddIndex(
            model_name='ideacomplaint',
            index=models.Index(fields=['type'], name='ideas_ideac_type_8f1a2b_idx'),
        ),
        migrations.AddIndex(
            model_name='ideacomplaint',
            index=models.Index(fields=['category'], name='ideas_ideac_categor_4c3d2e_idx'),
        ),
        migrations.AddIndex(
            model_name='ideacomplaint',
            index=models.Index(fields=['created_at'], name='ideas_ideac_created_1a2b3c_idx'),
        ),
        migrations.AddIndex(
            model_name='ideacomplaint',
            index=models.Index(fields=['responded_by'], name='ideas_ideac_respond_5d4e3f_idx'),
        ),
        migrations.AlterModelOptions(
            name='ideacomplaint',
            options={
                'ordering': ['-created_at'],
                'verbose_name': 'ایده / شکایت',
                'verbose_name_plural': 'ایده\u200cها و شکایات',
            },
        ),
    ]
