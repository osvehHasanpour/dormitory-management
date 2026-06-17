import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def backfill_initial_status_history(apps, schema_editor):
    RequestBase = apps.get_model('requests_app', 'RequestBase')
    RequestStatusHistory = apps.get_model('requests_app', 'RequestStatusHistory')

    history_rows = [
        RequestStatusHistory(
            request_id=request_obj.pk,
            previous_status=None,
            new_status=request_obj.status,
            acting_supervisor_id=None,
            comment='',
            rejection_reason='',
            created_at=request_obj.created_at,
        )
        for request_obj in RequestBase.objects.all().iterator()
    ]
    if history_rows:
        RequestStatusHistory.objects.bulk_create(history_rows, batch_size=500)


class Migration(migrations.Migration):

    dependencies = [
        ('requests_app', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='requestbase',
            name='rejection_reason',
            field=models.TextField(blank=True, verbose_name='دلیل رد'),
        ),
        migrations.AddField(
            model_name='requestbase',
            name='assigned_staff',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='assigned_requests',
                to=settings.AUTH_USER_MODEL,
                verbose_name='کارمند محول\u200cشده',
            ),
        ),
        migrations.CreateModel(
            name='RequestStatusHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('previous_status', models.CharField(
                    blank=True,
                    choices=[
                        ('pending', 'در انتظار'),
                        ('in_progress', 'در حال بررسی'),
                        ('approved', 'تأیید شده'),
                        ('rejected', 'رد شده'),
                        ('completed', 'تکمیل شده'),
                    ],
                    max_length=20,
                    null=True,
                    verbose_name='وضعیت قبلی',
                )),
                ('new_status', models.CharField(
                    choices=[
                        ('pending', 'در انتظار'),
                        ('in_progress', 'در حال بررسی'),
                        ('approved', 'تأیید شده'),
                        ('rejected', 'رد شده'),
                        ('completed', 'تکمیل شده'),
                    ],
                    max_length=20,
                    verbose_name='وضعیت جدید',
                )),
                ('comment', models.TextField(blank=True, verbose_name='توضیح / یادداشت')),
                ('rejection_reason', models.TextField(blank=True, verbose_name='دلیل رد')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='زمان تغییر')),
                ('acting_supervisor', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='request_status_actions',
                    to=settings.AUTH_USER_MODEL,
                    verbose_name='سرپرست اقدام\u200cکننده',
                )),
                ('request', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='status_history',
                    to='requests_app.requestbase',
                    verbose_name='درخواست',
                )),
            ],
            options={
                'verbose_name': 'تاریخچه وضعیت درخواست',
                'verbose_name_plural': 'تاریخچه وضعیت درخواست\u200cها',
                'ordering': ['created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='requestbase',
            index=models.Index(fields=['assigned_staff'], name='requests_ap_assigne_6e0f0d_idx'),
        ),
        migrations.AddIndex(
            model_name='requeststatushistory',
            index=models.Index(fields=['request', 'created_at'], name='requests_ap_request_0a8b2a_idx'),
        ),
        migrations.AddIndex(
            model_name='requeststatushistory',
            index=models.Index(fields=['acting_supervisor'], name='requests_ap_acting__f3c1d4_idx'),
        ),
        migrations.RunPython(backfill_initial_status_history, migrations.RunPython.noop),
    ]
