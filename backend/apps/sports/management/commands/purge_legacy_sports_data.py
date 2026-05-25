from django.core.management.base import BaseCommand
from django.db import transaction

from apps.sports.models import (
    Competition,
    Fixture,
    FixtureEvent,
    FixtureLineup,
    FixtureStatistic,
    Player,
    Season,
    SquadMembership,
    Standing,
    Team,
    Venue,
)
from apps.sports.provider_utils import active_provider_name


class Command(BaseCommand):
    help = "Remove sports rows that do not belong to the configured SPORTS_PROVIDER."

    def add_arguments(self, parser):
        parser.add_argument(
            "--confirm",
            action="store_true",
            help="Actually delete legacy sports rows. Without this, only previews.",
        )

    def handle(self, *args, **options):
        active_provider = active_provider_name()
        legacy_fixture_ids = list(
            Fixture.objects.exclude(provider=active_provider, provider_id__gt="")
            .values_list("id", flat=True)
        )
        legacy_team_ids = list(
            Team.objects.exclude(provider=active_provider, provider_id__gt="")
            .values_list("id", flat=True)
        )
        legacy_competition_ids = list(
            Competition.objects.exclude(provider=active_provider, provider_id__gt="")
            .values_list("id", flat=True)
        )
        counts = {
            "fixtures": len(legacy_fixture_ids),
            "events": FixtureEvent.objects.filter(fixture_id__in=legacy_fixture_ids).count()
            + FixtureEvent.objects.exclude(provider=active_provider, provider_id__gt="").count(),
            "lineups": FixtureLineup.objects.filter(fixture_id__in=legacy_fixture_ids).count()
            + FixtureLineup.objects.exclude(provider=active_provider, provider_id__gt="").count(),
            "statistics": FixtureStatistic.objects.filter(fixture_id__in=legacy_fixture_ids).count()
            + FixtureStatistic.objects.exclude(provider=active_provider, provider_id__gt="").count(),
            "standings": Standing.objects.filter(competition_id__in=legacy_competition_ids).count()
            + Standing.objects.filter(team_id__in=legacy_team_ids).count(),
            "squad_memberships": SquadMembership.objects.filter(team_id__in=legacy_team_ids).count(),
            "players": Player.objects.exclude(provider=active_provider, provider_id__gt="").count(),
            "venues": Venue.objects.exclude(provider=active_provider, provider_id__gt="").count(),
            "teams": len(legacy_team_ids),
            "seasons": Season.objects.exclude(provider=active_provider, provider_id__gt="").count(),
            "competitions": len(legacy_competition_ids),
        }

        self.stdout.write(f"Active sports provider: {active_provider}")
        if not any(counts.values()):
            self.stdout.write(self.style.SUCCESS("No legacy sports rows found."))
            return

        for label, count in counts.items():
            self.stdout.write(f"{label}: {count}")

        if not options["confirm"]:
            self.stdout.write("")
            self.stdout.write(self.style.WARNING("Dry run only. Nothing was deleted."))
            self.stdout.write("Run again with --confirm to remove legacy sports data.")
            return

        with transaction.atomic(using="sports"):
            FixtureEvent.objects.filter(fixture_id__in=legacy_fixture_ids).delete()
            FixtureEvent.objects.exclude(provider=active_provider, provider_id__gt="").delete()
            FixtureLineup.objects.filter(fixture_id__in=legacy_fixture_ids).delete()
            FixtureLineup.objects.exclude(provider=active_provider, provider_id__gt="").delete()
            FixtureStatistic.objects.filter(fixture_id__in=legacy_fixture_ids).delete()
            FixtureStatistic.objects.exclude(provider=active_provider, provider_id__gt="").delete()
            Fixture.objects.filter(id__in=legacy_fixture_ids).delete()
            Standing.objects.filter(competition_id__in=legacy_competition_ids).delete()
            Standing.objects.filter(team_id__in=legacy_team_ids).delete()
            SquadMembership.objects.filter(team_id__in=legacy_team_ids).delete()
            Season.objects.exclude(provider=active_provider, provider_id__gt="").delete()
            Player.objects.exclude(provider=active_provider, provider_id__gt="").delete()
            Venue.objects.exclude(provider=active_provider, provider_id__gt="").delete()
            Team.objects.filter(id__in=legacy_team_ids).delete()
            Competition.objects.filter(id__in=legacy_competition_ids).delete()

        self.stdout.write(self.style.SUCCESS("Legacy sports data removed."))
