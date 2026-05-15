from rest_framework import serializers
from drf_spectacular.utils import OpenApiTypes, extend_schema_field

from apps.categories.models import Category


class CategorySerializer(serializers.ModelSerializer):
    featured_image_url = serializers.SerializerMethodField()
    articles_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "featured_image", "featured_image_url", "articles_count", "created_at"]
        read_only_fields = ["id", "slug", "featured_image_url", "articles_count", "created_at"]

    @extend_schema_field(OpenApiTypes.URI)
    def get_featured_image_url(self, obj):
        if obj.featured_image:
            return obj.featured_image.url
        return None
