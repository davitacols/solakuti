from django.db.models import Count
from django.utils import timezone
from rest_framework import decorators, permissions, viewsets

from apps.categories.models import Category
from apps.categories.serializers import CategorySerializer
from apps.categories.defaults import ensure_default_categories
from apps.analytics.models import ActivityLog
from apps.analytics.utils import log_activity
from apps.news.serializers import ArticleListSerializer
from core.permissions import IsEditorialStaffOrReadOnly
from core.responses import ApiResponseMixin, api_response


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

    @decorators.action(detail=True, methods=["get"], permission_classes=[permissions.AllowAny])
    def articles(self, request, slug=None):
        category = self.get_object()
        queryset = (
            category.articles.filter(is_published=True, published_at__lte=timezone.now())
            .select_related("category", "author")
            .prefetch_related("tags")
            .annotate(real_views_count=Count("view_events", distinct=True))
        )
        page = self.paginate_queryset(queryset)
        serializer = ArticleListSerializer(page or queryset, many=True, context={"request": request})
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return api_response(serializer.data, message="Category articles fetched successfully.")

    def perform_create(self, serializer):
        category = serializer.save()
        log_activity(self.request, ActivityLog.Action.CREATED, "category", f"Created category: {category.name}", object_id=category.pk)

    def perform_update(self, serializer):
        category = serializer.save()
        log_activity(self.request, ActivityLog.Action.UPDATED, "category", f"Updated category: {category.name}", object_id=category.pk)

    def perform_destroy(self, instance):
        log_activity(self.request, ActivityLog.Action.DELETED, "category", f"Deleted category: {instance.name}", object_id=instance.pk)
        instance.delete()
