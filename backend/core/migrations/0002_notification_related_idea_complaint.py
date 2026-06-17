import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ideas', '0002_supervisor_feedback_fields'),
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='related_idea_complaint',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='notifications',
                to='ideas.ideacomplaint',
                verbose_name='ایده / شکایت مرتبط',
            ),
        ),
    ]
