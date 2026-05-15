from rest_framework import serializers

from apps.analytics.models import NewsletterSubscription


class AnalyticsOverviewSerializer(serializers.Serializer):
    total_articles = serializers.IntegerField()
    total_views = serializers.IntegerField()
    today_views = serializers.IntegerField()
    total_comments = serializers.IntegerField()
    total_newsletter_subscribers = serializers.IntegerField()
    trending_articles = serializers.ListField()
    popular_categories = serializers.ListField()


class NewsletterSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscription
        fields = ["id", "email", "source", "is_active", "created_at"]
        read_only_fields = ["id", "is_active", "created_at"]
