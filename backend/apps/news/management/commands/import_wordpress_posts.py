import html
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from apps.categories.models import Category
from apps.news.models import Article, Tag


class Command(BaseCommand):
    help = "Import published posts from a WordPress REST API into Solakuti."

    def add_arguments(self, parser):
        parser.add_argument("--source", required=True, help="WordPress site base URL, for example https://solakuti.com")
        parser.add_argument("--limit", type=int, default=100, help="Maximum number of posts to import.")
        parser.add_argument("--author-email", default="desk@solakuti.com", help="Author email for imported posts.")
        parser.add_argument("--author-name", default="Solakuti News Desk", help="Author name for imported posts.")
        parser.add_argument("--download-images", action="store_true", help="Download featured images into configured storage.")
        parser.add_argument("--dry-run", action="store_true", help="Preview import without writing to the database.")

    def handle(self, *args, **options):
        source = options["source"].rstrip("/")
        limit = max(1, options["limit"])
        api_base = urljoin(f"{source}/", "wp-json/wp/v2/")
        session = requests.Session()
        session.headers.update({"User-Agent": "SolakutiRecoveryImporter/1.0"})

        categories = self.fetch_all(session, urljoin(api_base, "categories"), limit=500)
        category_by_id = {
            item["id"]: html.unescape(item.get("name") or "General News")
            for item in categories
            if item.get("id")
        }

        User = get_user_model()
        author = None
        if not options["dry_run"]:
            author, _ = User.objects.get_or_create(
                email=options["author_email"],
                defaults={
                    "full_name": options["author_name"],
                    "role": "editor",
                    "is_verified": True,
                    "is_staff": True,
                },
            )

        imported = 0
        updated = 0
        skipped = 0
        page = 1

        while imported + updated + skipped < limit:
            posts = self.fetch_page(
                session,
                urljoin(api_base, "posts"),
                params={"per_page": min(100, limit), "page": page, "_embed": "1", "status": "publish"},
            )
            if not posts:
                break

            for post in posts:
                if imported + updated + skipped >= limit:
                    break

                payload = self.build_payload(post, category_by_id)
                if not payload["title"] or not payload["content"]:
                    skipped += 1
                    continue

                if options["dry_run"]:
                    self.stdout.write(f"Would import: {payload['title']}")
                    imported += 1
                    continue

                category, _ = Category.objects.get_or_create(
                    name=payload["category_name"],
                    defaults={"description": f"{payload['category_name']} news and analysis."},
                )
                article, created = Article.objects.update_or_create(
                    slug=payload["slug"],
                    defaults={
                        "title": payload["title"],
                        "excerpt": payload["excerpt"],
                        "content": payload["content"],
                        "category": category,
                        "author": author,
                        "is_published": True,
                        "editorial_status": Article.EditorialStatus.PUBLISHED,
                        "published_at": payload["published_at"],
                        "canonical_url": payload["canonical_url"],
                        "seo_title": payload["title"][:255],
                        "seo_description": payload["excerpt"][:320],
                    },
                )
                article.tags.set(self.resolve_tags(payload["tags"]))
                if options["download_images"] and payload["featured_image_url"] and not article.featured_image:
                    self.attach_featured_image(session, article, payload["featured_image_url"])
                imported += int(created)
                updated += int(not created)

            page += 1

        self.stdout.write(self.style.SUCCESS("WordPress import complete."))
        self.stdout.write(f"Imported: {imported}")
        self.stdout.write(f"Updated: {updated}")
        self.stdout.write(f"Skipped: {skipped}")

    def fetch_all(self, session, url, limit):
        items = []
        page = 1
        while len(items) < limit:
            page_items = self.fetch_page(session, url, params={"per_page": min(100, limit), "page": page})
            if not page_items:
                break
            items.extend(page_items)
            page += 1
        return items[:limit]

    def fetch_page(self, session, url, params):
        try:
            response = session.get(url, params=params, timeout=30)
        except requests.RequestException as exc:
            raise CommandError(f"Could not reach WordPress API at {url}: {exc}") from exc
        if response.status_code == 400 and "rest_post_invalid_page_number" in response.text:
            return []
        if response.status_code == 404:
            raise CommandError(f"WordPress REST API not found at {url}. Check the source URL.")
        response.raise_for_status()
        return response.json()

    def build_payload(self, post, category_by_id):
        title = self.clean_text(post.get("title", {}).get("rendered", ""))
        content = post.get("content", {}).get("rendered", "").strip()
        excerpt = self.clean_text(post.get("excerpt", {}).get("rendered", ""))[:420]
        if not excerpt:
            excerpt = self.clean_text(content)[:420]
        published_at = parse_datetime(post.get("date_gmt") or "") or parse_datetime(post.get("date") or "") or timezone.now()
        if timezone.is_naive(published_at):
            published_at = timezone.make_aware(published_at)
        category_ids = post.get("categories") or []
        category_name = next((category_by_id.get(category_id) for category_id in category_ids if category_by_id.get(category_id)), "General News")
        embedded_media = post.get("_embedded", {}).get("wp:featuredmedia", [{}])
        featured_image_url = embedded_media[0].get("source_url") if embedded_media else ""

        return {
            "title": title,
            "slug": post.get("slug") or "",
            "excerpt": excerpt,
            "content": content,
            "category_name": category_name,
            "published_at": published_at,
            "canonical_url": post.get("link") or "",
            "featured_image_url": featured_image_url or "",
            "tags": [self.clean_text(tag.get("name", "")) for tag in post.get("_embedded", {}).get("wp:term", [[]])[-1] if tag.get("name")],
        }

    def clean_text(self, value):
        value = re.sub(r"<[^>]+>", " ", value or "")
        return html.unescape(re.sub(r"\s+", " ", value)).strip()

    def resolve_tags(self, names):
        tags = []
        for name in names:
            if name:
                tag, _ = Tag.objects.get_or_create(name=name[:80])
                tags.append(tag)
        return tags

    def attach_featured_image(self, session, article, image_url):
        try:
            response = session.get(image_url, timeout=30)
            response.raise_for_status()
        except requests.RequestException:
            return
        parsed = urlparse(image_url)
        filename = Path(parsed.path).name or f"{article.slug}.jpg"
        article.featured_image.save(filename, ContentFile(response.content), save=True)
