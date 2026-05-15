from django.db.models import Count, Sum
from drf_spectacular.utils import extend_schema
from rest_framework import permissions, views

from apps.categories.models import Category
from apps.news.models import Article, Comment
from apps.news.serializers import ArticleListSerializer
from apps.analytics.serializers import AnalyticsOverviewSerializer
from core.responses import api_response


class AnalyticsOverviewView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses=AnalyticsOverviewSerializer)
    def get(self, request):
        if request.user.role not in {"admin", "editor"}:
            return api_response(None, message="You do not have permission to view analytics.", success=False, status_code=403)

        trending = (
            Article.objects.filter(is_published=True)
            .select_related("category", "author")
            .prefetch_related("tags")
            .order_by("-views_count")[:5]
        )
        categories = (
            Category.objects.annotate(
                articles_count=Count("articles", distinct=True),
                views_count=Sum("articles__views_count"),
            )
            .order_by("-views_count")[:5]
            .values("id", "name", "slug", "articles_count", "views_count")
        )

        data = {
            "total_articles": Article.objects.count(),
            "total_views": Article.objects.aggregate(total=Sum("views_count"))["total"] or 0,
            "total_comments": Comment.objects.count(),
            "trending_articles": ArticleListSerializer(trending, many=True, context={"request": request}).data,
            "popular_categories": list(categories),
        }
        return api_response(data, message="Analytics overview fetched successfully.")
