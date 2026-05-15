from django.db.models import Count
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status, views

from apps.categories.models import Category
from apps.news.models import Article, Comment
from apps.news.serializers import ArticleListSerializer
from apps.analytics.models import ArticleView, NewsletterSubscription
from apps.analytics.serializers import AnalyticsOverviewSerializer, NewsletterSubscriptionSerializer
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
            .annotate(real_views_count=Count("view_events", distinct=True))
            .order_by("-real_views_count", "-published_at")[:5]
        )
        categories = (
            Category.objects.annotate(
                articles_count=Count("articles", distinct=True),
                views_count=Count("articles__view_events", distinct=True),
            )
            .order_by("-views_count")[:5]
            .values("id", "name", "slug", "articles_count", "views_count")
        )

        data = {
            "total_articles": Article.objects.count(),
            "total_views": ArticleView.objects.count(),
            "today_views": ArticleView.objects.filter(viewed_at__date=timezone.localdate()).count(),
            "total_comments": Comment.objects.count(),
            "total_newsletter_subscribers": NewsletterSubscription.objects.filter(is_active=True).count(),
            "trending_articles": ArticleListSerializer(trending, many=True, context={"request": request}).data,
            "popular_categories": list(categories),
        }
        return api_response(data, message="Analytics overview fetched successfully.")


class NewsletterSubscriptionView(views.APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = NewsletterSubscriptionSerializer

    @extend_schema(request=NewsletterSubscriptionSerializer, responses=NewsletterSubscriptionSerializer)
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower()
        source = serializer.validated_data.get("source", "website")
        subscription, created = NewsletterSubscription.objects.update_or_create(
            email=email,
            defaults={"source": source, "is_active": True},
        )
        response = self.serializer_class(subscription)
        return api_response(
            response.data,
            message="Subscription saved successfully." if created else "You are already subscribed.",
            status_code=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )
