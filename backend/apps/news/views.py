from django.db.models import Count, F, Q
from django.utils import timezone
from rest_framework import decorators, filters, generics, permissions, status, viewsets

from apps.news.filters import ArticleFilter
from apps.news.models import Article, ArticleRevision, Comment
from apps.news.serializers import (
    ArticleDetailSerializer,
    ArticleListSerializer,
    ArticleRevisionSerializer,
    ArticleWriteSerializer,
    CommentSerializer,
)
from apps.news.query import public_article_q
from apps.analytics.models import ActivityLog, ArticleView
from apps.analytics.utils import get_client_ip, log_activity
from core.permissions import IsAuthorOrEditor, IsWriterOrReadOnly
from core.responses import ApiResponseMixin, api_response


class ArticleViewSet(ApiResponseMixin, viewsets.ModelViewSet):
    permission_classes = [IsWriterOrReadOnly, IsAuthorOrEditor]
    lookup_field = "slug"
    filterset_class = ArticleFilter
    search_fields = ["title", "excerpt", "content", "category__name", "tags__name"]
    ordering_fields = ["published_at", "created_at", "views_count", "reading_time"]
    ordering = ["-published_at", "-created_at"]
    success_message = "Articles fetched successfully."

    def get_queryset(self):
        queryset = (
            Article.objects.select_related("category", "author")
            .prefetch_related("tags")
            .annotate(
                comments_count=Count("comments", filter=Q(comments__is_approved=True), distinct=True),
                real_views_count=Count("view_events", distinct=True),
            )
        )
        public_filter = public_article_q()
        if self.request.user.is_authenticated and self.request.user.role in {"admin", "editor", "journalist"}:
            return queryset
        if self.request.user.is_authenticated and self.request.user.role == "contributor":
            return queryset.filter(public_filter | Q(author=self.request.user))
        return queryset.filter(public_filter)

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return ArticleWriteSerializer
        if self.action == "retrieve":
            return ArticleDetailSerializer
        return ArticleListSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.is_published:
            Article.objects.filter(pk=instance.pk).update(views_count=F("views_count") + 1)
            ArticleView.objects.create(
                article=instance,
                user=request.user if request.user.is_authenticated else None,
                ip_address=get_client_ip(request),
                user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
            )
            instance.refresh_from_db(fields=["views_count"])
        serializer = self.get_serializer(instance)
        return api_response(serializer.data, message="Article fetched successfully.")

    @decorators.action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def featured(self, request):
        return self._article_collection(self.get_queryset().filter(is_featured=True), "Featured articles fetched successfully.")

    @decorators.action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def breaking(self, request):
        return self._article_collection(self.get_queryset().filter(is_breaking=True), "Breaking news fetched successfully.")

    @decorators.action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def trending(self, request):
        since = timezone.now() - timezone.timedelta(days=7)
        queryset = self.get_queryset().filter(Q(published_at__gte=since) | Q(published_at__isnull=True)).order_by("-real_views_count", "-published_at", "-created_at")
        return self._article_collection(queryset, "Trending articles fetched successfully.")

    @decorators.action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def latest(self, request):
        return self._article_collection(self.get_queryset().order_by("-published_at", "-created_at"), "Latest articles fetched successfully.")

    @decorators.action(detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def revisions(self, request, slug=None):
        article = self.get_object()
        if not self._can_manage_article(request, article):
            return api_response(None, message="You do not have permission to view revisions.", success=False, status_code=403)
        serializer = ArticleRevisionSerializer(article.revisions.select_related("created_by")[:20], many=True)
        return api_response(serializer.data, message="Article revisions fetched successfully.")

    @decorators.action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated], url_path="restore-revision")
    def restore_revision(self, request, slug=None):
        article = self.get_object()
        if not self._can_manage_article(request, article):
            return api_response(None, message="You do not have permission to restore this article.", success=False, status_code=403)
        revision_id = request.data.get("revision_id")
        try:
            revision = article.revisions.get(pk=revision_id)
        except ArticleRevision.DoesNotExist:
            return api_response(None, message="Revision not found.", success=False, status_code=404)

        ArticleRevision.capture(article, request.user, note="Before revision restore")
        restored = revision.restore_to_article()
        log_activity(
            request,
            ActivityLog.Action.RESTORED,
            "article",
            f"Restored article revision: {restored.title}",
            object_id=restored.pk,
            metadata={"slug": restored.slug, "revision_id": revision.pk},
        )
        serializer = ArticleDetailSerializer(restored, context={"request": request})
        return api_response(serializer.data, message="Article revision restored successfully.")

    def perform_create(self, serializer):
        article = serializer.save()
        action = ActivityLog.Action.PUBLISHED if article.is_published else ActivityLog.Action.CREATED
        log_activity(
            self.request,
            action,
            "article",
            f"{'Published' if article.is_published else 'Created'} article: {article.title}",
            object_id=article.pk,
            metadata={"slug": article.slug, "status": article.editorial_status},
        )

    def perform_update(self, serializer):
        article = self.get_object()
        was_published = article.is_published
        ArticleRevision.capture(article, self.request.user, note="Before article update")
        updated = serializer.save()
        action = ActivityLog.Action.PUBLISHED if updated.is_published and not was_published else ActivityLog.Action.UPDATED
        log_activity(
            self.request,
            action,
            "article",
            f"{'Published' if action == ActivityLog.Action.PUBLISHED else 'Updated'} article: {updated.title}",
            object_id=updated.pk,
            metadata={"slug": updated.slug, "status": updated.editorial_status},
        )

    def perform_destroy(self, instance):
        log_activity(
            self.request,
            ActivityLog.Action.DELETED,
            "article",
            f"Deleted article: {instance.title}",
            object_id=instance.pk,
            metadata={"slug": instance.slug},
        )
        instance.delete()

    @decorators.action(detail=False, methods=["delete"], url_path=r"(?P<article_id>[^/.]+)/delete-by-id")
    def delete_by_id(self, request, article_id=None):
        instance = self.get_queryset().filter(pk=article_id).first()
        if not instance:
            return api_response(None, message="Article not found.", success=False, status_code=404)
        self.check_object_permissions(request, instance)
        self.perform_destroy(instance)
        return api_response(None, message="Article deleted successfully.")

    def _article_collection(self, queryset, message):
        page = self.paginate_queryset(queryset)
        serializer = ArticleListSerializer(page or queryset, many=True, context={"request": self.request})
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return api_response(serializer.data, message=message)

    @staticmethod
    def _can_manage_article(request, article):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role in {"admin", "editor"} or article.author_id == request.user.id)
        )


class CommentViewSet(ApiResponseMixin, viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    throttle_scope = "comments"
    filterset_fields = ["article", "is_approved", "parent"]
    ordering_fields = ["created_at"]
    ordering = ["created_at"]
    success_message = "Comments fetched successfully."

    def get_queryset(self):
        queryset = Comment.objects.select_related("article", "user", "parent").prefetch_related("replies__user")
        if self.request.user.is_authenticated and self.request.user.role in {"admin", "editor"}:
            return queryset
        return queryset.filter(is_approved=True, parent__isnull=True)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return api_response(
            serializer.data,
            message="Comment posted successfully.",
            status_code=status.HTTP_201_CREATED,
        )

    def perform_create(self, serializer):
        comment = serializer.save()
        log_activity(
            self.request,
            ActivityLog.Action.CREATED,
            "comment",
            f"Posted comment on: {comment.article.title}",
            object_id=comment.pk,
            metadata={"article_slug": comment.article.slug},
        )

    def update(self, request, *args, **kwargs):
        comment = self.get_object()
        if not self._can_manage_comment(request, comment):
            return api_response(None, message="You do not have permission to update this comment.", success=False, status_code=403)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        comment = self.get_object()
        if not self._can_manage_comment(request, comment):
            return api_response(None, message="You do not have permission to update this comment.", success=False, status_code=403)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        if not self._can_manage_comment(request, comment):
            return api_response(None, message="You do not have permission to delete this comment.", success=False, status_code=403)
        return super().destroy(request, *args, **kwargs)

    def perform_destroy(self, instance):
        log_activity(
            self.request,
            ActivityLog.Action.DELETED,
            "comment",
            f"Deleted comment on: {instance.article.title}",
            object_id=instance.pk,
            metadata={"article_slug": instance.article.slug},
        )
        instance.delete()

    @decorators.action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        if request.user.role not in {"admin", "editor"}:
            return api_response(None, message="You do not have permission to moderate comments.", success=False, status_code=403)
        comment = self.get_object()
        comment.is_approved = True
        comment.save(update_fields=["is_approved"])
        serializer = self.get_serializer(comment)
        return api_response(serializer.data, message="Comment approved successfully.")

    @staticmethod
    def _can_manage_comment(request, comment):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role in {"admin", "editor"} or comment.user_id == request.user.id)
        )


class SearchView(ApiResponseMixin, generics.ListAPIView):
    serializer_class = ArticleListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["published_at", "views_count"]
    ordering = ["-published_at"]
    success_message = "Search results fetched successfully."

    def get_queryset(self):
        query = self.request.query_params.get("q", "").strip()
        queryset = (
            Article.objects.filter(public_article_q())
            .select_related("category", "author")
            .prefetch_related("tags")
            .annotate(real_views_count=Count("view_events", distinct=True))
        )
        if not query:
            return queryset.none()
        return queryset.filter(
            Q(title__icontains=query)
            | Q(excerpt__icontains=query)
            | Q(content__icontains=query)
            | Q(category__name__icontains=query)
            | Q(tags__name__icontains=query)
        ).distinct()
