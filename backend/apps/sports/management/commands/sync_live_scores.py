from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError
from django.db import ProgrammingError, connections

from apps.sports.providers import get_sports_provider_client, normalize_provider_error


class Command(BaseCommand):
    help = "Fast sync for live/today football fixtures without heavy teams or standings imports."

    def add_arguments(self, parser):
        parser.add_argument(
            "--competition",
            action="append",
            dest="competitions",
            help="Competition code to sync, for example PL or CL. Can be passed more than once.",
        )
        parser.add_argument("--days-back", type=int, default=0, help="How many past days of fixtures to sync.")
        parser.add_argument("--days-ahead", type=int, default=1, help="How many future days of fixtures to sync.")

    def handle(self, *args, **options):
        self._ensure_sports_database_ready()
        competitions = options["competitions"] or list(settings.API_FOOTBALL_COMPETITIONS)
        self.stdout.write(f"Fast live sync competitions: {', '.join(competitions)}")
        try:
            client = get_sports_provider_client()
            if not hasattr(client, "sync_live_scores"):
                raise CommandError("The configured sports provider does not support fast live score sync.")
            summary = client.sync_live_scores(
                competition_codes=competitions,
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
                "Fast live sync complete: "
                f"{summary['competitions']} competitions, "
                f"{summary['fixtures']} fixtures, "
                f"{summary['events']} events, "
                f"{summary['lineups']} lineup rows, "
                f"{summary['statistics']} statistic rows."
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
