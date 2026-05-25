from datetime import datetime, timedelta
import time

import requests
from django.conf import settings
from django.db import DatabaseError
from django.utils import timezone

from apps.sports.models import Competition, Fixture, Season, SportsSyncLog, Standing, Team


class FootballDataError(Exception):
    pass


class FootballDataClient:
    provider = "football-data"

    STATUS_MAP = {
        "SCHEDULED": Fixture.Status.SCHEDULED,
        "TIMED": Fixture.Status.SCHEDULED,
        "IN_PLAY": Fixture.Status.LIVE,
        "PAUSED": Fixture.Status.HALFTIME,
        "FINISHED": Fixture.Status.FINISHED,
        "POSTPONED": Fixture.Status.POSTPONED,
        "SUSPENDED": Fixture.Status.POSTPONED,
        "CANCELLED": Fixture.Status.CANCELLED,
    }

    def __init__(self, api_key=None, base_url=None):
        self.api_key = api_key or settings.FOOTBALL_DATA_API_KEY
        self.base_url = (base_url or settings.FOOTBALL_DATA_BASE_URL).rstrip("/")
        self._next_request_at = 0
        if not self.api_key:
            raise FootballDataError("FOOTBALL_DATA_API_KEY is not configured.")

    def sync_configured_competitions(self, days_back=2, days_ahead=7):
        return self.sync_competitions(settings.FOOTBALL_DATA_COMPETITIONS, days_back=days_back, days_ahead=days_ahead)

    def sync_competitions(self, competition_codes, days_back=2, days_ahead=7):
        summary = {
            "competitions": 0,
            "teams": 0,
            "fixtures": 0,
            "standings": 0,
            "failed": [],
        }
        for code in competition_codes:
            code = str(code).strip().upper()
            if not code:
                continue
            try:
                result = self.sync_competition(code, days_back=days_back, days_ahead=days_ahead)
                for key in ("competitions", "teams", "fixtures", "standings"):
                    summary[key] += result[key]
            except Exception as exc:
                summary["failed"].append({"competition": code, "error": str(exc)})
                self._log("sync_competition", SportsSyncLog.Status.FAILED, f"{code}: {exc}")
        return summary

    def sync_competition(self, code, days_back=2, days_ahead=7):
        competition_payload = self._get(f"/competitions/{code}")
        competition = self._upsert_competition(competition_payload, fallback_code=code)
        season = self._upsert_season(competition, competition_payload.get("currentSeason") or {})

        date_from = (timezone.now().date() - timedelta(days=days_back)).isoformat()
        date_to = (timezone.now().date() + timedelta(days=days_ahead)).isoformat()
        matches_payload = self._get(
            f"/competitions/{code}/matches",
            params={"dateFrom": date_from, "dateTo": date_to},
        )
        fixtures_count = 0
        teams_count = 0
        for match in matches_payload.get("matches", []):
            created_teams, _fixture = self._upsert_match(competition, season, match)
            teams_count += created_teams
            fixtures_count += 1

        standings_count = self._sync_standings(competition, season, code)
        self._log(
            "sync_competition",
            SportsSyncLog.Status.SUCCESS,
            f"{code}: {fixtures_count} fixtures, {standings_count} table rows.",
        )
        return {
            "competitions": 1,
            "teams": teams_count,
            "fixtures": fixtures_count,
            "standings": standings_count,
        }

    def _get(self, path, params=None):
        self._respect_throttle_window()
        try:
            response = requests.get(
                f"{self.base_url}{path}",
                headers={"X-Auth-Token": self.api_key},
                params=params,
                timeout=20,
            )
        except requests.RequestException as exc:
            raise FootballDataError(f"Could not reach football-data.org: {exc}") from exc
        self._update_throttle_window(response)
        if response.status_code == 429:
            retry_after = self._header_float(response, "Retry-After")
            if retry_after:
                self._next_request_at = max(self._next_request_at, time.monotonic() + retry_after)
            raise FootballDataError("football-data.org rate limit reached. Try again after the reset window.")
        if response.status_code in {401, 403}:
            raise FootballDataError("football-data.org rejected the API token or plan access.")
        if response.status_code == 404:
            raise FootballDataError(f"football-data.org endpoint was not found: {path}")
        response.raise_for_status()
        return response.json()

    def _respect_throttle_window(self):
        wait_seconds = self._next_request_at - time.monotonic()
        if wait_seconds > 0:
            time.sleep(wait_seconds)

    def _update_throttle_window(self, response):
        retry_after = self._header_float(response, "Retry-After")
        if retry_after:
            self._next_request_at = max(self._next_request_at, time.monotonic() + retry_after)
            return

        remaining = self._header_int(response, "X-Requests-Available-Minute")
        reset_seconds = self._header_float(response, "X-RequestCounter-Reset")
        if remaining is not None and remaining <= 1 and reset_seconds:
            self._next_request_at = max(self._next_request_at, time.monotonic() + reset_seconds)

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

    def _upsert_competition(self, payload, fallback_code):
        provider_id = str(payload.get("id") or fallback_code)
        name = payload.get("name") or fallback_code
        area = payload.get("area") or {}
        defaults = {
            "name": name,
            "country": area.get("name") or "",
            "logo_url": payload.get("emblem") or "",
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
        if not payload:
            return None
        provider_id = str(payload.get("id") or "")
        start_date = payload.get("startDate") or ""
        end_date = payload.get("endDate") or ""
        start_year = int(start_date[:4]) if start_date[:4].isdigit() else None
        end_year = int(end_date[:4]) if end_date[:4].isdigit() else None
        name = f"{start_year}/{str(end_year)[-2:]}" if start_year and end_year else payload.get("name") or str(start_year or end_year or "Current")
        defaults = {
            "competition": competition,
            "name": name,
            "start_year": start_year,
            "end_year": end_year,
            "is_current": True,
            "provider": self.provider,
            "provider_id": provider_id,
        }
        if provider_id:
            season = Season.objects.filter(provider=self.provider, provider_id=provider_id).first()
            if season:
                for field, value in defaults.items():
                    setattr(season, field, value)
                season.save()
                Season.objects.filter(competition=competition, is_current=True).exclude(pk=season.pk).update(is_current=False)
                return season
        season, _created = Season.objects.update_or_create(
            competition=competition,
            name=name,
            defaults=defaults,
        )
        Season.objects.filter(competition=competition, is_current=True).exclude(pk=season.pk).update(is_current=False)
        return season

    def _upsert_team(self, payload):
        provider_id = str(payload.get("id") or "")
        name = payload.get("name") or payload.get("shortName") or f"Team {provider_id}"
        defaults = {
            "name": name,
            "short_name": payload.get("tla") or payload.get("shortName") or "",
            "crest_url": payload.get("crest") or "",
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

    def _upsert_match(self, competition, season, match):
        home_team, home_created = self._upsert_team(match.get("homeTeam") or {})
        away_team, away_created = self._upsert_team(match.get("awayTeam") or {})
        provider_id = str(match.get("id"))
        score = match.get("score") or {}
        full_time = score.get("fullTime") or {}
        half_time = score.get("halfTime") or {}
        home_score = full_time.get("home")
        away_score = full_time.get("away")
        if home_score is None:
            home_score = half_time.get("home") or 0
        if away_score is None:
            away_score = half_time.get("away") or 0
        fixture, _created = Fixture.objects.update_or_create(
            provider=self.provider,
            provider_id=provider_id,
            defaults={
                "competition": competition,
                "season": season,
                "home_team": home_team,
                "away_team": away_team,
                "kickoff_at": self._parse_datetime(match.get("utcDate")),
                "status": self.STATUS_MAP.get(match.get("status"), Fixture.Status.SCHEDULED),
                "minute": None,
                "home_score": home_score,
                "away_score": away_score,
                "round_name": match.get("stage") or match.get("group") or "",
                "venue": "",
                "last_synced_at": timezone.now(),
            },
        )
        return int(home_created) + int(away_created), fixture

    def _sync_standings(self, competition, season, code):
        try:
            standings_payload = self._get(f"/competitions/{code}/standings")
        except FootballDataError as exc:
            if "plan access" in str(exc) or "not found" in str(exc).lower():
                return 0
            raise
        rows = []
        for table in standings_payload.get("standings", []):
            if table.get("type") == "TOTAL":
                rows = table.get("table", [])
                break
        if not rows and standings_payload.get("standings"):
            rows = standings_payload["standings"][0].get("table", [])

        for row in rows:
            team, _created = self._upsert_team(row.get("team") or {})
            Standing.objects.update_or_create(
                competition=competition,
                season=season,
                team=team,
                defaults={
                    "position": row.get("position") or 0,
                    "played": row.get("playedGames") or 0,
                    "won": row.get("won") or 0,
                    "drawn": row.get("draw") or 0,
                    "lost": row.get("lost") or 0,
                    "goals_for": row.get("goalsFor") or 0,
                    "goals_against": row.get("goalsAgainst") or 0,
                    "goal_difference": row.get("goalDifference") or 0,
                    "points": row.get("points") or 0,
                    "form": (row.get("form") or "")[:12],
                },
            )
        return len(rows)

    def _parse_datetime(self, value):
        if not value:
            return timezone.now()
        return datetime.fromisoformat(value.replace("Z", "+00:00"))

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
