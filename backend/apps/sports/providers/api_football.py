from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation
import ssl
import time

import requests
from django.conf import settings
from django.db import DatabaseError
from django.db.models import Q
from django.utils import timezone

from apps.sports.models import (
    Competition,
    Fixture,
    FixtureEvent,
    FixtureLineup,
    FixtureStatistic,
    Player,
    Season,
    SportsSyncLog,
    Standing,
    Team,
    Venue,
)


class ApiFootballError(Exception):
    pass


class ApiFootballClient:
    provider = "api-football"

    LEAGUE_ALIASES = {
        "WC": 1,
        "CL": 2,
        "UEL": 3,
        "EC": 4,
        "PL": 39,
        "ELC": 40,
        "FL1": 61,
        "BL1": 78,
        "DED": 88,
        "PPL": 94,
        "SA": 135,
        "PD": 140,
        "BSA": 71,
        "NPFL": 399,
        "NGA1": 399,
        "NIGERIA": 399,
    }

    STATUS_MAP = {
        "TBD": Fixture.Status.SCHEDULED,
        "NS": Fixture.Status.SCHEDULED,
        "1H": Fixture.Status.LIVE,
        "HT": Fixture.Status.HALFTIME,
        "2H": Fixture.Status.LIVE,
        "ET": Fixture.Status.LIVE,
        "BT": Fixture.Status.LIVE,
        "P": Fixture.Status.LIVE,
        "SUSP": Fixture.Status.POSTPONED,
        "INT": Fixture.Status.POSTPONED,
        "FT": Fixture.Status.FINISHED,
        "AET": Fixture.Status.FINISHED,
        "PEN": Fixture.Status.FINISHED,
        "PST": Fixture.Status.POSTPONED,
        "CANC": Fixture.Status.CANCELLED,
        "ABD": Fixture.Status.CANCELLED,
        "AWD": Fixture.Status.FINISHED,
        "WO": Fixture.Status.FINISHED,
    }

    EVENT_MAP = {
        "Goal": FixtureEvent.EventType.GOAL,
        "subst": FixtureEvent.EventType.SUBSTITUTION,
        "Card": FixtureEvent.EventType.CARD,
        "Var": FixtureEvent.EventType.VAR,
    }

    POSITION_MAP = {
        "G": Player.Position.GOALKEEPER,
        "D": Player.Position.DEFENDER,
        "M": Player.Position.MIDFIELDER,
        "F": Player.Position.FORWARD,
    }

    def __init__(self, api_key=None, base_url=None, season=None):
        self.api_key = api_key or settings.API_FOOTBALL_API_KEY
        self.base_url = (base_url or settings.API_FOOTBALL_BASE_URL).rstrip("/")
        self.season = season or settings.API_FOOTBALL_SEASON or self._default_season()
        self._next_request_at = 0
        self.timeout = settings.API_FOOTBALL_TIMEOUT_SECONDS
        self.max_attempts = settings.API_FOOTBALL_MAX_ATTEMPTS
        self.session = requests.Session()
        self.session.headers.update(
            {
                "x-apisports-key": self.api_key,
                "Accept": "application/json",
                "User-Agent": "SolakutiSportsSync/1.0",
                "Connection": "close",
            }
        )
        if not self.api_key:
            raise ApiFootballError("API_FOOTBALL_API_KEY is not configured.")

    def sync_configured_competitions(self, days_back=2, days_ahead=7):
        return self.sync_competitions(
            settings.API_FOOTBALL_COMPETITIONS,
            days_back=days_back,
            days_ahead=days_ahead,
        )

    def sync_live_scores(self, competition_codes=None, days_back=0, days_ahead=1):
        return self.sync_live_competitions(
            competition_codes or settings.API_FOOTBALL_COMPETITIONS,
            days_back=days_back,
            days_ahead=days_ahead,
        )

    def sync_live_competitions(self, competition_codes, days_back=0, days_ahead=1):
        summary = {
            "competitions": 0,
            "teams": 0,
            "fixtures": 0,
            "events": 0,
            "lineups": 0,
            "statistics": 0,
            "standings": 0,
            "failed": [],
        }
        for raw_code in competition_codes:
            code = str(raw_code).strip()
            if not code:
                continue
            try:
                result = self.sync_live_competition(code, days_back=days_back, days_ahead=days_ahead)
                for key in ("competitions", "teams", "fixtures", "events", "lineups", "statistics", "standings"):
                    summary[key] += result[key]
            except Exception as exc:
                summary["failed"].append({"competition": code, "error": str(exc)})
                self._log("sync_live_competition", SportsSyncLog.Status.FAILED, f"{code}: {exc}")
        return summary

    def sync_competitions(self, competition_codes, days_back=2, days_ahead=7):
        summary = {
            "competitions": 0,
            "teams": 0,
            "fixtures": 0,
            "events": 0,
            "lineups": 0,
            "statistics": 0,
            "standings": 0,
            "failed": [],
        }
        for raw_code in competition_codes:
            code = str(raw_code).strip()
            if not code:
                continue
            try:
                result = self.sync_competition(code, days_back=days_back, days_ahead=days_ahead)
                for key in ("competitions", "teams", "fixtures", "events", "lineups", "statistics", "standings"):
                    summary[key] += result[key]
            except Exception as exc:
                summary["failed"].append({"competition": code, "error": str(exc)})
                self._log("sync_competition", SportsSyncLog.Status.FAILED, f"{code}: {exc}")
        return summary

    def sync_competition(self, code, days_back=2, days_ahead=7):
        league_id = self._resolve_league_id(code)
        league_payload = self._get("leagues", params={"id": league_id, "season": self.season})
        league_item = (league_payload.get("response") or [{}])[0]
        competition = self._upsert_competition(league_item, fallback_code=code)
        season = self._upsert_season(competition, league_item)

        teams_count = self._sync_teams(competition, league_id, season)
        date_from = (timezone.now().date() - timedelta(days=days_back)).isoformat()
        date_to = (timezone.now().date() + timedelta(days=days_ahead)).isoformat()
        fixture_rows = self._get(
            "fixtures",
            params={"league": league_id, "season": self.season, "from": date_from, "to": date_to},
        ).get("response", [])
        fixture_rows = self._merge_fixture_rows(fixture_rows, self._get_live_fixture_rows(league_id))

        fixtures_count = 0
        events_count = 0
        lineups_count = 0
        statistics_count = 0
        for row in fixture_rows:
            fixture = self._upsert_fixture(competition, season, row)
            fixtures_count += 1
            detail_row = row
            if settings.API_FOOTBALL_SYNC_DETAILS:
                detail_rows = self._get("fixtures", params={"id": fixture.provider_id}).get("response", [])
                if detail_rows:
                    detail_row = detail_rows[0]
                    fixture = self._upsert_fixture(competition, season, detail_row)
            events_count += self._sync_events(fixture, detail_row.get("events") or [])
            lineups_count += self._sync_lineups(fixture, detail_row.get("lineups") or [])
            statistics_count += self._sync_statistics(fixture, detail_row.get("statistics") or [])

        self._clear_stale_live_fixtures(competition)
        standings_count = self._sync_standings(competition, season, league_id)
        self._log(
            "sync_competition",
            SportsSyncLog.Status.SUCCESS,
            f"{code}: {fixtures_count} fixtures, {events_count} events, {lineups_count} lineup rows, {statistics_count} stats.",
        )
        return {
            "competitions": 1,
            "teams": teams_count,
            "fixtures": fixtures_count,
            "events": events_count,
            "lineups": lineups_count,
            "statistics": statistics_count,
            "standings": standings_count,
        }

    def sync_live_competition(self, code, days_back=0, days_ahead=1):
        league_id = self._resolve_league_id(code)
        league_payload = self._get("leagues", params={"id": league_id, "season": self.season})
        league_item = (league_payload.get("response") or [{}])[0]
        competition = self._upsert_competition(league_item, fallback_code=code)
        season = self._upsert_season(competition, league_item)

        date_from = (timezone.now().date() - timedelta(days=days_back)).isoformat()
        date_to = (timezone.now().date() + timedelta(days=days_ahead)).isoformat()
        fixture_rows = self._get(
            "fixtures",
            params={"league": league_id, "season": self.season, "from": date_from, "to": date_to},
        ).get("response", [])
        fixture_rows = self._merge_fixture_rows(fixture_rows, self._get_live_fixture_rows(league_id))

        fixtures_count = 0
        events_count = 0
        lineups_count = 0
        statistics_count = 0
        for row in fixture_rows:
            fixture = self._upsert_fixture(competition, season, row)
            fixtures_count += 1
            detail_row = row
            if fixture.is_live or fixture.status == Fixture.Status.FINISHED:
                detail_rows = self._get("fixtures", params={"id": fixture.provider_id}).get("response", [])
                if detail_rows:
                    detail_row = detail_rows[0]
                    fixture = self._upsert_fixture(competition, season, detail_row)
            events_count += self._sync_events(fixture, detail_row.get("events") or [])
            lineups_count += self._sync_lineups(fixture, detail_row.get("lineups") or [])
            statistics_count += self._sync_statistics(fixture, detail_row.get("statistics") or [])

        self._clear_stale_live_fixtures(competition)
        self._log(
            "sync_live_competition",
            SportsSyncLog.Status.SUCCESS,
            f"{code}: {fixtures_count} live-window fixtures, {events_count} events, {lineups_count} lineup rows, {statistics_count} stats.",
        )
        return {
            "competitions": 1,
            "teams": 0,
            "fixtures": fixtures_count,
            "events": events_count,
            "lineups": lineups_count,
            "statistics": statistics_count,
            "standings": 0,
        }

    def _get_live_fixture_rows(self, league_id):
        try:
            return self._get(
                "fixtures",
                params={"live": "all", "league": league_id, "season": self.season},
            ).get("response", [])
        except ApiFootballError as exc:
            self._log(
                "sync_live_fixtures",
                SportsSyncLog.Status.FAILED,
                f"{league_id}: {exc}",
            )
            return []

    def _merge_fixture_rows(self, fixture_rows, live_rows):
        rows_by_id = {}
        for row in fixture_rows + live_rows:
            fixture_id = str(((row.get("fixture") or {}).get("id")) or "")
            if fixture_id:
                rows_by_id[fixture_id] = row
        return list(rows_by_id.values())

    def _clear_stale_live_fixtures(self, competition):
        stale_before = timezone.now() - timedelta(minutes=20)
        Fixture.objects.filter(
            competition=competition,
            provider=self.provider,
            status__in=[Fixture.Status.LIVE, Fixture.Status.HALFTIME],
        ).filter(
            Q(last_synced_at__lt=stale_before) | Q(last_synced_at__isnull=True),
        ).update(status=Fixture.Status.SCHEDULED, period="", minute=None)

    def _get(self, path, params=None):
        url = f"{self.base_url}/{path.lstrip('/')}"
        response = None
        last_exc = None
        for attempt in range(1, self.max_attempts + 1):
            self._respect_throttle_window()
            try:
                response = self.session.get(url, params=params, timeout=self.timeout)
                break
            except requests.RequestException as exc:
                last_exc = exc
                if attempt >= self.max_attempts:
                    hint = self._connection_hint(exc)
                    raise ApiFootballError(f"Could not reach API-Football after {attempt} attempts: {exc}{hint}") from exc
                time.sleep(min(2 * attempt, 8))
        if response is None:
            raise ApiFootballError(f"Could not reach API-Football: {last_exc}")
        self._update_throttle_window(response)
        if response.status_code == 429:
            raise ApiFootballError("API-Football rate limit reached. Try again after the reset window.")
        if response.status_code in {401, 403}:
            raise ApiFootballError("API-Football rejected the API key or plan access.")
        response.raise_for_status()
        payload = response.json()
        errors = payload.get("errors")
        if errors:
            raise ApiFootballError(f"API-Football returned an error: {errors}")
        return payload

    def _connection_hint(self, exc):
        if isinstance(exc, requests.exceptions.SSLError) or isinstance(getattr(exc, "__context__", None), ssl.SSLError):
            return (
                ". This looks like a local SSL/network interruption. Try again from Render, another network, "
                "or update local Python/certifi if it only happens on this computer."
            )
        return ""

    def _respect_throttle_window(self):
        wait_seconds = self._next_request_at - time.monotonic()
        if wait_seconds > 0:
            time.sleep(wait_seconds)

    def _update_throttle_window(self, response):
        retry_after = self._header_float(response, "Retry-After")
        if retry_after:
            self._next_request_at = max(self._next_request_at, time.monotonic() + retry_after)
            return
        remaining = self._header_int(response, "x-ratelimit-requests-remaining")
        if remaining is not None and remaining <= 1:
            self._next_request_at = max(self._next_request_at, time.monotonic() + 60)

    def _header_int(self, response, name):
        value = response.headers.get(name)
        if value is None:
            return None
        try:
            return int(float(value))
        except (TypeError, ValueError):
            return None

    def _header_float(self, response, name):
        value = response.headers.get(name)
        if value is None:
            return None
        try:
            return max(float(value), 0)
        except (TypeError, ValueError):
            return None

    def _resolve_league_id(self, code):
        code = str(code).strip().upper()
        if code.isdigit():
            return int(code)
        if code in self.LEAGUE_ALIASES:
            return self.LEAGUE_ALIASES[code]
        raise ApiFootballError(f"Unknown API-Football league code '{code}'. Use a numeric league ID or a configured alias.")

    def _upsert_competition(self, payload, fallback_code):
        league = payload.get("league") or {}
        country = payload.get("country") or {}
        provider_id = str(league.get("id") or self._resolve_league_id(fallback_code))
        name = league.get("name") or str(fallback_code)
        defaults = {
            "name": name,
            "country": country.get("name") or "",
            "logo_url": league.get("logo") or "",
            "is_featured": True,
            "provider": self.provider,
            "provider_id": provider_id,
        }
        competition = (
            Competition.objects.filter(provider=self.provider, provider_id=provider_id).first()
            or Competition.objects.filter(name__iexact=name).first()
        )
        if competition:
            for field, value in defaults.items():
                setattr(competition, field, value)
            competition.save()
            return competition
        return Competition.objects.create(**defaults)

    def _upsert_season(self, competition, payload):
        seasons = payload.get("seasons") or []
        season_payload = next((item for item in seasons if int(item.get("year") or 0) == int(self.season)), None) or {}
        start_date = season_payload.get("start") or ""
        end_date = season_payload.get("end") or ""
        start_year = int(start_date[:4]) if start_date[:4].isdigit() else int(self.season)
        end_year = int(end_date[:4]) if end_date[:4].isdigit() else start_year + 1
        name = f"{start_year}/{str(end_year)[-2:]}" if end_year != start_year else str(start_year)
        provider_id = f"{competition.provider_id}:{self.season}"
        defaults = {
            "competition": competition,
            "name": name,
            "start_year": start_year,
            "end_year": end_year,
            "is_current": True,
            "provider": self.provider,
            "provider_id": provider_id,
        }
        season = (
            Season.objects.filter(provider=self.provider, provider_id=provider_id).first()
            or Season.objects.filter(competition=competition, name=name).first()
        )
        if season:
            for field, value in defaults.items():
                setattr(season, field, value)
            season.save()
        else:
            season = Season.objects.create(**defaults)
        Season.objects.filter(competition=competition, is_current=True).exclude(pk=season.pk).update(is_current=False)
        return season

    def _sync_teams(self, competition, league_id, season):
        rows = self._get("teams", params={"league": league_id, "season": self.season}).get("response", [])
        count = 0
        for row in rows:
            _team, created = self._upsert_team(row.get("team") or {})
            count += int(created)
        return count

    def _upsert_team(self, payload):
        provider_id = str(payload.get("id") or "")
        name = payload.get("name") or f"Team {provider_id}"
        defaults = {
            "name": name,
            "short_name": payload.get("code") or "",
            "country": payload.get("country") or "",
            "crest_url": payload.get("logo") or "",
            "provider": self.provider,
            "provider_id": provider_id,
        }
        team = None
        if provider_id:
            team = Team.objects.filter(provider=self.provider, provider_id=provider_id).first()
        team = team or Team.objects.filter(name__iexact=name).first()
        created = False
        if team:
            for field, value in defaults.items():
                setattr(team, field, value)
            team.save()
        else:
            team = Team.objects.create(**defaults)
            created = True
        return team, created

    def _upsert_fixture(self, competition, season, row):
        fixture_payload = row.get("fixture") or {}
        teams = row.get("teams") or {}
        goals = row.get("goals") or {}
        league = row.get("league") or {}
        status = fixture_payload.get("status") or {}
        venue_payload = fixture_payload.get("venue") or {}
        home_team, _home_created = self._upsert_team(teams.get("home") or {})
        away_team, _away_created = self._upsert_team(teams.get("away") or {})
        venue = self._upsert_venue(venue_payload)
        provider_id = str(fixture_payload.get("id") or "")
        fixture, _created = Fixture.objects.update_or_create(
            provider=self.provider,
            provider_id=provider_id,
            defaults={
                "competition": competition,
                "season": season,
                "home_team": home_team,
                "away_team": away_team,
                "kickoff_at": self._parse_datetime(fixture_payload.get("date")),
                "status": self.STATUS_MAP.get(status.get("short"), Fixture.Status.SCHEDULED),
                "status_reason": status.get("long") or "",
                "period": status.get("short") or "",
                "minute": self._positive_minute(status.get("elapsed")),
                "home_score": goals.get("home") or 0,
                "away_score": goals.get("away") or 0,
                "round_name": league.get("round") or "",
                "venue": venue_payload.get("name") or "",
                "venue_detail": venue,
                "referee": fixture_payload.get("referee") or "",
                "last_synced_at": timezone.now(),
            },
        )
        return fixture

    def _upsert_venue(self, payload):
        if not payload or not payload.get("name"):
            return None
        provider_id = str(payload.get("id") or "")
        defaults = {
            "name": payload.get("name") or "",
            "city": payload.get("city") or "",
            "provider": self.provider,
            "provider_id": provider_id,
        }
        venue = None
        if provider_id:
            venue = Venue.objects.filter(provider=self.provider, provider_id=provider_id).first()
        venue = venue or Venue.objects.filter(name__iexact=defaults["name"], city__iexact=defaults["city"]).first()
        if venue:
            for field, value in defaults.items():
                setattr(venue, field, value)
            venue.save()
            return venue
        return Venue.objects.create(**defaults)

    def _sync_events(self, fixture, rows):
        FixtureEvent.objects.filter(fixture=fixture, provider=self.provider).delete()
        count = 0
        for index, row in enumerate(rows):
            event_type = self._map_event_type(row)
            time_payload = row.get("time") or {}
            team, _created = self._upsert_team(row.get("team") or {}) if row.get("team") else (None, False)
            player = row.get("player") or {}
            assist = row.get("assist") or {}
            FixtureEvent.objects.create(
                fixture=fixture,
                team=team,
                event_type=event_type,
                minute=self._positive_minute(time_payload.get("elapsed")),
                extra_minute=self._positive_minute(time_payload.get("extra")),
                player_name=player.get("name") or "",
                assist_name=assist.get("name") or "",
                detail=row.get("detail") or row.get("comments") or "",
                provider=self.provider,
                provider_id=f"{fixture.provider_id}:event:{index}",
            )
            count += 1
        return count

    def _map_event_type(self, row):
        detail = str(row.get("detail") or "").lower()
        event_type = self.EVENT_MAP.get(row.get("type"), FixtureEvent.EventType.INFO)
        if "own goal" in detail:
            return FixtureEvent.EventType.OWN_GOAL
        if "missed penalty" in detail:
            return FixtureEvent.EventType.MISSED_PENALTY
        if "penalty" in detail:
            return FixtureEvent.EventType.PENALTY
        if "red card" in detail:
            return FixtureEvent.EventType.RED_CARD
        if "yellow card" in detail:
            return FixtureEvent.EventType.YELLOW_CARD
        return event_type

    def _sync_lineups(self, fixture, rows):
        FixtureLineup.objects.filter(fixture=fixture, provider=self.provider).delete()
        count = 0
        for lineup in rows:
            team, _created = self._upsert_team(lineup.get("team") or {})
            if not team:
                continue
            if team.pk == fixture.home_team_id:
                fixture.home_formation = lineup.get("formation") or fixture.home_formation
                coach = lineup.get("coach") or {}
                fixture.home_manager = coach.get("name") or fixture.home_manager
            elif team.pk == fixture.away_team_id:
                fixture.away_formation = lineup.get("formation") or fixture.away_formation
                coach = lineup.get("coach") or {}
                fixture.away_manager = coach.get("name") or fixture.away_manager
            count += self._sync_lineup_group(fixture, team, lineup.get("startXI") or [], is_starting=True)
            count += self._sync_lineup_group(fixture, team, lineup.get("substitutes") or [], is_starting=False)
        fixture.save(update_fields=["home_formation", "away_formation", "home_manager", "away_manager", "updated_at"])
        return count

    def _sync_lineup_group(self, fixture, team, rows, is_starting):
        count = 0
        for item in rows:
            payload = item.get("player") or {}
            player = self._upsert_player(payload, team)
            FixtureLineup.objects.create(
                fixture=fixture,
                team=team,
                player=player,
                player_name=payload.get("name") or "",
                shirt_number=payload.get("number"),
                position=payload.get("pos") or "",
                formation_position=self._grid_to_position(payload.get("grid")),
                is_starting=is_starting,
                provider=self.provider,
                provider_id=f"{fixture.provider_id}:lineup:{payload.get('id') or payload.get('name')}:{int(is_starting)}",
            )
            count += 1
        return count

    def _upsert_player(self, payload, team):
        provider_id = str(payload.get("id") or "")
        name = payload.get("name") or ""
        if not name:
            return None
        defaults = {
            "current_team": team,
            "name": name,
            "position": self.POSITION_MAP.get(payload.get("pos"), Player.Position.UNKNOWN),
            "shirt_number": payload.get("number"),
            "provider": self.provider,
            "provider_id": provider_id,
        }
        player = None
        if provider_id:
            player = Player.objects.filter(provider=self.provider, provider_id=provider_id).first()
        player = player or Player.objects.filter(name__iexact=name, current_team=team).first()
        if player:
            for field, value in defaults.items():
                setattr(player, field, value)
            player.save()
            return player
        return Player.objects.create(**defaults)

    def _sync_statistics(self, fixture, rows):
        values_by_team = {}
        for row in rows:
            team_id = str((row.get("team") or {}).get("id") or "")
            values_by_team[team_id] = {
                stat.get("type"): stat.get("value")
                for stat in row.get("statistics") or []
                if stat.get("type")
            }
        home_key = str(fixture.home_team.provider_id)
        away_key = str(fixture.away_team.provider_id)
        names = sorted(set(values_by_team.get(home_key, {})) | set(values_by_team.get(away_key, {})))
        count = 0
        for name in names:
            home_value = values_by_team.get(home_key, {}).get(name)
            away_value = values_by_team.get(away_key, {}).get(name)
            FixtureStatistic.objects.update_or_create(
                fixture=fixture,
                group="Match",
                name=name,
                defaults={
                    "home_value": "" if home_value is None else str(home_value),
                    "away_value": "" if away_value is None else str(away_value),
                    "home_numeric": self._numeric(home_value),
                    "away_numeric": self._numeric(away_value),
                    "provider": self.provider,
                    "provider_id": f"{fixture.provider_id}:stat:{name}",
                },
            )
            count += 1
        return count

    def _sync_standings(self, competition, season, league_id):
        rows = self._get("standings", params={"league": league_id, "season": self.season}).get("response", [])
        tables = (rows[0].get("league") or {}).get("standings") if rows else []
        count = 0
        for table in tables or []:
            for row in table:
                team, _created = self._upsert_team(row.get("team") or {})
                Standing.objects.update_or_create(
                    competition=competition,
                    season=season,
                    team=team,
                    defaults={
                        "position": row.get("rank") or 0,
                        "played": (row.get("all") or {}).get("played") or 0,
                        "won": (row.get("all") or {}).get("win") or 0,
                        "drawn": (row.get("all") or {}).get("draw") or 0,
                        "lost": (row.get("all") or {}).get("lose") or 0,
                        "goals_for": ((row.get("all") or {}).get("goals") or {}).get("for") or 0,
                        "goals_against": ((row.get("all") or {}).get("goals") or {}).get("against") or 0,
                        "goal_difference": row.get("goalsDiff") or 0,
                        "points": row.get("points") or 0,
                        "form": (row.get("form") or "")[:12],
                    },
                )
                count += 1
        return count

    def _parse_datetime(self, value):
        if not value:
            return timezone.now()
        return datetime.fromisoformat(value.replace("Z", "+00:00"))

    def _positive_minute(self, value):
        try:
            minute = int(value)
        except (TypeError, ValueError):
            return None
        return minute if minute >= 0 else None

    def _grid_to_position(self, value):
        if not value:
            return None
        try:
            return int(str(value).split(":")[-1])
        except (TypeError, ValueError):
            return None

    def _numeric(self, value):
        if value is None:
            return None
        normalized = str(value).replace("%", "").strip()
        try:
            return Decimal(normalized)
        except (InvalidOperation, ValueError):
            return None

    def _default_season(self):
        today = timezone.now().date()
        return today.year if today.month >= 7 else today.year - 1

    def _log(self, task, status, message):
        now = timezone.now()
        try:
            SportsSyncLog.objects.create(
                provider=self.provider,
                task=task,
                status=status,
                message=message,
                started_at=now,
                finished_at=now,
            )
        except DatabaseError:
            pass
