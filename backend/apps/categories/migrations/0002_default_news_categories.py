from django.db import migrations
from django.utils.text import slugify


DEFAULT_CATEGORIES = [
    ("Politics", "Power, policy, elections and public institutions."),
    ("Breaking News", "Fast-moving stories that need immediate public attention."),
    ("Economy", "Markets, business, fiscal policy and the Nigerian economy."),
    ("Security News", "Security, public safety and conflict reporting."),
    ("Crime", "Crime reports, investigations, courts and public safety alerts."),
    ("World News", "Global affairs, diplomacy and international developments."),
    ("General News", "Major public-interest reports across Nigeria and everyday life."),
    ("Entertainment", "Nollywood, music, celebrity culture and creative business."),
    ("Opinions", "Sharp essays, argument and civic analysis."),
    ("Nigeria", "National life, cities, communities and everyday public affairs."),
]


def seed_default_categories(apps, schema_editor):
    Category = apps.get_model("categories", "Category")
    for name, description in DEFAULT_CATEGORIES:
        slug = slugify(name)
        existing = Category.objects.filter(slug=slug).first() or Category.objects.filter(name=name).first()
        if existing:
            existing.name = name
            existing.slug = slug
            if not existing.description:
                existing.description = description
            existing.save(update_fields=["name", "slug", "description"])
            continue
        Category.objects.create(
            name=name,
            slug=slug,
            description=description,
        )


class Migration(migrations.Migration):
    dependencies = [
        ("categories", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_default_categories, migrations.RunPython.noop),
    ]
