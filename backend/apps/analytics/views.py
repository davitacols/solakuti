import csv

from django.db.models import Count, Q
from django.http import HttpResponse
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status, views

from apps.categories.models import Category
from apps.news.models import Article, Comment
from apps.news.query import public_article_q
from apps.news.serializers import ArticleListSerializer
from apps.analytics.models import ActivityLog, ArticleView, LoginAttempt, NewsletterSubscription
from apps.analytics.serializers import (
    ActivityLogSerializer,
    AnalyticsOverviewSerializer,
    LoginAttemptSerializer,
    NewsletterSubscriptionSerializer,
    NewsletterUnsubscribeSerializer,
)
from core.pagination import StandardResultsSetPagination
from core.responses import api_response


class AnalyticsOverviewView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses=AnalyticsOverviewSerializer)
    def get(self, request):
        if request.user.role not in {"admin", "editor"}:
            return api_response(None, message="You do not have permission to view analytics.", success=False, status_code=403)

        now = timezone.now()
        public_filter = public_article_q(now)
        category_public_filter = public_article_q(now, "articles__")
        view_public_filter = public_article_q(now, "article__")
        public_articles = Article.objects.filter(public_filter)
        trending = (
            public_articles
            .select_related("category", "author")
            .prefetch_related("tags")
            .annotate(real_views_count=Count("view_events", distinct=True))
            .order_by("-real_views_count", "-published_at")[:5]
        )
        categories = (
            Category.objects.annotate(
                articles_count=Count(
                    "articles",
                    filter=category_public_filter,
                    distinct=True,
                ),
                views_count=Count(
                    "articles__view_events",
                    filter=category_public_filter,
                    distinct=True,
                ),
            )
            .filter(articles_count__gt=0)
            .order_by("-views_count")[:5]
            .values("id", "name", "slug", "articles_count", "views_count")
        )
        article_performance = (
            public_articles
            .select_related("category")
            .annotate(
                real_views_count=Count("view_events", distinct=True),
                today_views_count=Count(
                    "view_events",
                    filter=Q(view_events__viewed_at__date=timezone.localdate()),
                    distinct=True,
                ),
                live_comments_count=Count("comments", filter=Q(comments__is_approved=True), distinct=True),
            )
            .order_by("-real_views_count", "-today_views_count", "-published_at")[:12]
        )
        article_performance_data = [
            {
                "id": article.id,
                "title": article.title,
                "slug": article.slug,
                "category": article.category.name,
                "views_count": article.real_views_count,
                "today_views": article.today_views_count,
                "comments_count": article.live_comments_count,
                "published_at": article.published_at,
            }
            for article in article_performance
        ]
        live_views = ArticleView.objects.filter(view_public_filter)
        live_comments = Comment.objects.filter(view_public_filter, is_approved=True)

        data = {
            "total_articles": public_articles.count(),
            "total_views": live_views.count(),
            "today_views": live_views.filter(viewed_at__date=timezone.localdate()).count(),
            "total_comments": live_comments.count(),
            "total_newsletter_subscribers": NewsletterSubscription.objects.filter(is_active=True).count(),
            "trending_articles": ArticleListSerializer(trending, many=True, context={"request": request}).data,
            "article_performance": article_performance_data,
            "popular_categories": list(categories),
            "recent_activity": ActivityLogSerializer(ActivityLog.objects.select_related("user")[:12], many=True).data,
            "recent_login_attempts": LoginAttemptSerializer(LoginAttempt.objects.select_related("user")[:8], many=True).data,
            "last_updated": now.isoformat(),
            "source": "live_api",
        }
        return api_response(data, message="Analytics overview fetched successfully.")


class NewsletterSubscriptionView(views.APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = NewsletterSubscriptionSerializer
    throttle_scope = "newsletter"

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


class NewsletterUnsubscribeView(views.APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = NewsletterUnsubscribeSerializer
    throttle_scope = "newsletter"

    @extend_schema(request=NewsletterUnsubscribeSerializer, responses=NewsletterSubscriptionSerializer)
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        subscription = NewsletterSubscription.objects.filter(email=serializer.validated_data["email"]).first()
        if subscription:
            subscription.is_active = False
            subscription.save(update_fields=["is_active"])
        return api_response(None, message="You have been unsubscribed if this email was on our list.")


class NewsletterSubscriberListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        if request.user.role not in {"admin", "editor"}:
            return api_response(None, message="You do not have permission to view subscribers.", success=False, status_code=403)

        queryset = NewsletterSubscription.objects.order_by("-created_at")
        if request.query_params.get("include_inactive") != "true":
            queryset = queryset.filter(is_active=True)
        search = request.query_params.get("search")
        if search:
            queryset = queryset.filter(email__icontains=search.strip())

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = NewsletterSubscriptionSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class NewsletterSubscriberDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role not in {"admin", "editor"}:
            return api_response(None, message="You do not have permission to update subscribers.", success=False, status_code=403)

        subscription = NewsletterSubscription.objects.filter(pk=pk).first()
        if not subscription:
            return api_response(None, message="Subscriber not found.", success=False, status_code=404)

        is_active = request.data.get("is_active", subscription.is_active)
        if isinstance(is_active, str):
            is_active = is_active.lower() in {"1", "true", "yes", "active"}
        subscription.is_active = bool(is_active)
        subscription.save(update_fields=["is_active"])
        return api_response(NewsletterSubscriptionSerializer(subscription).data, message="Subscriber updated successfully.")

    def delete(self, request, pk):
        if request.user.role not in {"admin", "editor"}:
            return api_response(None, message="You do not have permission to update subscribers.", success=False, status_code=403)

        subscription = NewsletterSubscription.objects.filter(pk=pk).first()
        if not subscription:
            return api_response(None, message="Subscriber not found.", success=False, status_code=404)

        subscription.is_active = False
        subscription.save(update_fields=["is_active"])
        return api_response(None, message="Subscriber deactivated successfully.")


class NewsletterExportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in {"admin", "editor"}:
            return api_response(None, message="You do not have permission to export subscribers.", success=False, status_code=403)

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="solakuti-newsletter-subscribers.csv"'
        writer = csv.writer(response)
        writer.writerow(["email", "source", "is_active", "created_at"])
        for subscriber in NewsletterSubscription.objects.order_by("-created_at"):
            writer.writerow([subscriber.email, subscriber.source, subscriber.is_active, subscriber.created_at.isoformat()])
        return response
