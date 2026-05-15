from django.contrib import admin

from apps.analytics.models import ArticleView


@admin.register(ArticleView)
class ArticleViewAdmin(admin.ModelAdmin):
    list_display = ["article", "user", "ip_address", "viewed_at"]
    list_filter = ["viewed_at"]
    search_fields = ["article__title", "user__email", "ip_address", "user_agent"]
    readonly_fields = ["article", "user", "ip_address", "user_agent", "viewed_at"]
