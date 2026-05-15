from django.contrib import admin

from apps.analytics.models import ArticleView, NewsletterSubscription


@admin.register(ArticleView)
class ArticleViewAdmin(admin.ModelAdmin):
    list_display = ["article", "user", "ip_address", "viewed_at"]
    list_filter = ["viewed_at"]
    search_fields = ["article__title", "user__email", "ip_address"]
    autocomplete_fields = ["article", "user"]
    date_hierarchy = "viewed_at"


@admin.register(NewsletterSubscription)
class NewsletterSubscriptionAdmin(admin.ModelAdmin):
    list_display = ["email", "source", "is_active", "created_at"]
    list_filter = ["is_active", "source", "created_at"]
    search_fields = ["email", "source"]
    date_hierarchy = "created_at"
