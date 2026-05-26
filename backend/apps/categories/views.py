from django.core.cache import cache
from django.db.models import Count
from django.utils import timezone
from rest_framework import decorators, permissions, viewsets

from apps.categories.models import Category
from apps.categories.serializers import CategorySerializer
from apps.categories.defaults import ensure_default_categories
from apps.analytics.models import ActivityLog
from apps.analytics.utils import log_activity
from apps.news.query import public_article_q
from apps.news.serializers import ArticleListSerializer
from core.permissions import IsEditorialStaffOrReadOnly
from core.responses import ApiResponseMixin, api_response


PUBLIC_CATEGORY_CACHE_SECONDS = 300


class CategoryViewSet(ApiResponseMixin, viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsEditorialStaffOrReadOnly]
    lookup_field = "slug"
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]
    success_message = "Categories fetched successfully."

    def get_queryset(self):
        if self.request.method == "GET":
            ensure_default_categories(Category)
        return Category.objects.annotate(articles_count=Count("articles"))

    def list(self, request, *args, **kwargs):
        if request.user.is_authenticated or request.query_params:
            return super().list(request, *args, **kwargs)
        cache_key = "categories:list"
        cached = cache.get(cache_key)
        if cached is not None:
            return api_response(cached, message="Categories fetched successfully.")
        serializer = self.get_serializer(self.filter_queryset(self.get_queryset()), many=True)
        data = serializer.data
        cache.set(cache_key, data, PUBLIC_CATEGORY_CACHE_SECONDS)
        return api_response(data, message="Categories fetched successfully.")

    @decorators.action(detail=True, methods=["get"], permission_classes=[permissions.AllowAny])
    def articles(self, request, slug=None):
        category = self.get_object()
        queryset = (
            category.articles.filter(public_article_q(timezone.now()))
            .select_related("category", "author")
            .prefetch_related("tags")
        )
        cache_key = f"categories:{category.slug}:articles"
        cached = cache.get(cache_key)
        if cached is not None:
            return api_response(cached, message="Category articles fetched successfully.")
        page = self.paginate_queryset(queryset)
        serializer = ArticleListSerializer(page or queryset, many=True, context={"request": request})
        if page is not None:
            response = self.get_paginated_response(serializer.data)
            if isinstance(response.data, dict) and "data" in response.data:
                cache.set(cache_key, response.data["data"], PUBLIC_CATEGORY_CACHE_SECONDS)
            return response
        data = serializer.data
        cache.set(cache_key, data, PUBLIC_CATEGORY_CACHE_SECONDS)
        return api_response(data, message="Category articles fetched successfully.")

    def perform_create(self, serializer):
        category = serializer.save()
        cache.clear()
        log_activity(self.request, ActivityLog.Action.CREATED, "category", f"Created category: {category.name}", object_id=category.pk)

    def perform_update(self, serializer):
        category = serializer.save()
        cache.clear()
        log_activity(self.request, ActivityLog.Action.UPDATED, "category", f"Updated category: {category.name}", object_id=category.pk)

    def perform_destroy(self, instance):
        log_activity(self.request, ActivityLog.Action.DELETED, "category", f"Deleted category: {instance.name}", object_id=instance.pk)
        instance.delete()
        cache.clear()
