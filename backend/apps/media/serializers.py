from rest_framework import serializers

from apps.media.models import MediaAsset


class MediaAssetSerializer(serializers.ModelSerializer):
    optimized_url = serializers.CharField(read_only=True)
    thumbnail_url = serializers.CharField(read_only=True)

    class Meta:
        model = MediaAsset
        fields = [
            "id",
            "title",
            "file",
            "asset_type",
            "alt_text",
            "optimized_url",
            "thumbnail_url",
            "uploaded_by",
            "created_at",
        ]
        read_only_fields = ["id", "optimized_url", "thumbnail_url", "uploaded_by", "created_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["uploaded_by"] = request.user
        return super().create(validated_data)
