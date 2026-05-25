from django.conf import settings


def active_provider_name():
    provider = getattr(settings, "SPORTS_PROVIDER", "football_data")
    provider = str(provider).strip().lower().replace("-", "_")
    if provider in {"api_football", "apifootball", "api_sports"}:
        return "api-football"
    if provider in {"football_data", "football_data_org"}:
        return "football-data"
    return provider.replace("_", "-")


def provider_queryset(queryset):
    return queryset.filter(provider=active_provider_name(), provider_id__gt="")
