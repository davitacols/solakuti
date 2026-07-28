"""Backfill articles that exist in a source database but not locally.

Used once to recover stories published to the old Neon backend during the VPS
migration window. Matches by slug (source and local ID sequences have diverged,
so IDs can't be preserved), assigns fresh local IDs, and re-links tags by name.

    python manage.py import_missing_articles --source-url "postgresql://..." --dry-run
    python manage.py import_missing_articles --source-url "postgresql://..."

Run migrate_media_to_r2 afterwards to pull the imported articles' images local.
"""

import copy

import dj_database_url
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import connections, transaction

from apps.news.models import Article, Tag

SRC_ALIAS = "import_src"


class Command(BaseCommand):
    help = "Backfill articles present in a source DB but missing locally (matched by slug)."

    def add_arguments(self, parser):
        parser.add_argument("--source-url", required=True, help="Postgres URL of the source database.")
        parser.add_argument("--dry-run", action="store_true", help="List what would be imported, write nothing.")

    def handle(self, *args, **options):
        # Base the source connection on the default config so Django's expected
        # keys (TIME_ZONE, AUTOCOMMIT, CONN_HEALTH_CHECKS, …) are present, then
        # override just the connection params from the source URL.
        source_config = copy.deepcopy(settings.DATABASES["default"])
        source_config.update(dj_database_url.parse(options["source_url"]))
        connections.databases[SRC_ALIAS] = source_config

        local_slugs = set(Article.objects.values_list("slug", flat=True))
        missing = list(
            Article.objects.using(SRC_ALIAS).exclude(slug__in=local_slugs).order_by("id")
        )

        self.stdout.write(f"Source has {len(missing)} article(s) not present locally:")
        for a in missing:
            when = a.published_at.strftime("%Y-%m-%d %H:%M") if a.published_at else "unpublished"
            self.stdout.write(f"  - {when}  {a.slug}")

        if not missing:
            self.stdout.write(self.style.WARNING("Nothing to import."))
            return
        if options["dry_run"]:
            self.stdout.write(self.style.WARNING("\nDRY RUN — nothing written."))
            return

        created = 0
        for a in missing:
            # Capture the M2M from the source before detaching the instance.
            tag_names = list(a.tags.values_list("name", flat=True))
            a.pk = None
            a.id = None
            a._state.adding = True
            a._state.db = None
            with transaction.atomic(using="default"):
                a.save(using="default")
                for name in tag_names:
                    tag, _ = Tag.objects.get_or_create(name=name)
                    a.tags.add(tag)
            created += 1
            self.stdout.write(self.style.SUCCESS(f"  imported {a.slug} -> id {a.id}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"\nImported {created} article(s). Now run migrate_media_to_r2 to fetch their images."
            )
        )
