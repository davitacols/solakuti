from apps.analytics.models import ActivityLog


def get_client_ip(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def log_activity(request, action, object_type, description, object_id="", metadata=None):
    user = getattr(request, "user", None)
    ActivityLog.objects.create(
        user=user if user and user.is_authenticated else None,
        action=action,
        object_type=object_type,
        object_id=str(object_id or ""),
        description=description[:255],
        metadata=metadata or {},
        ip_address=get_client_ip(request),
    )
