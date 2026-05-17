from django.conf import settings
from django.db import models

from core.storage import MixedMediaCloudinaryStorage


class MediaAsset(models.Model):
    class AssetType(models.TextChoices):
        IMAGE = "image", "Image"
        VIDEO = "video", "Video"
        DOCUMENT = "document", "Document"

    title = models.CharField(max_length=180)
    file = models.FileField(upload_to="uploads/", storage=MixedMediaCloudinaryStorage())
    asset_type = models.CharField(max_length=20, choices=AssetType.choices, default=AssetType.IMAGE)
    alt_text = models.CharField(max_length=220, blank=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="media_assets")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["asset_type", "-created_at"]),
        ]

    def __str__(self):
        return self.title

    @property
    def optimized_url(self):
        if not self.file:
            return None
        url = self.file.url
        if "res.cloudinary.com" in url and "/upload/" in url:
            return url.replace("/upload/", "/upload/f_auto,q_auto,c_limit,w_1600/")
        return url

    @property
    def thumbnail_url(self):
        if not self.file:
            return None
        url = self.file.url
        if "res.cloudinary.com" in url and "/upload/" in url:
            return url.replace("/upload/", "/upload/f_auto,q_auto,c_fill,w_480,h_320/")
        return url
