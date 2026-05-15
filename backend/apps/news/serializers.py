from rest_framework import serializers
from drf_spectacular.utils import OpenApiTypes, extend_schema_field

from apps.accounts.serializers import UserSerializer
from apps.categories.serializers import CategorySerializer
from apps.news.models import Article, Comment, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "slug"]
        read_only_fields = ["id", "slug"]


class ArticleListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    author = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    featured_image_url = serializers.SerializerMethodField()
    og_image_url = serializers.SerializerMethodField()
    views_count = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "featured_image_url",
            "category",
            "author",
            "tags",
            "is_featured",
            "is_breaking",
            "is_published",
            "editorial_status",
            "views_count",
            "reading_time",
            "seo_title",
            "seo_description",
            "canonical_url",
            "og_image_url",
            "published_at",
        ]

    @extend_schema_field(OpenApiTypes.URI)
    def get_featured_image_url(self, obj):
        if obj.featured_image:
            return obj.featured_image.url
        return None

    @extend_schema_field(OpenApiTypes.URI)
    def get_og_image_url(self, obj):
        if obj.og_image:
            return obj.og_image.url
        return None

    @extend_schema_field(OpenApiTypes.INT)
    def get_views_count(self, obj):
        real_views = getattr(obj, "real_views_count", None)
        if real_views is not None:
            return real_views
        return obj.view_events.count()


class ArticleDetailSerializer(ArticleListSerializer):
    comments_count = serializers.IntegerField(read_only=True)

    class Meta(ArticleListSerializer.Meta):
        fields = ArticleListSerializer.Meta.fields + [
            "content",
            "comments_count",
            "created_at",
            "updated_at",
        ]


class ArticleWriteSerializer(serializers.ModelSerializer):
    tag_names = serializers.CharField(required=False, allow_blank=True, write_only=True)

    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        source="tags",
        many=True,
        required=False,
        write_only=True,
    )

    class Meta:
        model = Article
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "content",
            "featured_image",
            "og_image",
            "category",
            "tag_ids",
            "tag_names",
            "is_featured",
            "is_breaking",
            "is_published",
            "editorial_status",
            "seo_title",
            "seo_description",
            "canonical_url",
            "published_at",
        ]
        read_only_fields = ["id", "slug"]

    def _resolve_tags(self, tag_names):
        tags = []
        for raw_name in (tag_names or "").split(","):
            name = raw_name.strip()
            if not name:
                continue
            tag, _created = Tag.objects.get_or_create(name=name)
            tags.append(tag)
        return tags

    def validate(self, attrs):
        if attrs.get("is_published"):
            attrs["editorial_status"] = Article.EditorialStatus.PUBLISHED
        return attrs

    def create(self, validated_data):
        tags = validated_data.pop("tags", [])
        tag_names = validated_data.pop("tag_names", "")
        if tag_names:
            tags = self._resolve_tags(tag_names)
        validated_data["author"] = self.context["request"].user
        article = Article.objects.create(**validated_data)
        article.tags.set(tags)
        return article

    def update(self, instance, validated_data):
        tags = validated_data.pop("tags", None)
        tag_names = validated_data.pop("tag_names", None)
        if tag_names is not None:
            tags = self._resolve_tags(tag_names)
        article = super().update(instance, validated_data)
        if tags is not None:
            article.tags.set(tags)
        return article


class CommentReplySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "user", "parent", "content", "created_at", "is_approved"]


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    article_slug = serializers.CharField(source="article.slug", read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "article",
            "article_slug",
            "user",
            "parent",
            "content",
            "created_at",
            "is_approved",
            "replies",
        ]
        read_only_fields = ["id", "user", "created_at", "is_approved", "replies", "article_slug"]

    @extend_schema_field(CommentReplySerializer(many=True))
    def get_replies(self, obj):
        replies = obj.replies.filter(is_approved=True).select_related("user")
        return CommentReplySerializer(replies, many=True, context=self.context).data

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        user = validated_data["user"]
        if user.role in {"admin", "editor", "journalist"}:
            validated_data["is_approved"] = True
        return super().create(validated_data)
