from django.db import migrations
from django.utils.text import slugify


DEFAULT_CATEGORIES = [
    ("Sports", "Football, athletics, leagues, tournaments and Nigerian sports personalities."),
]


def seed_default_categories(apps, schema_editor):
    Category = apps.get_model("categories", "Category")
    for name, description in DEFAULT_CATEGORIES:
        slug = slugify(name)
        existing = Category.objects.filter(slug=slug).first() or Category.objects.filter(name=name).first()
        if existing:
            changed_fields = []
            if existing.name != name:
                existing.name = name
                changed_fields.append("name")
            if existing.slug != slug:
                existing.slug = slug
                changed_fields.append("slug")
            if not existing.description:
                existing.description = description
                changed_fields.append("description")
            if changed_fields:
                existing.save(update_fields=changed_fields)
            continue
        Category.objects.create(name=name, slug=slug, description=description)


class Migration(migrations.Migration):

    dependencies = [
        ("categories", "0003_expand_default_news_categories"),
    ]

    operations = [
        migrations.RunPython(seed_default_categories, migrations.RunPython.noop),
    ]
