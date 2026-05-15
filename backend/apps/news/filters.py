import django_filters

from apps.news.models import Article


class ArticleFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug")
    tag = django_filters.CharFilter(field_name="tags__slug")
    author = django_filters.CharFilter(field_name="author__email")
    published_after = django_filters.IsoDateTimeFilter(field_name="published_at", lookup_expr="gte")
    published_before = django_filters.IsoDateTimeFilter(field_name="published_at", lookup_expr="lte")

    class Meta:
        model = Article
        fields = ["category", "tag", "author", "is_featured", "is_breaking", "is_published"]
