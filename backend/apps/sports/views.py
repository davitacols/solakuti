from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import decorators, permissions, status, viewsets

from apps.sports.models import (
    Competition,
    Fixture,
    FixtureEvent,
    FixtureLineup,
    FixtureMomentum,
    FixtureStatistic,
    Player,
    Season,
    SportsSyncLog,
    SquadMembership,
    Standing,
    Team,
    Venue,
)
from apps.sports.provider_utils import active_provider_name, provider_queryset
from apps.sports.providers import get_sports_provider_client, normalize_provider_error
from apps.sports.serializers import (
    CompetitionSerializer,
    FixtureDetailSerializer,
    FixtureEventSerializer,
    FixtureLineupSerializer,
    FixtureListSerializer,
    FixtureMomentumSerializer,
    FixtureStatisticSerializer,
    FixtureWriteSerializer,
    PlayerSerializer,
    SeasonSerializer,
    SportsSyncLogSerializer,
    SquadMembershipSerializer,
    StandingSerializer,
    TeamSerializer,
    VenueSerializer,
)
from core.permissions import IsEditorialStaffOrReadOnly
from core.responses import ApiResponseMixin, api_response


class CompetitionViewSet(ApiResponseMixin, viewsets.ModelViewSet):
    serializer_class = CompetitionSerializer
    permission_classes = [IsEditorialStaffOrReadOnly]
    lookup_field = "slug"
    search_fields = ["name", "country"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]
    success_message = "Competitions fetched successfully."

    def get_queryset(self):
        return provider_queryset(Competition.objects).annotate(fixtures_count=Count("fixtures"))

    @decorators.action(detail=True, methods=["get"], permission_classes=[permissions.AllowAny])
    def standings(self, request, slug=None):
        competition = self.get_object()
        standings = competition.standings.select_related("competition", "team").order_by("position")
        serializer = StandingSerializer(standings, many=True)
        return api_response(serializer.data, message="Competition standings fetched successfully.")

    @decorators.action(detail=True, methods=["get"], permission_classes=[permissions.AllowAny])
    def fixtures(self, request, slug=None):
        competition = self.get_object()
        queryset = (
            competition.fixtures.select_related("competition", "home_team", "away_team")
            .prefetch_related("events")
            .filter(provider=active_provider_name(), provider_id__gt="")
            .order_by("kickoff_at")
        )
        page = self.paginate_queryset(queryset)
        serializer = FixtureListSerializer(page or queryset, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return api_response(serializer.data, message="Competition fixtures fetched successfully.")


class TeamViewSet(ApiResponseMixin, viewsets.ModelViewSet):
    serializer_class = TeamSerializer
    permission_classes = [IsEditorialStaffOrReadOnly]
    lookup_field = "slug"
    search_fields = ["name", "short_name", "country"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]
    success_message = "Teams fetched successfully."

    def get_queryset(self):
        return provider_queryset(Team.objects.all())

    @decorators.action(detail=True, methods=["get"], permission_classes=[permissions.AllowAny])
    def fixtures(self, request, slug=None):
        team = self.get_object()
        queryset = (
            Fixture.objects.filter(Q(home_team=team) | Q(away_team=team))
            .select_related("competition", "home_team", "away_team")
            .filter(provider=active_provider_name(), provider_id__gt="")
            .order_by("-kickoff_at")
        )
        page = self.paginate_queryset(queryset)
        serializer = FixtureListSerializer(page or queryset, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return api_response(serializer.data, message="Team fixtures fetched successfully.")


class SeasonViewSet(ApiResponseMixin, viewsets.ModelViewSet):
    serializer_class = SeasonSerializer
    permission_classes = [IsEditorialStaffOrReadOnly]
    search_fields = ["name", "competition__name"]
    ordering_fields = ["start_year", "end_year", "name", "updated_at"]
    ordering = ["-start_year", "competition__name"]
    success_message = "Seasons fetched successfully."

    def get_queryset(self):
        return provider_queryset(Season.objects.select_related("competition").all())


class VenueViewSet(ApiResponseMixin, viewsets.ModelViewSet):
    serializer_class = VenueSerializer
    permission_classes = [IsEditorialStaffOrReadOnly]
    lookup_field = "slug"
    search_fields = ["name", "city", "country"]
    ordering_fields = ["name", "city", "capacity", "updated_at"]
    ordering = ["name"]
    success_message = "Venues fetched successfully."

    def get_queryset(self):
        return provider_queryset(Venue.objects.all())


class PlayerViewSet(ApiResponseMixin, viewsets.ModelViewSet):
    serializer_class = PlayerSerializer
    permission_classes = [IsEditorialStaffOrReadOnly]
    lookup_field = "slug"
    search_fields = ["name", "current_team__name", "nationality", "position"]
    ordering_fields = ["name", "position", "updated_at"]
    ordering = ["name"]
    success_message = "Players fetched successfully."

    def get_queryset(self):
        return provider_queryset(Player.objects.select_related("current_team").all())


class SquadMembershipViewSet(ApiResponseMixin, viewsets.ModelViewSet):
    serializer_class = SquadMembershipSerializer
    permission_classes = [IsEditorialStaffOrReadOnly]
    search_fields = ["player__name", "team__name", "season__name"]
    ordering_fields = ["shirt_number", "joined_at"]
    ordering = ["team", "shirt_number", "player__name"]
    success_message = "Squad memberships fetched successfully."

    def get_queryset(self):
        return SquadMembership.objects.select_related("team", "season__competition", "player__current_team").filter(
            team__provider=active_provider_name(),
            season__provider=active_provider_name(),
            player__provider=active_provider_name(),
        )


class FixtureViewSet(ApiResponseMixin, viewsets.ModelViewSet):
    permission_classes = [IsEditorialStaffOrReadOnly]
    search_fields = ["home_team__name", "away_team__name", "competition__name", "venue"]
    ordering_fields = ["kickoff_at", "status", "updated_at"]
    ordering = ["kickoff_at"]
    success_message = "Fixtures fetched successfully."

    def get_queryset(self):
        queryset = (
            Fixture.objects.select_related("competition", "season", "home_team", "away_team", "venue_detail")
            .prefetch_related("events__team", "lineups__team", "lineups__player__current_team", "statistics", "momentum")
            .filter(provider=active_provider_name(), provider_id__gt="")
        )
        competition = self.request.query_params.get("competition")
        status_value = self.request.query_params.get("status")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")
        if competition:
            queryset = queryset.filter(Q(competition__slug=competition) | Q(competition__provider_id=competition))
        if status_value:
            queryset = queryset.filter(status=status_value)
        if date_from:
            queryset = queryset.filter(kickoff_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(kickoff_at__date__lte=date_to)
        return queryset

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return FixtureWriteSerializer
        if self.action == "retrieve":
            return FixtureDetailSerializer
        return FixtureListSerializer

    @decorators.action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def live(self, request):
        fresh_after = timezone.now() - timedelta(minutes=20)
        queryset = (
            self.get_queryset()
            .filter(
                status__in=[Fixture.Status.LIVE, Fixture.Status.HALFTIME],
                last_synced_at__gte=fresh_after,
            )
            .order_by("competition__name", "kickoff_at")
        )
        serializer = FixtureListSerializer(queryset, many=True)
        return api_response(serializer.data, message="Live fixtures fetched successfully.")

    @decorators.action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def today(self, request):
        now = timezone.localtime()
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=1)
        stale_before = timezone.now() - timedelta(minutes=20)
        queryset = (
            self.get_queryset()
            .filter(kickoff_at__gte=start, kickoff_at__lt=end)
            .exclude(
                Q(status__in=[Fixture.Status.LIVE, Fixture.Status.HALFTIME])
                & (Q(last_synced_at__lt=stale_before) | Q(last_synced_at__isnull=True))
            )
            .order_by("competition__name", "kickoff_at")
        )
        serializer = FixtureListSerializer(queryset, many=True)
        return api_response(serializer.data, message="Today's fixtures fetched successfully.")

    @decorators.action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def upcoming(self, request):
        queryset = self.get_queryset().filter(kickoff_at__gte=timezone.now()).exclude(status=Fixture.Status.FINISHED).order_by("kickoff_at")[:50]
        serializer = FixtureListSerializer(queryset, many=True)
        return api_response(serializer.data, message="Upcoming fixtures fetched successfully.")

    @decorators.action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def results(self, request):
        queryset = self.get_queryset().filter(status=Fixture.Status.FINISHED).order_by("-kickoff_at")[:50]
        serializer = FixtureListSerializer(queryset, many=True)
        return api_response(serializer.data, message="Results fetched successfully.")


class FixtureEventViewSet(ApiResponseMixin, viewsets.ModelViewSet):
    serializer_class = FixtureEventSerializer
    permission_classes = [IsEditorialStaffOrReadOnly]
    search_fields = ["player_name", "detail", "fixture__home_team__name", "fixture__away_team__name"]
    ordering_fields = ["minute", "created_at"]
    ordering = ["minute", "created_at"]
    success_message = "Fixture events fetched successfully."

    def get_queryset(self):
        return provider_queryset(FixtureEvent.objects.select_related("fixture", "team").all())


class FixtureLineupViewSet(ApiResponseMixin, viewsets.ModelViewSet):
    serializer_class = FixtureLineupSerializer
    permission_classes = [IsEditorialStaffOrReadOnly]
    search_fields = ["player_name", "player__name", "team__name", "fixture__home_team__name", "fixture__away_team__name"]
    ordering_fields = ["formation_position", "shirt_number", "rating"]
    ordering = ["fixture", "team", "-is_starting", "formation_position"]
    success_message = "Fixture lineups fetched successfully."

    def get_queryset(self):
        return provider_queryset(FixtureLineup.objects.select_related("fixture", "team", "player__current_team").all())


class FixtureStatisticViewSet(ApiResponseMixin, viewsets.ModelViewSet):
    serializer_class = FixtureStatisticSerializer
    permission_classes = [IsEditorialStaffOrReadOnly]
    search_fields = ["name", "group", "fixture__home_team__name", "fixture__away_team__name"]
    ordering_fields = ["group", "name", "updated_at"]
    ordering = ["fixture", "group", "name"]
    success_message = "Fixture statistics fetched successfully."

    def get_queryset(self):
        return provider_queryset(FixtureStatistic.objects.select_related("fixture").all())


class FixtureMomentumViewSet(ApiResponseMixin, viewsets.ModelViewSet):
    serializer_class = FixtureMomentumSerializer
    permission_classes = [IsEditorialStaffOrReadOnly]
    search_fields = ["fixture__home_team__name", "fixture__away_team__name"]
    ordering_fields = ["minute", "updated_at"]
    ordering = ["fixture", "minute"]
    success_message = "Fixture momentum fetched successfully."

    def get_queryset(self):
        return FixtureMomentum.objects.select_related("fixture").filter(fixture__provider=active_provider_name())


class StandingViewSet(ApiResponseMixin, viewsets.ModelViewSet):
    serializer_class = StandingSerializer
    permission_classes = [IsEditorialStaffOrReadOnly]
    search_fields = ["competition__name", "team__name"]
    ordering_fields = ["position", "points", "goal_difference", "updated_at"]
    ordering = ["competition", "position"]
    success_message = "Standings fetched successfully."

    def get_queryset(self):
        return Standing.objects.select_related("competition", "season", "team").filter(
            competition__provider=active_provider_name(),
            team__provider=active_provider_name(),
        )


class SportsSyncLogViewSet(ApiResponseMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = SportsSyncLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering_fields = ["started_at", "finished_at", "status"]
    ordering = ["-started_at"]
    success_message = "Sports sync logs fetched successfully."

    def get_queryset(self):
        return SportsSyncLog.objects.all()

    @decorators.action(detail=False, methods=["get"], permission_classes=[permissions.IsAdminUser])
    def overview(self, request):
        now = timezone.now()
        today_start = timezone.localtime().replace(hour=0, minute=0, second=0, microsecond=0)
        last_log = SportsSyncLog.objects.order_by("-started_at").first()
        failed_logs = SportsSyncLog.objects.filter(status=SportsSyncLog.Status.FAILED).order_by("-started_at")[:5]
        data = {
            "competitions": Competition.objects.count(),
            "teams": Team.objects.count(),
            "fixtures": Fixture.objects.count(),
            "live_fixtures": Fixture.objects.filter(
                status__in=[Fixture.Status.LIVE, Fixture.Status.HALFTIME],
                last_synced_at__gte=now - timedelta(minutes=20),
            ).count(),
            "today_fixtures": Fixture.objects.filter(kickoff_at__gte=today_start, kickoff_at__lt=today_start + timedelta(days=1)).count(),
            "upcoming_fixtures": Fixture.objects.filter(kickoff_at__gte=now).exclude(status=Fixture.Status.FINISHED).count(),
            "result_fixtures": Fixture.objects.filter(status=Fixture.Status.FINISHED).count(),
            "last_sync": SportsSyncLogSerializer(last_log).data if last_log else None,
            "recent_failures": SportsSyncLogSerializer(failed_logs, many=True).data,
        }
        return api_response(data, message="Sports sync overview fetched successfully.")

    @decorators.action(detail=False, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def sync(self, request):
        competitions = request.data.get("competitions") or request.data.get("competition")
        sync_mode = str(request.data.get("mode") or "full").strip().lower()
        if isinstance(competitions, str):
            competitions = [item.strip() for item in competitions.split(",") if item.strip()]
        try:
            client = get_sports_provider_client()
            if sync_mode in {"live", "fast", "live_scores"}:
                summary = client.sync_live_scores(competition_codes=competitions)
            elif competitions:
                summary = client.sync_competitions(competitions)
            else:
                summary = client.sync_configured_competitions()
        except Exception as exc:
            provider_error = normalize_provider_error(exc)
            if not provider_error:
                raise
            return api_response(
                {"error": provider_error},
                success=False,
                message=provider_error,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        return api_response(summary, message="Sports provider sync completed.")
