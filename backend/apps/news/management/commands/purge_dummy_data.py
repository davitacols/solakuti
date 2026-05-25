from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.news.models import Article, Comment, Tag
from apps.sports.models import Competition, Fixture, Standing, Team


DEMO_EMAILS = [
    "amara@solakuti.test",
    "tunde@solakuti.test",
    "ifeoma@solakuti.test",
    "desk@solakuti.test",
    "chinonso@solakuti.test",
]

DEMO_ARTICLE_TITLES = [
    "Inside Abuja's new policy reset as fiscal reforms enter a decisive week",
    "Breaking: Weather agency issues heavy rainfall alert for southern states",
    "Naira assets draw fresh attention as bond yields reshape investor strategy",
    "Lagos rail ridership climbs as commuters seek faster links across the city",
    "New security coordination plan targets criminal networks across the North West",
    "Nollywood's streaming moment enters a sharper global phase",
    "Opinion: Digital government will fail without civic trust",
]

DEMO_TAGS = [
    "Abuja",
    "Lagos",
    "Policy",
    "Markets",
    "Security",
    "Nollywood",
    "Afrobeats",
    "Transport",
    "Climate",
    "Governance",
]


class Command(BaseCommand):
    help = "Remove old Solakuti demo/dummy content without touching real published articles or categories."

    def add_arguments(self, parser):
        parser.add_argument(
            "--confirm",
            action="store_true",
            help="Actually delete the known demo records. Without this flag the command only previews matches.",
        )

    def handle(self, *args, **options):
        User = get_user_model()

        demo_articles = Article.objects.filter(title__in=DEMO_ARTICLE_TITLES)
        sample_fixtures = Fixture.objects.filter(provider="", provider_id="")

        if not options["confirm"]:
            self.stdout.write(self.style.WARNING("Dry run only. Nothing was deleted."))
            self.stdout.write("Run again with --confirm to delete these exact demo records.")
            self.stdout.write(f"Matching demo articles: {demo_articles.count()}")
            for article in demo_articles.only("title"):
                self.stdout.write(f"- {article.title}")
            self.stdout.write(f"Matching demo users: {User.objects.filter(email__in=DEMO_EMAILS).count()}")
            self.stdout.write(f"Matching sample fixtures: {sample_fixtures.count()}")
            return

        deleted_comments, _ = Comment.objects.filter(article__in=demo_articles).delete()
        deleted_articles, _ = demo_articles.delete()
        deleted_users, _ = User.objects.filter(email__in=DEMO_EMAILS).delete()
        deleted_tags, _ = Tag.objects.filter(name__in=DEMO_TAGS, articles__isnull=True).delete()

        deleted_sample_events = sum(fixture.events.count() for fixture in sample_fixtures)
        deleted_fixtures, _ = sample_fixtures.delete()
        deleted_standings, _ = Standing.objects.filter(competition__provider="", team__provider="").delete()
        deleted_teams, _ = Team.objects.filter(provider="", provider_id="", home_fixtures__isnull=True, away_fixtures__isnull=True).delete()
        deleted_competitions, _ = Competition.objects.filter(provider="", provider_id="", fixtures__isnull=True).delete()

        self.stdout.write(self.style.SUCCESS("Dummy data purge complete."))
        self.stdout.write(f"Deleted articles: {deleted_articles}")
        self.stdout.write(f"Deleted comments: {deleted_comments}")
        self.stdout.write(f"Deleted demo users: {deleted_users}")
        self.stdout.write(f"Deleted unused demo tags: {deleted_tags}")
        self.stdout.write(f"Deleted sample fixture events: {deleted_sample_events}")
        self.stdout.write(f"Deleted sample fixtures: {deleted_fixtures}")
        self.stdout.write(f"Deleted sample standings: {deleted_standings}")
        self.stdout.write(f"Deleted unused sample teams: {deleted_teams}")
        self.stdout.write(f"Deleted unused sample competitions: {deleted_competitions}")
