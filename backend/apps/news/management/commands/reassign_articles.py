"""Reassign article bylines from one author to another.

Solakuti's archive was published under a single anonymous "News Desk" account,
which fails Google's E-E-A-T expectations for news sites. This moves those
bylines onto a real, named journalist account.

    # preview first — nothing is written
    python manage.py reassign_articles --to editor@example.com --dry-run

    # apply
    python manage.py reassign_articles --to editor@example.com

    # only move articles currently owned by a specific author
    python manage.py reassign_articles --to editor@example.com --from "News Desk"

    # limit to one category
    python manage.py reassign_articles --to editor@example.com --category Politics

The operation is reversible: run it again with --from and --to swapped.
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.accounts.models import User
from apps.news.models import Article


class Command(BaseCommand):
    help = "Reassign article bylines to a named author account."

    def add_arguments(self, parser):
        parser.add_argument(
            "--to",
            required=True,
            metavar="EMAIL",
            help="Email of the account that should own the articles.",
        )
        parser.add_argument(
            "--from",
            dest="from_author",
            metavar="NAME_OR_EMAIL",
            help="Only move articles currently owned by this author (full name or email).",
        )
        parser.add_argument(
            "--category",
            help="Only move articles in this category name.",
        )
        parser.add_argument(
            "--published-only",
            action="store_true",
            help="Skip drafts; only reassign published articles.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Report what would change without writing anything.",
        )

    def handle(self, *args, **options):
        target = User.objects.filter(email__iexact=options["to"].strip()).first()
        if not target:
            raise CommandError(f"No account found with email {options['to']!r}.")

        if not target.can_publish:
            raise CommandError(
                f"{target.full_name} ({target.email}) is role={target.role}, "
                f"verified={target.is_verified}. A byline must be a verified "
                "admin, editor or journalist. Approve the account first."
            )

        queryset = Article.objects.all()

        from_author = options.get("from_author")
        if from_author:
            source = User.objects.filter(email__iexact=from_author.strip()).first() or (
                User.objects.filter(full_name__iexact=from_author.strip()).first()
            )
            if not source:
                raise CommandError(f"No account matches --from {from_author!r}.")
            queryset = queryset.filter(author=source)
            self.stdout.write(f"Source author : {source.full_name} <{source.email}>")

        if options.get("category"):
            queryset = queryset.filter(category__name__iexact=options["category"].strip())

        if options["published_only"]:
            queryset = queryset.filter(is_published=True)

        queryset = queryset.exclude(author=target)
        total = queryset.count()

        self.stdout.write(f"Target author : {target.full_name} <{target.email}> ({target.role})")
        self.stdout.write(f"Articles to reassign: {total}")

        if not total:
            self.stdout.write(self.style.WARNING("Nothing to do."))
            return

        # Show the spread of current owners so a mistake is obvious before writing.
        breakdown = {}
        for name in queryset.values_list("author__full_name", flat=True):
            breakdown[name] = breakdown.get(name, 0) + 1
        self.stdout.write("Currently owned by:")
        for name, count in sorted(breakdown.items(), key=lambda kv: -kv[1]):
            self.stdout.write(f"  {count:>6}  {name}")

        if options["dry_run"]:
            self.stdout.write(self.style.WARNING("\nDRY RUN — no changes written."))
            return

        with transaction.atomic():
            updated = queryset.update(author=target)

        self.stdout.write(
            self.style.SUCCESS(f"\nReassigned {updated} articles to {target.full_name}.")
        )
        self.stdout.write(
            "Byline pages rebuild on next request. To undo, re-run with --from and "
            "--to swapped."
        )
