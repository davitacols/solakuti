from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.categories.models import Category
from apps.news.models import Article, Comment, Tag


PASSWORD = "SolakutiPass123!"

CATEGORIES = [
    ("Politics", "Power, policy, elections and public institutions."),
    ("Breaking News", "Fast-moving stories that need immediate public attention."),
    ("Economy", "Markets, business, fiscal policy and the Nigerian economy."),
    ("Security News", "Security, public safety and conflict reporting."),
    ("Crime", "Crime reports, investigations, courts and public safety alerts."),
    ("World News", "Global affairs, diplomacy and international developments."),
    ("General News", "Major public-interest reports across Nigeria and everyday life."),
    ("Entertainment", "Nollywood, music, celebrity culture and creative business."),
    ("Sports", "Football, athletics, leagues, tournaments and Nigerian sports personalities."),
    ("Opinions", "Sharp essays, argument and civic analysis."),
    ("Nigeria", "National life, cities, communities and everyday public affairs."),
]

TAGS = [
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

USERS = [
    ("Amara Eze", "amara@solakuti.test", "editor", "Politics editor focused on federal policy and institutions."),
    ("Tunde Balogun", "tunde@solakuti.test", "journalist", "Lagos correspondent covering cities, transport and daily life."),
    ("Ifeoma Okonkwo", "ifeoma@solakuti.test", "journalist", "Business reporter tracking markets, startups and the macroeconomy."),
    ("News Desk", "desk@solakuti.test", "editor", "Solakuti breaking news and live desk."),
    ("Chinonso Nwankwo", "chinonso@solakuti.test", "contributor", "Columnist writing on public technology and civic trust."),
]

ARTICLES = [
    {
        "title": "Inside Abuja's new policy reset as fiscal reforms enter a decisive week",
        "category": "Politics",
        "author": "amara@solakuti.test",
        "excerpt": "Senior officials are framing the next wave of reforms around revenue discipline, state coordination and a more visible social safety net.",
        "content": "\n\n".join(
            [
                "Abuja is preparing for a decisive round of fiscal policy announcements as the federal government tries to consolidate recent economic gains without deepening pressure on households.",
                "Officials familiar with the talks say the renewed push will focus on tax compliance, better public spending controls and a clearer framework for state-level implementation.",
                "The political challenge remains significant. Lawmakers, governors and private sector leaders are pressing for measures that can translate macroeconomic indicators into practical relief for citizens.",
                "Analysts say the next phase will be judged less by policy language and more by execution. The government is expected to lean on digital collection systems, targeted transfers and tighter procurement rules.",
            ]
        ),
        "tags": ["Abuja", "Policy", "Governance"],
        "is_featured": True,
        "views_count": 4280,
    },
    {
        "title": "Breaking: Weather agency issues heavy rainfall alert for southern states",
        "category": "Breaking News",
        "author": "desk@solakuti.test",
        "excerpt": "Residents in flood-prone communities have been advised to follow local evacuation guidance and monitor official updates.",
        "content": "\n\n".join(
            [
                "Nigeria's weather agency has issued a heavy rainfall alert for parts of the South South and South West over the next 48 hours.",
                "Emergency officials are advising residents in low-lying areas to clear drainage channels and prepare for possible movement to safer ground.",
                "State response teams say they are monitoring water levels and coordinating with local government authorities.",
                "The agency urged the public to rely on official channels and avoid spreading unverified flood warnings.",
            ]
        ),
        "tags": ["Climate", "Lagos"],
        "is_breaking": True,
        "views_count": 3910,
    },
    {
        "title": "Naira assets draw fresh attention as bond yields reshape investor strategy",
        "category": "Economy",
        "author": "ifeoma@solakuti.test",
        "excerpt": "Fund managers are watching inflation data, central bank signals and oil receipts before taking larger positions.",
        "content": "\n\n".join(
            [
                "Nigeria's fixed-income market is attracting renewed attention as yields continue to offer compelling returns for local and offshore investors.",
                "Market participants say confidence remains cautious, with portfolio flows still sensitive to currency stability and the pace of disinflation.",
                "A Lagos-based fund manager said investors are looking for consistency from monetary authorities before extending duration.",
                "The broader outlook will depend on oil receipts, external reserves and the credibility of fiscal consolidation efforts.",
            ]
        ),
        "tags": ["Markets", "Policy"],
        "views_count": 3180,
    },
    {
        "title": "Lagos rail ridership climbs as commuters seek faster links across the city",
        "category": "Nigeria",
        "author": "tunde@solakuti.test",
        "excerpt": "Transport officials say the blue line is reshaping daily movement patterns while private operators race to adjust feeder services.",
        "content": "\n\n".join(
            [
                "The Lagos rail network is seeing a steady rise in weekday passengers as more residents choose predictable travel times over road congestion.",
                "Commuters interviewed at Marina and Mile 2 described the service as a major improvement, though they called for more last-mile options and better crowd control during peak hours.",
                "Urban mobility analysts say the gains will depend on integration with buses, ferries and digital ticketing systems.",
                "The state government has indicated that additional rolling stock and expanded routes remain central to its long-term transport plan.",
            ]
        ),
        "tags": ["Lagos", "Transport"],
        "views_count": 2950,
    },
    {
        "title": "New security coordination plan targets criminal networks across the North West",
        "category": "Security News",
        "author": "desk@solakuti.test",
        "excerpt": "Military commanders and state officials are moving toward shared intelligence hubs and faster response protocols.",
        "content": "\n\n".join(
            [
                "Security agencies are expanding coordination across several North West states as authorities attempt to disrupt cross-border criminal networks.",
                "The new plan emphasizes shared intelligence, rapid deployment corridors and closer cooperation with local communities.",
                "Officials say the approach is designed to reduce operational gaps that armed groups have exploited in rural areas.",
                "Community leaders continue to call for sustained presence, economic support and accountability for abuses.",
            ]
        ),
        "tags": ["Security", "Governance"],
        "views_count": 2760,
    },
    {
        "title": "Nollywood's streaming moment enters a sharper global phase",
        "category": "Entertainment",
        "author": "tunde@solakuti.test",
        "excerpt": "A new generation of producers is balancing local storytelling with international distribution demands.",
        "content": "\n\n".join(
            [
                "Nollywood producers are entering a more competitive streaming cycle as global platforms look for stories with strong local identity and broader audience appeal.",
                "Industry executives say budgets are rising, but so are expectations around writing, post-production and marketing.",
                "The shift has created opportunities for younger directors, cinematographers and composers who are comfortable with both cinema releases and platform-first distribution.",
                "For many filmmakers, the question is how to scale without flattening the distinctly Nigerian texture of the work.",
            ]
        ),
        "tags": ["Nollywood"],
        "views_count": 2410,
    },
    {
        "title": "Opinion: Digital government will fail without civic trust",
        "category": "Opinions",
        "author": "chinonso@solakuti.test",
        "excerpt": "Nigeria's public technology projects need more than dashboards. They need transparency citizens can verify.",
        "content": "\n\n".join(
            [
                "Digital transformation has become a familiar promise in Nigerian governance, but citizens are right to ask what exactly is being transformed.",
                "A portal can simplify access, yet it cannot substitute for accountability. A dashboard can display numbers, yet it cannot guarantee that those numbers are reliable.",
                "The next generation of public technology should be built around auditability, plain-language reporting and independent civic oversight.",
                "Trust grows when people can see how decisions are made, challenge errors and receive timely correction.",
            ]
        ),
        "tags": ["Governance", "Policy"],
        "views_count": 1995,
    },
]


class Command(BaseCommand):
    help = "Seed Solakuti with realistic newsroom users, categories, tags, articles and comments."

    def handle(self, *args, **options):
        User = get_user_model()

        users = {}
        for full_name, email, role, bio in USERS:
            user, _ = User.objects.update_or_create(
                email=email,
                defaults={
                    "full_name": full_name,
                    "role": role,
                    "bio": bio,
                    "is_verified": True,
                    "is_staff": role in {"admin", "editor"},
                },
            )
            user.set_password(PASSWORD)
            user.save(update_fields=["password", "full_name", "role", "bio", "is_verified", "is_staff"])
            users[email] = user

        categories = {
            name: Category.objects.update_or_create(name=name, defaults={"description": description})[0]
            for name, description in CATEGORIES
        }
        tags = {name: Tag.objects.update_or_create(name=name)[0] for name in TAGS}

        for index, item in enumerate(ARTICLES):
            article, _ = Article.objects.update_or_create(
                title=item["title"],
                defaults={
                    "excerpt": item["excerpt"],
                    "content": item["content"],
                    "category": categories[item["category"]],
                    "author": users[item["author"]],
                    "is_featured": item.get("is_featured", False),
                    "is_breaking": item.get("is_breaking", False),
                    "is_published": True,
                    "views_count": item["views_count"],
                    "published_at": timezone.now() - timezone.timedelta(hours=index * 8),
                },
            )
            article.tags.set(tags[name] for name in item["tags"])

        first_article = Article.objects.order_by("-views_count").first()
        if first_article:
            commenter = users["chinonso@solakuti.test"]
            comment, _ = Comment.objects.update_or_create(
                article=first_article,
                user=commenter,
                parent=None,
                content="This is the kind of context Nigerian public debate needs more often.",
                defaults={"is_approved": True},
            )
            Comment.objects.update_or_create(
                article=first_article,
                user=users["amara@solakuti.test"],
                parent=comment,
                content="Agreed. The execution details will matter more than the announcement.",
                defaults={"is_approved": True},
            )

        self.stdout.write(self.style.SUCCESS("Solakuti newsroom seed data created."))
        self.stdout.write(f"Seed user password for all demo accounts: {PASSWORD}")
