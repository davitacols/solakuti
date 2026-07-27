"""Copy existing Cloudinary-hosted media to Cloudflare R2.

Downloads each asset from its original Cloudinary delivery URL, uploads the
bytes to the active default storage (R2 once MEDIA_PROVIDER=r2), and rewrites
the model's file field to the new R2 key.

Run AFTER setting MEDIA_PROVIDER=r2 and the R2_* env vars, e.g.:

    python manage.py migrate_media_to_r2 --dry-run
    python manage.py migrate_media_to_r2

Re-runnable: assets already present in R2 are skipped.
"""

import mimetypes
from urllib.parse import urlparse

import cloudinary
import requests
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand, CommandError

from apps.media.models import MediaAsset
from apps.news.models import Article

CONTENT_TYPE_EXT = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
}


class Command(BaseCommand):
    help = "Migrate existing Cloudinary media to Cloudflare R2."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="List what would be migrated without uploading or saving.",
        )

    def handle(self, *args, **options):
        if settings.MEDIA_PROVIDER not in {"r2", "local"}:
            raise CommandError(
                "MEDIA_PROVIDER must be 'r2' or 'local' to migrate off Cloudinary. "
                "Set it (and any R2_* vars) before running this command."
            )

        self.dry_run = options["dry_run"]
        if self.dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN — no files will be uploaded.\n"))

        migrated = skipped = failed = 0

        # MediaAsset.file (images + videos in the media library)
        for asset in MediaAsset.objects.all().iterator():
            result = self._migrate_field(
                obj=asset,
                field_name="file",
                resource_type="video" if asset.asset_type == MediaAsset.AssetType.VIDEO else "image",
                label=f"MediaAsset#{asset.pk} {asset.title}",
            )
            migrated += result == "migrated"
            skipped += result == "skipped"
            failed += result == "failed"

        # Article image/video fields
        for article in Article.objects.all().iterator():
            for field_name, resource_type in (
                ("featured_image", "image"),
                ("og_image", "image"),
                ("featured_video", "video"),
            ):
                result = self._migrate_field(
                    obj=article,
                    field_name=field_name,
                    resource_type=resource_type,
                    label=f"Article#{article.pk} {field_name}",
                )
                migrated += result == "migrated"
                skipped += result == "skipped"
                failed += result == "failed"

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"Done. migrated={migrated} skipped={skipped} failed={failed}"
            )
        )

    def _migrate_field(self, obj, field_name, resource_type, label):
        field = getattr(obj, field_name)
        if not field:
            return "skipped"

        name = str(field.name or field)
        if not name:
            return "skipped"

        # Already an R2 key we put there before? Skip if it exists in R2.
        try:
            if default_storage.exists(name):
                self.stdout.write(f"  · skip (already on R2): {label}")
                return "skipped"
        except Exception:
            pass

        # Build the original Cloudinary delivery URL for the stored public id.
        try:
            source_url = cloudinary.CloudinaryResource(name, resource_type=resource_type).build_url()
        except Exception as exc:
            self.stderr.write(self.style.ERROR(f"  ✗ {label}: cannot build Cloudinary URL ({exc})"))
            return "failed"

        try:
            response = requests.get(source_url, timeout=60)
            response.raise_for_status()
        except Exception as exc:
            self.stderr.write(self.style.ERROR(f"  ✗ {label}: download failed ({exc})"))
            return "failed"

        content_type = response.headers.get("Content-Type", "").split(";")[0].strip()
        new_key = self._build_key(name, content_type)

        if self.dry_run:
            self.stdout.write(f"  → would migrate {label}: {name} -> {new_key}")
            return "migrated"

        try:
            saved_name = default_storage.save(new_key, ContentFile(response.content))
        except Exception as exc:
            self.stderr.write(self.style.ERROR(f"  ✗ {label}: R2 upload failed ({exc})"))
            return "failed"

        setattr(obj, field_name, saved_name)
        obj.save(update_fields=[field_name])
        self.stdout.write(self.style.SUCCESS(f"  ✓ {label}: {saved_name}"))
        return "migrated"

    @staticmethod
    def _build_key(name, content_type):
        """Preserve the Cloudinary path, ensuring a sensible file extension."""
        path = urlparse(name).path if name.startswith("http") else name
        path = path.lstrip("/")
        if "." in path.rsplit("/", 1)[-1]:
            return path
        ext = CONTENT_TYPE_EXT.get(content_type) or mimetypes.guess_extension(content_type or "") or ".jpg"
        return f"{path}{ext}"
