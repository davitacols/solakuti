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
            "views_count",
            "reading_time",
            "published_at",
        ]

    @extend_schema_field(OpenApiTypes.URI)
    def get_featured_image_url(self, obj):
        if obj.featured_image:
            return obj.featured_image.url
        return None


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
            "category",
            "tag_ids",
            "is_featured",
            "is_breaking",
            "is_published",
            "published_at",
        ]
        read_only_fields = ["id", "slug"]

    def create(self, validated_data):
        tags = validated_data.pop("tags", [])
        validated_data["author"] = self.context["request"].user
        article = Article.objects.create(**validated_data)
        article.tags.set(tags)
        return article

    def update(self, instance, validated_data):
        tags = validated_data.pop("tags", None)
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
