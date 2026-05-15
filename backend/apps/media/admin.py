from django.contrib import admin
from django.utils.html import format_html

from apps.media.models import MediaAsset


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ["title", "asset_type", "uploaded_by", "created_at", "preview"]
    list_filter = ["asset_type", "created_at"]
    search_fields = ["title", "alt_text", "uploaded_by__email"]
    readonly_fields = ["created_at", "preview", "optimized_url", "thumbnail_url"]

    def preview(self, obj):
        if obj.thumbnail_url and obj.asset_type == obj.AssetType.IMAGE:
            return format_html('<img src="{}" style="width:100px;height:68px;object-fit:cover;border-radius:6px;" />', obj.thumbnail_url)
        return "No preview"

    def optimized_url(self, obj):
        return obj.optimized_url or ""

    def thumbnail_url(self, obj):
        return obj.thumbnail_url or ""
