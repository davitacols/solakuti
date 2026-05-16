import math
import re

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class Tag(models.Model):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)

    class Meta:
        ordering = ["name"]
        indexes = [models.Index(fields=["slug"])]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Article(models.Model):
    class EditorialStatus(models.TextChoices):
        DRAFT = "draft", "Draft"
        REVIEW = "review", "In Review"
        PUBLISHED = "published", "Published"

    title = models.CharField(max_length=240)
    slug = models.SlugField(max_length=270, unique=True, blank=True)
    excerpt = models.TextField(max_length=420)
    content = models.TextField()
    featured_image = models.ImageField(upload_to="articles/", blank=True, null=True)
    category = models.ForeignKey("categories.Category", on_delete=models.PROTECT, related_name="articles")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="articles")
    tags = models.ManyToManyField(Tag, related_name="articles", blank=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    is_breaking = models.BooleanField(default=False, db_index=True)
    is_published = models.BooleanField(default=False, db_index=True)
    editorial_status = models.CharField(
        max_length=20,
        choices=EditorialStatus.choices,
        default=EditorialStatus.DRAFT,
        db_index=True,
    )
    views_count = models.PositiveIntegerField(default=0, db_index=True)
    reading_time = models.PositiveIntegerField(default=1)
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.CharField(max_length=320, blank=True)
    canonical_url = models.URLField(blank=True)
    og_image = models.ImageField(upload_to="articles/og/", blank=True, null=True)
    published_at = models.DateTimeField(blank=True, null=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["is_published", "-published_at"]),
            models.Index(fields=["is_featured", "is_published"]),
            models.Index(fields=["is_breaking", "is_published"]),
            models.Index(fields=["-views_count"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._generate_unique_slug()
        self.reading_time = self.calculate_reading_time()
        if self.editorial_status == self.EditorialStatus.PUBLISHED:
            self.is_published = True
        elif self.editorial_status in {self.EditorialStatus.DRAFT, self.EditorialStatus.REVIEW}:
            self.is_published = False
        elif self.is_published:
            self.editorial_status = self.EditorialStatus.PUBLISHED
        if self.is_published and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

    def _generate_unique_slug(self):
        base_slug = slugify(self.title)[:240]
        slug = base_slug
        counter = 2
        while Article.objects.filter(slug=slug).exclude(pk=self.pk).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug

    def calculate_reading_time(self):
        words = re.findall(r"\w+", self.content or "")
        return max(1, math.ceil(len(words) / 220))

    def __str__(self):
        return self.title


class ArticleRevision(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name="revisions")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="article_revisions")
    title = models.CharField(max_length=240)
    excerpt = models.TextField(max_length=420)
    content = models.TextField()
    editorial_status = models.CharField(max_length=20, choices=Article.EditorialStatus.choices)
    is_featured = models.BooleanField(default=False)
    is_breaking = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(blank=True, null=True)
    note = models.CharField(max_length=160, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["article", "-created_at"]),
        ]

    @classmethod
    def capture(cls, article, user=None, note=""):
        return cls.objects.create(
            article=article,
            created_by=user if user and user.is_authenticated else None,
            title=article.title,
            excerpt=article.excerpt,
            content=article.content,
            editorial_status=article.editorial_status,
            is_featured=article.is_featured,
            is_breaking=article.is_breaking,
            is_published=article.is_published,
            published_at=article.published_at,
            note=note,
        )

    def restore_to_article(self):
        self.article.title = self.title
        self.article.excerpt = self.excerpt
        self.article.content = self.content
        self.article.editorial_status = self.editorial_status
        self.article.is_featured = self.is_featured
        self.article.is_breaking = self.is_breaking
        self.article.is_published = self.is_published
        self.article.published_at = self.published_at
        self.article.save()
        return self.article

    def __str__(self):
        return f"{self.article} revision {self.created_at}"


class Comment(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="comments")
    parent = models.ForeignKey("self", on_delete=models.CASCADE, related_name="replies", blank=True, null=True)
    content = models.TextField(max_length=1200)
    created_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["article", "is_approved"]),
            models.Index(fields=["parent"]),
        ]

    def __str__(self):
        return f"Comment by {self.user} on {self.article}"
