from django.contrib import admin

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


@admin.register(Competition)
class CompetitionAdmin(admin.ModelAdmin):
    list_display = ["name", "country", "is_featured", "provider", "updated_at"]
    list_filter = ["country", "is_featured", "provider"]
    search_fields = ["name", "country", "provider_id"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Season)
class SeasonAdmin(admin.ModelAdmin):
    list_display = ["name", "competition", "start_year", "end_year", "is_current", "provider"]
    list_filter = ["competition", "is_current", "provider"]
    search_fields = ["name", "competition__name", "provider_id"]


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ["name", "short_name", "country", "provider", "updated_at"]
    list_filter = ["country", "provider"]
    search_fields = ["name", "short_name", "country", "provider_id"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ["name", "city", "country", "capacity", "surface", "provider"]
    list_filter = ["country", "surface", "provider"]
    search_fields = ["name", "city", "country", "provider_id"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ["name", "current_team", "position", "shirt_number", "nationality", "provider"]
    list_filter = ["position", "nationality", "current_team", "provider"]
    search_fields = ["name", "current_team__name", "nationality", "provider_id"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(SquadMembership)
class SquadMembershipAdmin(admin.ModelAdmin):
    list_display = ["player", "team", "season", "shirt_number", "role"]
    list_filter = ["team", "season", "role"]
    search_fields = ["player__name", "team__name", "season__name"]


class FixtureEventInline(admin.TabularInline):
    model = FixtureEvent
    extra = 0
    fields = ["minute", "event_type", "team", "player_name", "detail"]


class FixtureLineupInline(admin.TabularInline):
    model = FixtureLineup
    extra = 0
    fields = ["team", "player", "player_name", "shirt_number", "position", "formation_position", "is_starting", "is_captain", "rating"]


class FixtureStatisticInline(admin.TabularInline):
    model = FixtureStatistic
    extra = 0
    fields = ["group", "name", "home_value", "away_value", "home_numeric", "away_numeric"]


@admin.register(Fixture)
class FixtureAdmin(admin.ModelAdmin):
    list_display = ["home_team", "away_team", "competition", "season", "kickoff_at", "status", "scoreline", "is_featured"]
    list_filter = ["status", "competition", "season", "is_featured", "kickoff_at"]
    search_fields = ["home_team__name", "away_team__name", "competition__name", "venue", "referee"]
    date_hierarchy = "kickoff_at"
    inlines = [FixtureEventInline, FixtureLineupInline, FixtureStatisticInline]

    @admin.display(description="Score")
    def scoreline(self, obj):
        return f"{obj.home_score}-{obj.away_score}"


@admin.register(FixtureEvent)
class FixtureEventAdmin(admin.ModelAdmin):
    list_display = ["fixture", "minute", "event_type", "team", "player_name"]
    list_filter = ["event_type", "team"]
    search_fields = ["fixture__home_team__name", "fixture__away_team__name", "player_name", "detail"]


@admin.register(FixtureLineup)
class FixtureLineupAdmin(admin.ModelAdmin):
    list_display = ["fixture", "team", "player_name", "shirt_number", "position", "is_starting", "is_captain", "rating"]
    list_filter = ["team", "is_starting", "is_captain", "position"]
    search_fields = ["fixture__home_team__name", "fixture__away_team__name", "player_name", "player__name"]


@admin.register(FixtureStatistic)
class FixtureStatisticAdmin(admin.ModelAdmin):
    list_display = ["fixture", "group", "name", "home_value", "away_value"]
    list_filter = ["group"]
    search_fields = ["fixture__home_team__name", "fixture__away_team__name", "name", "group"]


@admin.register(FixtureMomentum)
class FixtureMomentumAdmin(admin.ModelAdmin):
    list_display = ["fixture", "minute", "home_value", "away_value"]
    list_filter = ["fixture__competition"]
    search_fields = ["fixture__home_team__name", "fixture__away_team__name"]


@admin.register(Standing)
class StandingAdmin(admin.ModelAdmin):
    list_display = ["competition", "season", "position", "team", "played", "won", "drawn", "lost", "goal_difference", "points"]
    list_filter = ["competition", "season"]
    search_fields = ["competition__name", "team__name"]


@admin.register(SportsSyncLog)
class SportsSyncLogAdmin(admin.ModelAdmin):
    list_display = ["provider", "task", "status", "started_at", "finished_at"]
    list_filter = ["provider", "task", "status"]
    search_fields = ["provider", "task", "message"]
    readonly_fields = ["provider", "task", "status", "message", "started_at", "finished_at"]
