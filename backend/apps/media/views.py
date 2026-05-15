from rest_framework import parsers, permissions, viewsets

from apps.media.models import MediaAsset
from apps.media.serializers import MediaAssetSerializer
from core.permissions import IsEditorialStaffOrReadOnly
from core.responses import ApiResponseMixin


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
