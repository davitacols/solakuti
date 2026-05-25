from rest_framework import serializers

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


class CompetitionSerializer(serializers.ModelSerializer):
    fixtures_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Competition
        fields = [
            "id",
            "name",
            "slug",
            "country",
            "logo_url",
            "is_featured",
            "fixtures_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at", "fixtures_count"]


class SeasonSerializer(serializers.ModelSerializer):
    competition = CompetitionSerializer(read_only=True)
    competition_id = serializers.PrimaryKeyRelatedField(
        queryset=Competition.objects.all(),
        source="competition",
        write_only=True,
    )

    class Meta:
        model = Season
        fields = [
            "id",
            "competition",
            "competition_id",
            "name",
            "start_year",
            "end_year",
            "is_current",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = [
            "id",
            "name",
            "slug",
            "short_name",
            "country",
            "crest_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]


class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = [
            "id",
            "name",
            "slug",
            "city",
            "country",
            "capacity",
            "surface",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]


class PlayerSerializer(serializers.ModelSerializer):
    current_team = TeamSerializer(read_only=True)
    current_team_id = serializers.PrimaryKeyRelatedField(
        queryset=Team.objects.all(),
        source="current_team",
        required=False,
        allow_null=True,
        write_only=True,
    )

    class Meta:
        model = Player
        fields = [
            "id",
            "current_team",
            "current_team_id",
            "name",
            "slug",
            "position",
            "shirt_number",
            "nationality",
            "date_of_birth",
            "height_cm",
            "photo_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]


class SquadMembershipSerializer(serializers.ModelSerializer):
    team = TeamSerializer(read_only=True)
    season = SeasonSerializer(read_only=True)
    player = PlayerSerializer(read_only=True)
    team_id = serializers.PrimaryKeyRelatedField(queryset=Team.objects.all(), source="team", write_only=True)
    season_id = serializers.PrimaryKeyRelatedField(queryset=Season.objects.all(), source="season", write_only=True)
    player_id = serializers.PrimaryKeyRelatedField(queryset=Player.objects.all(), source="player", write_only=True)

    class Meta:
        model = SquadMembership
        fields = ["id", "team", "team_id", "season", "season_id", "player", "player_id", "shirt_number", "role", "joined_at", "left_at"]
        read_only_fields = ["id"]


class FixtureEventSerializer(serializers.ModelSerializer):
    team = TeamSerializer(read_only=True)
    team_id = serializers.PrimaryKeyRelatedField(
        queryset=Team.objects.all(),
        source="team",
        required=False,
        allow_null=True,
        write_only=True,
    )

    class Meta:
        model = FixtureEvent
        fields = [
            "id",
            "fixture",
            "team",
            "team_id",
            "event_type",
            "period",
            "minute",
            "extra_minute",
            "player_name",
            "assist_name",
            "related_player_name",
            "detail",
            "home_score",
            "away_score",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class FixtureLineupSerializer(serializers.ModelSerializer):
    team = TeamSerializer(read_only=True)
    player = PlayerSerializer(read_only=True)
    team_id = serializers.PrimaryKeyRelatedField(queryset=Team.objects.all(), source="team", write_only=True)
    player_id = serializers.PrimaryKeyRelatedField(
        queryset=Player.objects.all(),
        source="player",
        required=False,
        allow_null=True,
        write_only=True,
    )

    class Meta:
        model = FixtureLineup
        fields = [
            "id",
            "fixture",
            "team",
            "team_id",
            "player",
            "player_id",
            "player_name",
            "shirt_number",
            "position",
            "formation_position",
            "is_starting",
            "is_captain",
            "rating",
        ]
        read_only_fields = ["id"]


class FixtureStatisticSerializer(serializers.ModelSerializer):
    class Meta:
        model = FixtureStatistic
        fields = [
            "id",
            "fixture",
            "group",
            "name",
            "home_value",
            "away_value",
            "home_numeric",
            "away_numeric",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_at"]


class FixtureMomentumSerializer(serializers.ModelSerializer):
    class Meta:
        model = FixtureMomentum
        fields = ["id", "fixture", "minute", "home_value", "away_value", "updated_at"]
        read_only_fields = ["id", "updated_at"]


class FixtureListSerializer(serializers.ModelSerializer):
    competition = CompetitionSerializer(read_only=True)
    season = SeasonSerializer(read_only=True)
    home_team = TeamSerializer(read_only=True)
    away_team = TeamSerializer(read_only=True)
    venue_detail = VenueSerializer(read_only=True)

    class Meta:
        model = Fixture
        fields = [
            "id",
            "competition",
            "season",
            "home_team",
            "away_team",
            "kickoff_at",
            "status",
            "status_reason",
            "period",
            "minute",
            "injury_time",
            "home_score",
            "away_score",
            "venue",
            "venue_detail",
            "round_name",
            "referee",
            "attendance",
            "home_formation",
            "away_formation",
            "home_manager",
            "away_manager",
            "home_xg",
            "away_xg",
            "is_featured",
            "last_synced_at",
            "updated_at",
        ]
        read_only_fields = ["id", "last_synced_at", "updated_at"]


class FixtureDetailSerializer(FixtureListSerializer):
    events = FixtureEventSerializer(many=True, read_only=True)
    lineups = FixtureLineupSerializer(many=True, read_only=True)
    statistics = FixtureStatisticSerializer(many=True, read_only=True)
    momentum = FixtureMomentumSerializer(many=True, read_only=True)

    class Meta(FixtureListSerializer.Meta):
        fields = FixtureListSerializer.Meta.fields + ["events", "lineups", "statistics", "momentum", "created_at"]


class FixtureWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fixture
        fields = [
            "id",
            "competition",
            "season",
            "home_team",
            "away_team",
            "kickoff_at",
            "status",
            "status_reason",
            "period",
            "minute",
            "injury_time",
            "home_score",
            "away_score",
            "venue",
            "venue_detail",
            "round_name",
            "referee",
            "attendance",
            "home_formation",
            "away_formation",
            "home_manager",
            "away_manager",
            "home_xg",
            "away_xg",
            "is_featured",
        ]
        read_only_fields = ["id"]


class StandingSerializer(serializers.ModelSerializer):
    competition = CompetitionSerializer(read_only=True)
    season = SeasonSerializer(read_only=True)
    team = TeamSerializer(read_only=True)
    competition_id = serializers.PrimaryKeyRelatedField(queryset=Competition.objects.all(), source="competition", write_only=True)
    season_id = serializers.PrimaryKeyRelatedField(
        queryset=Season.objects.all(),
        source="season",
        required=False,
        allow_null=True,
        write_only=True,
    )
    team_id = serializers.PrimaryKeyRelatedField(queryset=Team.objects.all(), source="team", write_only=True)

    class Meta:
        model = Standing
        fields = [
            "id",
            "competition",
            "competition_id",
            "season",
            "season_id",
            "team",
            "team_id",
            "position",
            "played",
            "won",
            "drawn",
            "lost",
            "goals_for",
            "goals_against",
            "goal_difference",
            "points",
            "form",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_at"]


class SportsSyncLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SportsSyncLog
        fields = ["id", "provider", "task", "status", "message", "started_at", "finished_at"]
        read_only_fields = ["id", "started_at", "finished_at"]
