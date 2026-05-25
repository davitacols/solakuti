from django.conf import settings

from apps.sports.providers.api_football import ApiFootballClient, ApiFootballError
from apps.sports.providers.football_data import FootballDataClient, FootballDataError


class SportsProviderError(Exception):
    pass


def get_sports_provider_client():
    provider = settings.SPORTS_PROVIDER.strip().lower().replace("-", "_")
    if provider in {"api_football", "apifootball", "api_sports"}:
        return ApiFootballClient()
    if provider in {"football_data", "football_data_org", "football-data"}:
        return FootballDataClient()
    raise SportsProviderError(f"Unsupported SPORTS_PROVIDER '{settings.SPORTS_PROVIDER}'.")


def normalize_provider_error(exc):
    if isinstance(exc, (ApiFootballError, FootballDataError, SportsProviderError)):
        return str(exc)
    return None
