from rest_framework import parsers, permissions, viewsets

from apps.media.models import MediaAsset
from apps.media.serializers import MediaAssetSerializer
from apps.analytics.models import ActivityLog
from apps.analytics.utils import log_activity
from core.permissions import IsEditorialStaffOrReadOnly
from core.responses import ApiResponseMixin
from core.uploads import save_with_storage_guard


class MediaAssetViewSet(ApiResponseMixin, viewsets.ModelViewSet):
    serializer_class = MediaAssetSerializer
    permission_classes = [permissions.IsAuthenticated, IsEditorialStaffOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    throttle_scope = "uploads"
    filterset_fields = ["asset_type", "uploaded_by"]
    search_fields = ["title", "alt_text"]
    ordering_fields = ["created_at", "title"]
    ordering = ["-created_at"]
    success_message = "Media assets fetched successfully."

    def get_queryset(self):
        return MediaAsset.objects.select_related("uploaded_by")

    def perform_create(self, serializer):
        asset = save_with_storage_guard(serializer)
        log_activity(self.request, ActivityLog.Action.CREATED, "media", f"Uploaded media: {asset.title}", object_id=asset.pk)

    def perform_update(self, serializer):
        asset = save_with_storage_guard(serializer)
        log_activity(self.request, ActivityLog.Action.UPDATED, "media", f"Updated media: {asset.title}", object_id=asset.pk)

    def perform_destroy(self, instance):
        log_activity(self.request, ActivityLog.Action.DELETED, "media", f"Deleted media: {instance.title}", object_id=instance.pk)
        instance.delete()
