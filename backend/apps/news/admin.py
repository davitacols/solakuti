from django.contrib import admin
from django.utils.html import format_html

from apps.news.models import Article, ArticleRevision, Comment, Tag


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    search_fields = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    fields = ["user", "content", "is_approved", "created_at"]
    readonly_fields = ["created_at"]


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "category",
        "author",
        "is_featured",
        "is_breaking",
        "is_published",
        "editorial_status",
        "views_count",
        "reading_time",
        "published_at",
        "image_preview",
    ]
    list_filter = ["category", "editorial_status", "is_featured", "is_breaking", "is_published", "published_at"]
    search_fields = ["title", "excerpt", "content", "tags__name", "author__email"]
    autocomplete_fields = ["author", "category", "tags"]
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ["views_count", "reading_time", "created_at", "updated_at", "image_preview"]
    date_hierarchy = "published_at"
    inlines = [CommentInline]
    fieldsets = (
        ("Story", {"fields": ("title", "slug", "excerpt", "content", "featured_image", "image_preview")}),
        ("Editorial", {"fields": ("category", "author", "tags", "editorial_status", "is_featured", "is_breaking", "is_published")}),
        ("SEO", {"fields": ("seo_title", "seo_description", "canonical_url", "og_image")}),
        ("Performance", {"fields": ("views_count", "reading_time")}),
        ("Dates", {"fields": ("published_at", "created_at", "updated_at")}),
    )

    def image_preview(self, obj):
        if obj.featured_image:
            return format_html('<img src="{}" style="width:120px;height:70px;object-fit:cover;border-radius:6px;" />', obj.featured_image.url)
        return "No image"


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ["article", "user", "parent", "is_approved", "created_at"]
    list_filter = ["is_approved", "created_at"]
    search_fields = ["content", "article__title", "user__email"]
    autocomplete_fields = ["article", "user", "parent"]
    actions = ["approve_comments"]

    @admin.action(description="Approve selected comments")
    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)


@admin.register(ArticleRevision)
class ArticleRevisionAdmin(admin.ModelAdmin):
    list_display = ["article", "created_by", "editorial_status", "note", "created_at"]
    list_filter = ["editorial_status", "created_at"]
    search_fields = ["article__title", "created_by__email", "title", "note"]
    readonly_fields = ["article", "created_by", "title", "excerpt", "content", "editorial_status", "is_featured", "is_breaking", "is_published", "published_at", "note", "created_at"]
    autocomplete_fields = ["article", "created_by"]
    date_hierarchy = "created_at"
