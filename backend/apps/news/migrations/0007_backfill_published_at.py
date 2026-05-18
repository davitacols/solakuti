from django.db import migrations
from django.db.models import F


def backfill_published_at(apps, schema_editor):
    Article = apps.get_model("news", "Article")
    Article.objects.filter(is_published=True, published_at__isnull=True).update(published_at=F("created_at"))


class Migration(migrations.Migration):
    dependencies = [
        ("news", "0006_alter_article_featured_video"),
    ]

    operations = [
        migrations.RunPython(backfill_published_at, migrations.RunPython.noop),
    ]
