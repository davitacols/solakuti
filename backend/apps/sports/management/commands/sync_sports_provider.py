from django.core.management.base import BaseCommand, CommandError
from django.core.management import call_command
from django.db import ProgrammingError, connections

from apps.sports.providers import get_sports_provider_client, normalize_provider_error


class Command(BaseCommand):
    help = "Sync Solakuti LiveScore fixtures, teams and standings from the configured sports API provider."

    def add_arguments(self, parser):
        parser.add_argument(
            "--competition",
            action="append",
            dest="competitions",
            help="Competition code to sync, for example PL or CL. Can be passed more than once.",
        )
        parser.add_argument("--days-back", type=int, default=2, help="How many past days of fixtures to sync.")
        parser.add_argument("--days-ahead", type=int, default=7, help="How many future days of fixtures to sync.")

    def handle(self, *args, **options):
        self._ensure_sports_database_ready()
        try:
            client = get_sports_provider_client()
            if options["competitions"]:
                summary = client.sync_competitions(
                    options["competitions"],
                    days_back=options["days_back"],
                    days_ahead=options["days_ahead"],
                )
            else:
                summary = client.sync_configured_competitions(
                    days_back=options["days_back"],
                    days_ahead=options["days_ahead"],
                )
        except ProgrammingError as exc:
            if "sports_" in str(exc):
                raise CommandError(
                    "LiveScore tables do not exist yet. Run `python manage.py migrate` before syncing sports data."
                ) from exc
            raise
        except Exception as exc:
            provider_error = normalize_provider_error(exc)
            if provider_error:
                raise CommandError(provider_error) from exc
            raise

        self.stdout.write(
            self.style.SUCCESS(
                "Sports sync complete: "
                f"{summary['competitions']} competitions, "
                f"{summary['teams']} new teams, "
                f"{summary['fixtures']} fixtures, "
                f"{summary['standings']} standing rows."
            )
        )
        if summary["failed"]:
            self.stdout.write(self.style.WARNING(f"Failed competitions: {summary['failed']}"))

    def _ensure_sports_database_ready(self):
        sports_connection = connections["sports"]
        default_connection = connections["default"]
        if sports_connection.settings_dict == default_connection.settings_dict:
            return
        self.stdout.write("Applying sports migrations on the sports database...")
        call_command("migrate", "sports", database="sports", interactive=False, verbosity=0)
