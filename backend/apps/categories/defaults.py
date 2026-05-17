from django.utils.text import slugify


DEFAULT_CATEGORIES = [
    ("Politics", "Power, policy, elections and public institutions."),
    ("Breaking News", "Fast-moving stories that need immediate public attention."),
    ("Economy", "Markets, business, fiscal policy and the Nigerian economy."),
    ("Security News", "Security, public safety and conflict reporting."),
    ("Crime", "Crime reports, investigations, courts and public safety alerts."),
    ("Health", "Public health, hospitals, medical policy and wellness reporting."),
    ("National Assembly", "Legislative affairs, bills, oversight and parliamentary politics."),
    ("Tech", "Technology, startups, digital policy and innovation across Africa."),
    ("World News", "Global affairs, diplomacy and international developments."),
    ("General News", "Major public-interest reports across Nigeria and everyday life."),
    ("Entertainment", "Nollywood, music, celebrity culture and creative business."),
    ("Opinions", "Sharp essays, argument and civic analysis."),
    ("Nigeria", "National life, cities, communities and everyday public affairs."),
]


def ensure_default_categories(Category):
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
