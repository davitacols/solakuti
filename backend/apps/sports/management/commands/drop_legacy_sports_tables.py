from django.core.management.base import BaseCommand, CommandError
from django.db import DEFAULT_DB_ALIAS, connections, transaction
from django.db.utils import OperationalError, ProgrammingError


class Command(BaseCommand):
    help = "Drop old sports tables from the default/main database after moving LiveScore to SPORTS_DATABASE_URL."

    def add_arguments(self, parser):
        parser.add_argument(
            "--confirm",
            action="store_true",
            help="Actually drop sports_* tables from the default database. Without this, only previews.",
        )

    def handle(self, *args, **options):
        connection = connections[DEFAULT_DB_ALIAS]
        try:
            table_names = sorted(
                table
                for table in connection.introspection.table_names()
                if table.startswith("sports_")
            )
        except (OperationalError, ProgrammingError) as exc:
            raise CommandError(
                "Could not connect to the default database. If Neon is paused for quota, "
                "you must resume/upgrade it before tables can be removed."
            ) from exc

        migration_table_exists = "django_migrations" in connection.introspection.table_names()

        if not table_names:
            self.stdout.write(self.style.SUCCESS("No legacy sports tables found in the default database."))
            return

        if not options["confirm"]:
            self.stdout.write(self.style.WARNING("Dry run only. Nothing was dropped."))
            self.stdout.write("These tables would be removed from the default database:")
            for table in table_names:
                self.stdout.write(f"- {table}")
            if migration_table_exists:
                self.stdout.write("- django_migrations rows where app = 'sports'")
            self.stdout.write("")
            self.stdout.write("Run again with --confirm to permanently drop them.")
            return

        with transaction.atomic(using=DEFAULT_DB_ALIAS):
            with connection.cursor() as cursor:
                for table in table_names:
                    cursor.execute(f"DROP TABLE IF EXISTS {connection.ops.quote_name(table)} CASCADE")
                if migration_table_exists:
                    cursor.execute("DELETE FROM django_migrations WHERE app = %s", ["sports"])

        self.stdout.write(self.style.SUCCESS("Legacy sports tables removed from the default database."))
        for table in table_names:
            self.stdout.write(f"Dropped: {table}")
        if migration_table_exists:
            self.stdout.write("Removed sports migration records from django_migrations.")
