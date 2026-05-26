import json
import re

from rest_framework import serializers
from drf_spectacular.utils import OpenApiTypes, extend_schema_field

from apps.accounts.serializers import UserSerializer
from apps.categories.serializers import CategorySerializer
from apps.news.models import Article, ArticleRevision, ArticleSportsLink, Comment, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "slug"]
        read_only_fields = ["id", "slug"]


class ArticleSportsLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleSportsLink
        fields = ["id", "target_type", "target_id", "target_slug", "target_name"]
        read_only_fields = ["id"]


class ArticleListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    author = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    featured_image_url = serializers.SerializerMethodField()
    featured_video_url = serializers.SerializerMethodField()
    og_image_url = serializers.SerializerMethodField()
    views_count = serializers.SerializerMethodField()
    sports_links = ArticleSportsLinkSerializer(many=True, read_only=True)

    class Meta:
        model = Article
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "featured_image_url",
            "featured_video_url",
            "featured_media_type",
            "category",
            "author",
            "tags",
            "sports_links",
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
    def get_featured_video_url(self, obj):
        if obj.featured_video:
            return obj.featured_video.url
        return None

    @extend_schema_field(OpenApiTypes.URI)
    def get_og_image_url(self, obj):
        if obj.og_image:
            return obj.og_image.url
        return None

    @extend_schema_field(OpenApiTypes.INT)
    def get_views_count(self, obj):
        return obj.views_count


class ArticleDetailSerializer(ArticleListSerializer):
    comments_count = serializers.SerializerMethodField()

    class Meta(ArticleListSerializer.Meta):
        fields = ArticleListSerializer.Meta.fields + [
            "content",
            "comments_count",
            "created_at",
            "updated_at",
        ]

    @extend_schema_field(OpenApiTypes.INT)
    def get_comments_count(self, obj):
        return obj.comments.filter(is_approved=True).count()


class ArticleRevisionSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = ArticleRevision
        fields = [
            "id",
            "created_by",
            "title",
            "excerpt",
            "content",
            "editorial_status",
            "is_featured",
            "is_breaking",
            "is_published",
            "published_at",
            "note",
            "created_at",
        ]


class ArticleWriteSerializer(serializers.ModelSerializer):
    tag_names = serializers.CharField(required=False, allow_blank=True, write_only=True)
    sports_links = serializers.JSONField(required=False, write_only=True)

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
            "featured_video",
            "featured_media_type",
            "og_image",
            "category",
            "tag_ids",
            "tag_names",
            "sports_links",
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

    def _normalize_sports_links(self, sports_links):
        if sports_links in (None, "", []):
            return []
        if isinstance(sports_links, str):
            try:
                sports_links = json.loads(sports_links)
            except json.JSONDecodeError as exc:
                raise serializers.ValidationError({"sports_links": "Sports links must be valid JSON."}) from exc
        if not isinstance(sports_links, list):
            raise serializers.ValidationError({"sports_links": "Sports links must be a list."})

        normalized = []
        allowed_types = {choice[0] for choice in ArticleSportsLink.TargetType.choices}
        seen = set()
        for link in sports_links:
            if not isinstance(link, dict):
                continue
            target_type = str(link.get("target_type") or link.get("targetType") or "").strip()
            target_id = str(link.get("target_id") or link.get("targetId") or "").strip()
            if target_type not in allowed_types or not target_id:
                continue
            dedupe_key = (target_type, target_id)
            if dedupe_key in seen:
                continue
            seen.add(dedupe_key)
            normalized.append(
                {
                    "target_type": target_type,
                    "target_id": target_id[:120],
                    "target_slug": str(link.get("target_slug") or link.get("targetSlug") or "").strip()[:180],
                    "target_name": str(link.get("target_name") or link.get("targetName") or "").strip()[:180],
                }
            )
        return normalized

    def _replace_sports_links(self, article, sports_links):
        article.sports_links.all().delete()
        links = self._normalize_sports_links(sports_links)
        if not links:
            return
        ArticleSportsLink.objects.bulk_create(
            ArticleSportsLink(article=article, **link)
            for link in links
        )

    def validate(self, attrs):
        if attrs.get("is_published"):
            attrs["editorial_status"] = Article.EditorialStatus.PUBLISHED
        return attrs

    def create(self, validated_data):
        tags = validated_data.pop("tags", [])
        tag_names = validated_data.pop("tag_names", "")
        sports_links = validated_data.pop("sports_links", [])
        if tag_names:
            tags = self._resolve_tags(tag_names)
        validated_data["author"] = self.context["request"].user
        article = Article.objects.create(**validated_data)
        article.tags.set(tags)
        self._replace_sports_links(article, sports_links)
        return article

    def update(self, instance, validated_data):
        tags = validated_data.pop("tags", None)
        tag_names = validated_data.pop("tag_names", None)
        sports_links = validated_data.pop("sports_links", None)
        if tag_names is not None:
            tags = self._resolve_tags(tag_names)
        article = super().update(instance, validated_data)
        if tags is not None:
            article.tags.set(tags)
        if sports_links is not None:
            self._replace_sports_links(article, sports_links)
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

    def validate_content(self, value):
        content = " ".join(value.split())
        if len(content) < 3:
            raise serializers.ValidationError("Comment is too short.")
        if len(content) > 1200:
            raise serializers.ValidationError("Comment must be 1,200 characters or fewer.")
        if len(re.findall(r"https?://|www\.", content, flags=re.IGNORECASE)) > 1:
            raise serializers.ValidationError("Please keep comments to one link or fewer.")
        blocked_terms = {"casino", "betting bonus", "crypto giveaway", "free money", "loan now"}
        normalized = content.lower()
        if any(term in normalized for term in blocked_terms):
            raise serializers.ValidationError("This comment looks promotional. Please rewrite it.")
        return content

    def validate(self, attrs):
        request = self.context.get("request")
        article = attrs.get("article")
        content = attrs.get("content", "")
        user = getattr(request, "user", None)
        if user and user.is_authenticated and article:
            duplicate_exists = Comment.objects.filter(
                article=article,
                user=user,
                content__iexact=content,
            ).exists()
            if duplicate_exists:
                raise serializers.ValidationError("You already posted this comment.")
        return attrs

    @extend_schema_field(CommentReplySerializer(many=True))
    def get_replies(self, obj):
        replies = obj.replies.filter(is_approved=True).select_related("user")
        return CommentReplySerializer(replies, many=True, context=self.context).data

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        validated_data["is_approved"] = True
        return super().create(validated_data)
