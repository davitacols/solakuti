from django.db.models import Q
from django.utils import timezone


def public_article_q(now=None, prefix=""):
    current_time = now or timezone.now()
    return Q(**{f"{prefix}is_published": True}) & (
        Q(**{f"{prefix}published_at__lte": current_time}) | Q(**{f"{prefix}published_at__isnull": True})
    )
