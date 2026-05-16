from rest_framework import serializers

from apps.analytics.models import ActivityLog, LoginAttempt, NewsletterSubscription


class AnalyticsOverviewSerializer(serializers.Serializer):
    total_articles = serializers.IntegerField()
    total_views = serializers.IntegerField()
    today_views = serializers.IntegerField()
    total_comments = serializers.IntegerField()
    total_newsletter_subscribers = serializers.IntegerField()
    trending_articles = serializers.ListField()
    popular_categories = serializers.ListField()
    recent_activity = serializers.ListField(required=False)
    recent_login_attempts = serializers.ListField(required=False)
    last_updated = serializers.DateTimeField(required=False)
    source = serializers.CharField(required=False)


class NewsletterSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscription
        fields = ["id", "email", "source", "is_active", "created_at"]
        read_only_fields = ["id", "is_active", "created_at"]


class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            "id",
            "user_name",
            "user_email",
            "action",
            "object_type",
            "object_id",
            "description",
            "metadata",
            "ip_address",
            "created_at",
        ]


class LoginAttemptSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = LoginAttempt
        fields = ["id", "email", "user_name", "success", "ip_address", "user_agent", "created_at"]
