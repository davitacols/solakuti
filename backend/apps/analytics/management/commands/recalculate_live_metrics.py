from django.core.management.base import BaseCommand
from django.db.models import Count

from apps.news.models import Article


class Command(BaseCommand):
    help = "Synchronize stored article view counters with real ArticleView rows."

    def handle(self, *args, **options):
        updated = 0
        queryset = Article.objects.annotate(real_views_count=Count("view_events", distinct=True))
        for article in queryset.iterator():
            if article.views_count == article.real_views_count:
                continue
            article.views_count = article.real_views_count
            article.save(update_fields=["views_count"])
            updated += 1

        self.stdout.write(self.style.SUCCESS(f"Recalculated live metrics for {updated} article(s)."))
