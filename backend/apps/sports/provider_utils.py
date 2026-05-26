from django.conf import settings


def active_provider_name():
    provider = getattr(settings, "SPORTS_PROVIDER", "api_football")
    provider = str(provider).strip().lower().replace("-", "_")
    if provider in {"api_football", "apifootball", "api_sports"}:
        return "api-football"
    return provider.replace("_", "-")


def provider_queryset(queryset):
    return queryset.filter(provider=active_provider_name(), provider_id__gt="")
