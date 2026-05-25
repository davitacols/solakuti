from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class Competition(models.Model):
    name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    country = models.CharField(max_length=120, blank=True)
    logo_url = models.URLField(blank=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    provider = models.CharField(max_length=80, blank=True)
    provider_id = models.CharField(max_length=120, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["provider", "provider_id"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Season(models.Model):
    competition = models.ForeignKey(Competition, on_delete=models.CASCADE, related_name="seasons")
    name = models.CharField(max_length=120)
    start_year = models.PositiveSmallIntegerField(blank=True, null=True)
    end_year = models.PositiveSmallIntegerField(blank=True, null=True)
    is_current = models.BooleanField(default=False, db_index=True)
    provider = models.CharField(max_length=80, blank=True)
    provider_id = models.CharField(max_length=120, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-start_year", "competition__name"]
        unique_together = ["competition", "name"]
        indexes = [
            models.Index(fields=["competition", "is_current"]),
            models.Index(fields=["provider", "provider_id"]),
        ]

    def __str__(self):
        return f"{self.competition} {self.name}"


class Team(models.Model):
    name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    short_name = models.CharField(max_length=40, blank=True)
    country = models.CharField(max_length=120, blank=True)
    crest_url = models.URLField(blank=True)
    provider = models.CharField(max_length=80, blank=True)
    provider_id = models.CharField(max_length=120, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["provider", "provider_id"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Venue(models.Model):
    name = models.CharField(max_length=180)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    city = models.CharField(max_length=120, blank=True)
    country = models.CharField(max_length=120, blank=True)
    capacity = models.PositiveIntegerField(blank=True, null=True)
    surface = models.CharField(max_length=80, blank=True)
    provider = models.CharField(max_length=80, blank=True)
    provider_id = models.CharField(max_length=120, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["provider", "provider_id"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(f"{self.name}-{self.city}" if self.city else self.name)
            slug = base_slug
            counter = 2
            while Venue.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Player(models.Model):
    class Position(models.TextChoices):
        GOALKEEPER = "goalkeeper", "Goalkeeper"
        DEFENDER = "defender", "Defender"
        MIDFIELDER = "midfielder", "Midfielder"
        FORWARD = "forward", "Forward"
        COACH = "coach", "Coach"
        UNKNOWN = "unknown", "Unknown"

    current_team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name="players")
    name = models.CharField(max_length=180)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    position = models.CharField(max_length=30, choices=Position.choices, default=Position.UNKNOWN, db_index=True)
    shirt_number = models.PositiveSmallIntegerField(blank=True, null=True)
    nationality = models.CharField(max_length=120, blank=True)
    date_of_birth = models.DateField(blank=True, null=True)
    height_cm = models.PositiveSmallIntegerField(blank=True, null=True)
    photo_url = models.URLField(blank=True)
    provider = models.CharField(max_length=80, blank=True)
    provider_id = models.CharField(max_length=120, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["provider", "provider_id"]),
            models.Index(fields=["current_team", "position"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 2
            while Player.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class SquadMembership(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="squad_memberships")
    season = models.ForeignKey(Season, on_delete=models.CASCADE, related_name="squad_memberships")
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="squad_memberships")
    shirt_number = models.PositiveSmallIntegerField(blank=True, null=True)
    role = models.CharField(max_length=80, blank=True)
    joined_at = models.DateField(blank=True, null=True)
    left_at = models.DateField(blank=True, null=True)

    class Meta:
        ordering = ["team", "shirt_number", "player__name"]
        unique_together = ["team", "season", "player"]
        indexes = [
            models.Index(fields=["team", "season"]),
            models.Index(fields=["player"]),
        ]

    def __str__(self):
        return f"{self.player} - {self.team} ({self.season})"


class Fixture(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "Scheduled"
        LIVE = "live", "Live"
        HALFTIME = "halftime", "Half-time"
        FINISHED = "finished", "Finished"
        POSTPONED = "postponed", "Postponed"
        CANCELLED = "cancelled", "Cancelled"

    competition = models.ForeignKey(Competition, on_delete=models.PROTECT, related_name="fixtures")
    season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, blank=True, related_name="fixtures")
    home_team = models.ForeignKey(Team, on_delete=models.PROTECT, related_name="home_fixtures")
    away_team = models.ForeignKey(Team, on_delete=models.PROTECT, related_name="away_fixtures")
    kickoff_at = models.DateTimeField(db_index=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED, db_index=True)
    status_reason = models.CharField(max_length=160, blank=True)
    period = models.CharField(max_length=40, blank=True)
    minute = models.PositiveSmallIntegerField(blank=True, null=True)
    injury_time = models.PositiveSmallIntegerField(blank=True, null=True)
    home_score = models.PositiveSmallIntegerField(default=0)
    away_score = models.PositiveSmallIntegerField(default=0)
    venue = models.CharField(max_length=160, blank=True)
    venue_detail = models.ForeignKey(Venue, on_delete=models.SET_NULL, null=True, blank=True, related_name="fixtures")
    round_name = models.CharField(max_length=120, blank=True)
    referee = models.CharField(max_length=160, blank=True)
    attendance = models.PositiveIntegerField(blank=True, null=True)
    home_formation = models.CharField(max_length=40, blank=True)
    away_formation = models.CharField(max_length=40, blank=True)
    home_manager = models.CharField(max_length=160, blank=True)
    away_manager = models.CharField(max_length=160, blank=True)
    home_xg = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)
    away_xg = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)
    provider = models.CharField(max_length=80, blank=True)
    provider_id = models.CharField(max_length=120, blank=True, db_index=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    last_synced_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["kickoff_at", "competition__name"]
        indexes = [
            models.Index(fields=["status", "kickoff_at"]),
            models.Index(fields=["kickoff_at"]),
            models.Index(fields=["provider", "provider_id"]),
            models.Index(fields=["is_featured", "kickoff_at"]),
            models.Index(fields=["competition", "season", "kickoff_at"]),
        ]

    @property
    def is_live(self):
        return self.status in {self.Status.LIVE, self.Status.HALFTIME}

    def __str__(self):
        return f"{self.home_team} vs {self.away_team}"


class FixtureEvent(models.Model):
    class EventType(models.TextChoices):
        GOAL = "goal", "Goal"
        CARD = "card", "Card"
        SUBSTITUTION = "substitution", "Substitution"
        VAR = "var", "VAR"
        PENALTY = "penalty", "Penalty"
        MISSED_PENALTY = "missed_penalty", "Missed penalty"
        OWN_GOAL = "own_goal", "Own goal"
        RED_CARD = "red_card", "Red card"
        YELLOW_CARD = "yellow_card", "Yellow card"
        PERIOD = "period", "Period"
        INFO = "info", "Info"

    fixture = models.ForeignKey(Fixture, on_delete=models.CASCADE, related_name="events")
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name="fixture_events")
    event_type = models.CharField(max_length=30, choices=EventType.choices, db_index=True)
    period = models.CharField(max_length=40, blank=True)
    minute = models.PositiveSmallIntegerField(blank=True, null=True)
    extra_minute = models.PositiveSmallIntegerField(blank=True, null=True)
    player_name = models.CharField(max_length=160, blank=True)
    assist_name = models.CharField(max_length=160, blank=True)
    related_player_name = models.CharField(max_length=160, blank=True)
    detail = models.CharField(max_length=220, blank=True)
    home_score = models.PositiveSmallIntegerField(blank=True, null=True)
    away_score = models.PositiveSmallIntegerField(blank=True, null=True)
    provider = models.CharField(max_length=80, blank=True)
    provider_id = models.CharField(max_length=120, blank=True, db_index=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["minute", "created_at"]
        indexes = [
            models.Index(fields=["fixture", "minute"]),
            models.Index(fields=["event_type"]),
            models.Index(fields=["provider", "provider_id"]),
        ]

    def __str__(self):
        minute = f"{self.minute}' " if self.minute is not None else ""
        return f"{minute}{self.get_event_type_display()} - {self.fixture}"


class FixtureLineup(models.Model):
    fixture = models.ForeignKey(Fixture, on_delete=models.CASCADE, related_name="lineups")
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="fixture_lineups")
    player = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, blank=True, related_name="fixture_lineups")
    player_name = models.CharField(max_length=180)
    shirt_number = models.PositiveSmallIntegerField(blank=True, null=True)
    position = models.CharField(max_length=40, blank=True)
    formation_position = models.PositiveSmallIntegerField(blank=True, null=True)
    is_starting = models.BooleanField(default=True, db_index=True)
    is_captain = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)
    provider = models.CharField(max_length=80, blank=True)
    provider_id = models.CharField(max_length=120, blank=True, db_index=True)

    class Meta:
        ordering = ["team", "-is_starting", "formation_position", "shirt_number", "player_name"]
        indexes = [
            models.Index(fields=["fixture", "team", "is_starting"]),
            models.Index(fields=["player"]),
            models.Index(fields=["provider", "provider_id"]),
        ]

    def __str__(self):
        return f"{self.player_name} - {self.fixture}"


class FixtureStatistic(models.Model):
    fixture = models.ForeignKey(Fixture, on_delete=models.CASCADE, related_name="statistics")
    group = models.CharField(max_length=80, blank=True)
    name = models.CharField(max_length=120)
    home_value = models.CharField(max_length=40, blank=True)
    away_value = models.CharField(max_length=40, blank=True)
    home_numeric = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    away_numeric = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    provider = models.CharField(max_length=80, blank=True)
    provider_id = models.CharField(max_length=120, blank=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["group", "name"]
        unique_together = ["fixture", "group", "name"]
        indexes = [
            models.Index(fields=["fixture", "group"]),
            models.Index(fields=["provider", "provider_id"]),
        ]

    def __str__(self):
        return f"{self.fixture} - {self.name}"


class FixtureMomentum(models.Model):
    fixture = models.ForeignKey(Fixture, on_delete=models.CASCADE, related_name="momentum")
    minute = models.PositiveSmallIntegerField()
    home_value = models.SmallIntegerField(default=0)
    away_value = models.SmallIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["minute"]
        unique_together = ["fixture", "minute"]
        indexes = [
            models.Index(fields=["fixture", "minute"]),
        ]

    def __str__(self):
        return f"{self.fixture} minute {self.minute}"


class Standing(models.Model):
    competition = models.ForeignKey(Competition, on_delete=models.CASCADE, related_name="standings")
    season = models.ForeignKey(Season, on_delete=models.SET_NULL, null=True, blank=True, related_name="standings")
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="standings")
    position = models.PositiveSmallIntegerField()
    played = models.PositiveSmallIntegerField(default=0)
    won = models.PositiveSmallIntegerField(default=0)
    drawn = models.PositiveSmallIntegerField(default=0)
    lost = models.PositiveSmallIntegerField(default=0)
    goals_for = models.PositiveSmallIntegerField(default=0)
    goals_against = models.PositiveSmallIntegerField(default=0)
    goal_difference = models.SmallIntegerField(default=0)
    points = models.PositiveSmallIntegerField(default=0)
    form = models.CharField(max_length=12, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["competition", "position"]
        unique_together = ["competition", "season", "team"]
        indexes = [
            models.Index(fields=["competition", "season", "position"]),
        ]

    def __str__(self):
        return f"{self.position}. {self.team} ({self.competition})"


class SportsSyncLog(models.Model):
    class Status(models.TextChoices):
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"

    provider = models.CharField(max_length=80)
    task = models.CharField(max_length=120)
    status = models.CharField(max_length=20, choices=Status.choices)
    message = models.TextField(blank=True)
    started_at = models.DateTimeField(default=timezone.now)
    finished_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        return f"{self.provider} {self.task} {self.status}"
