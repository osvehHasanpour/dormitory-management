from django.db import migrations


def merge_suggestions_into_ideas(apps, schema_editor):
    IdeaComplaint = apps.get_model('ideas', 'IdeaComplaint')
    IdeaComplaint.objects.filter(type='suggestion').update(type='idea')


class Migration(migrations.Migration):

    dependencies = [
        ('ideas', '0003_rename_ideas_ideac_type_8f1a2b_idx_ideas_ideac_type_d787bd_idx_and_more'),
    ]

    operations = [
        migrations.RunPython(
            merge_suggestions_into_ideas,
            migrations.RunPython.noop,
        ),
    ]
