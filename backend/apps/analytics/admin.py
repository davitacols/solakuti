from django.contrib import admin

from apps.analytics.models import ActivityLog, ArticleView, LoginAttempt, NewsletterSubscription


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


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ["action", "object_type", "description", "user", "ip_address", "created_at"]
    list_filter = ["action", "object_type", "created_at"]
    search_fields = ["description", "object_type", "object_id", "user__email", "user__full_name"]
    readonly_fields = ["user", "action", "object_type", "object_id", "description", "metadata", "ip_address", "created_at"]
    date_hierarchy = "created_at"


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    list_display = ["email", "user", "success", "ip_address", "created_at"]
    list_filter = ["success", "created_at"]
    search_fields = ["email", "user__email", "user__full_name", "ip_address"]
    readonly_fields = ["email", "user", "success", "ip_address", "user_agent", "created_at"]
    date_hierarchy = "created_at"
