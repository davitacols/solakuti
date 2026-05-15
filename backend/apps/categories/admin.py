from django.contrib import admin
from django.utils.html import format_html

from apps.categories.models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "articles_count", "created_at", "image_preview"]
    search_fields = ["name", "description", "slug"]
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ["created_at", "image_preview"]

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related("articles")

    def articles_count(self, obj):
        return obj.articles.count()

    def image_preview(self, obj):
        if obj.featured_image:
            return format_html('<img src="{}" style="width:100px;height:68px;object-fit:cover;border-radius:6px;" />', obj.featured_image.url)
        return "No image"
