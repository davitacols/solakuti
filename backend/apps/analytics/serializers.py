from rest_framework import serializers


class AnalyticsOverviewSerializer(serializers.Serializer):
    total_articles = serializers.IntegerField()
    total_views = serializers.IntegerField()
    total_comments = serializers.IntegerField()
    trending_articles = serializers.ListField()
    popular_categories = serializers.ListField()
