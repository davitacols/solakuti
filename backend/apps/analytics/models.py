from django.conf import settings
from django.db import models


class ArticleView(models.Model):
    article = models.ForeignKey("news.Article", on_delete=models.CASCADE, related_name="view_events")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="article_views")
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.CharField(max_length=500, blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-viewed_at"]
        indexes = [
            models.Index(fields=["article", "-viewed_at"]),
            models.Index(fields=["-viewed_at"]),
        ]

    def __str__(self):
        return f"{self.article} viewed at {self.viewed_at}"


class NewsletterSubscription(models.Model):
    email = models.EmailField(unique=True)
    source = models.CharField(max_length=80, default="website")
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["is_active", "-created_at"], name="analytics_n_is_acti_eb660f_idx"),
        ]

    def __str__(self):
        return self.email
