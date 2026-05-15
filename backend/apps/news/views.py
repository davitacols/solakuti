from django.db.models import Count, F, Q
from django.utils import timezone
from rest_framework import decorators, filters, generics, permissions, status, viewsets

from apps.news.filters import ArticleFilter
from apps.news.models import Article, Comment
from apps.news.serializers import ArticleDetailSerializer, ArticleListSerializer, ArticleWriteSerializer, CommentSerializer
from apps.analytics.models import ArticleView
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
            .annotate(comments_count=Count("comments", filter=Q(comments__is_approved=True)))
        )
        if self.request.user.is_authenticated and self.request.user.role in {"admin", "editor", "journalist"}:
            return queryset
        return queryset.filter(is_published=True)

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
                ip_address=self._get_client_ip(request),
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
        queryset = self.get_queryset().filter(published_at__gte=since).order_by("-views_count", "-published_at")
        return self._article_collection(queryset, "Trending articles fetched successfully.")

    @decorators.action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def latest(self, request):
        return self._article_collection(self.get_queryset().order_by("-published_at"), "Latest articles fetched successfully.")

    def _article_collection(self, queryset, message):
        page = self.paginate_queryset(queryset)
        serializer = ArticleListSerializer(page or queryset, many=True, context={"request": self.request})
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return api_response(serializer.data, message=message)

    @staticmethod
    def _get_client_ip(request):
        forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")


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
            message="Comment submitted successfully and may require moderation.",
            status_code=status.HTTP_201_CREATED,
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
        queryset = Article.objects.filter(is_published=True).select_related("category", "author").prefetch_related("tags")
        if not query:
            return queryset.none()
        return queryset.filter(
            Q(title__icontains=query)
            | Q(excerpt__icontains=query)
            | Q(content__icontains=query)
            | Q(category__name__icontains=query)
            | Q(tags__name__icontains=query)
        ).distinct()
