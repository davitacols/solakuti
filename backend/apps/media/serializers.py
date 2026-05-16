from rest_framework import serializers

from apps.media.models import MediaAsset

MAX_IMAGE_UPLOAD_SIZE = 5 * 1024 * 1024
MAX_VIDEO_UPLOAD_SIZE = 50 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/quicktime"}


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

    def validate(self, attrs):
        upload = attrs.get("file") or getattr(self.instance, "file", None)
        asset_type = attrs.get("asset_type") or getattr(self.instance, "asset_type", MediaAsset.AssetType.IMAGE)

        if not upload:
            return attrs

        content_type = getattr(upload, "content_type", "")
        size = getattr(upload, "size", 0)

        if asset_type == MediaAsset.AssetType.IMAGE:
            if content_type not in ALLOWED_IMAGE_TYPES:
                raise serializers.ValidationError({"file": "Upload a JPG, PNG, WebP, or GIF image."})
            if size > MAX_IMAGE_UPLOAD_SIZE:
                raise serializers.ValidationError({"file": "Images must be 5MB or smaller."})

        if asset_type == MediaAsset.AssetType.VIDEO:
            if content_type not in ALLOWED_VIDEO_TYPES:
                raise serializers.ValidationError({"file": "Upload an MP4, WebM, or MOV video."})
            if size > MAX_VIDEO_UPLOAD_SIZE:
                raise serializers.ValidationError({"file": "Videos must be 50MB or smaller."})

        if asset_type == MediaAsset.AssetType.DOCUMENT:
            raise serializers.ValidationError({"asset_type": "Document uploads are disabled for newsroom security."})

        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["uploaded_by"] = request.user
        return super().create(validated_data)
