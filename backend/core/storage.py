"""Media storage backends.

The storage class names are intentionally kept stable
(``MixedMediaCloudinaryStorage`` / ``SolakutiVideoCloudinaryStorage``) because
they are referenced by model fields and recorded in migration history. Switching
``MEDIA_PROVIDER`` between ``cloudinary`` and ``r2`` swaps the parent backend
without requiring a model migration.
"""

from django.conf import settings

MEDIA_PROVIDER = getattr(settings, "MEDIA_PROVIDER", "cloudinary")


if MEDIA_PROVIDER == "local":
    # Self-hosted on the VPS disk (MEDIA_ROOT), served by Nginx at MEDIA_URL.
    from django.core.files.storage import FileSystemStorage

    class MixedMediaCloudinaryStorage(FileSystemStorage):
        pass

    class SolakutiVideoCloudinaryStorage(FileSystemStorage):
        pass

elif MEDIA_PROVIDER == "r2":
    # Cloudflare R2 is S3-compatible; django-storages talks to it via the global
    # AWS_* settings defined in core.settings.base.
    from storages.backends.s3 import S3Storage

    class MixedMediaCloudinaryStorage(S3Storage):
        pass

    class SolakutiVideoCloudinaryStorage(S3Storage):
        pass

else:
    from cloudinary_storage.storage import (
        MediaCloudinaryStorage,
        RESOURCE_TYPES,
        VideoMediaCloudinaryStorage,
    )

    class MixedMediaCloudinaryStorage(MediaCloudinaryStorage):
        VIDEO_EXTENSIONS = {"mp4", "webm", "mov", "m4v", "avi", "mpeg", "mpg", "ogv"}
        IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp", "avif"}

        def _get_resource_type(self, name):
            extension = name.rsplit(".", 1)[-1].lower() if "." in name else ""
            if extension in self.VIDEO_EXTENSIONS:
                return RESOURCE_TYPES["VIDEO"]
            if extension in self.IMAGE_EXTENSIONS:
                return RESOURCE_TYPES["IMAGE"]
            return RESOURCE_TYPES["IMAGE"]

    class SolakutiVideoCloudinaryStorage(VideoMediaCloudinaryStorage):
        pass
