"""Helpers for guarding media-upload storage failures.

Upload backends (Cloudinary, Cloudflare R2) raise provider-specific errors when
the account is over quota or the service is unreachable. Left unhandled these
surface as an opaque HTTP 500. ``save_with_storage_guard`` converts them into a
DRF ValidationError so editors get an actionable 400 instead.
"""

import logging

from rest_framework.exceptions import ValidationError

logger = logging.getLogger(__name__)

_storage_errors = []
try:  # Cloudinary
    from cloudinary.exceptions import Error as _CloudinaryError

    _storage_errors.append(_CloudinaryError)
except Exception:  # pragma: no cover - optional dependency
    pass
try:  # Cloudflare R2 / any S3 backend via boto3
    from botocore.exceptions import BotoCoreError, ClientError

    _storage_errors.extend([BotoCoreError, ClientError])
except Exception:  # pragma: no cover - optional dependency
    pass

STORAGE_ERRORS = tuple(_storage_errors)

UPLOAD_FAILED_MESSAGE = (
    "Media upload failed — the storage service may be over quota or temporarily "
    "unavailable. Please try again shortly."
)


def save_with_storage_guard(serializer, **kwargs):
    """Save ``serializer``, turning media-storage failures into a clean 400."""
    try:
        return serializer.save(**kwargs)
    except STORAGE_ERRORS as exc:
        logger.error("Media storage upload failed: %s", exc, exc_info=True)
        raise ValidationError({"detail": UPLOAD_FAILED_MESSAGE})
