from pathlib import Path
from textwrap import dedent
from urllib.parse import urlparse

import requests
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.categories.models import Category
from apps.news.models import Article, Tag


SPORTS_STORIES = [
    {
        "title": "Femi Azeez Makes Dream Nigeria Debut As Super Eagles Reach Unity Cup Final",
        "slug": "femi-azeez-dream-debut-super-eagles-unity-cup-final",
        "excerpt": (
            "Nigeria's Unity Cup campaign opened with a 2-0 win over Zimbabwe in London, "
            "with debutant Femi Azeez scoring twice and strengthening Eric Chelle's case "
            "for a deeper Super Eagles squad."
        ),
        "source_url": "https://punchng.com/debutant-azeez-scores-twice-as-super-eagles-beat-zimbabwe-reach-unity-cup-final/",
        "image_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Argentina-Nigeria%20%288%29.jpg",
        "image_filename": "super-eagles-nigeria-football.jpg",
        "image_credit": "Dmitry Pukalik, Wikimedia Commons, CC BY-SA 3.0",
        "tags": ["Super Eagles", "Unity Cup", "Femi Azeez", "Nigeria Football"],
        "is_featured": True,
        "content": dedent(
            """
            <p>Nigeria's 2026 Unity Cup campaign has quickly become more than a friendly tournament exercise. The Super Eagles defeated Zimbabwe 2-0 at The Valley in London, and the headline belonged to Femi Azeez, who marked his senior international debut with two goals.</p>

            <p>The result sends Nigeria into the final and gives head coach Eric Chelle exactly what this experimental window was meant to provide: evidence. With several regular names absent and a squad built around new faces, NPFL performers and players outside the most familiar elite European circuits, the match became a live audition for places in the wider national-team project.</p>

            <h2>A debut that changed the conversation</h2>

            <p>Azeez's brace mattered because it arrived under a very specific kind of pressure. International debuts are often judged less by volume of touches and more by whether a player looks overwhelmed by the shirt. Azeez did not. His movement gave Nigeria an outlet, his finishing gave the team control, and his second goal effectively ended Zimbabwe's resistance.</p>

            <p>For Chelle, that is valuable. Nigeria have spent recent years balancing star power with questions about rhythm, identity and squad depth. A performance like this gives the technical crew a practical argument for expanding the selection pool rather than depending only on familiar names.</p>

            <h2>What Chelle can take from the win</h2>

            <p>The Super Eagles were not simply chasing a result. They were testing the structure of a wider rebuild. The Unity Cup squad included home-based players, emerging diaspora options and footballers seeking to prove they can handle the tempo of international football. A comfortable win does not answer every question, but it offers a clean starting point.</p>

            <p>Nigeria's best teams have usually combined individual brilliance with competition for places. If this group can push established players, the benefit will be felt beyond the tournament. The next steps are consistency, tactical clarity and better chemistry in possession, especially against teams that press higher than Zimbabwe managed on the night.</p>

            <h2>Why the Unity Cup still matters</h2>

            <p>Friendly tournaments are sometimes dismissed, but for Nigeria this one has become a useful platform. It lets the coaching staff evaluate players without the immediate pressure of World Cup qualification or AFCON knockout football. It also gives supporters a clearer look at the next layer of talent.</p>

            <p>The final will be a stronger test of whether the performance against Zimbabwe was a one-night spark or the beginning of a serious squad shake-up. For Azeez, the immediate mission is simple: turn a dream debut into a genuine claim.</p>

            <p><strong>Source reference:</strong> Punch reported that debutant Femi Azeez scored twice as Nigeria beat Zimbabwe 2-0 to reach the Unity Cup final.</p>
            """
        ).strip(),
    },
    {
        "title": "Enugu Rangers Crowned NPFL Champions As Nigerian League Ends With Continental Stakes",
        "slug": "enugu-rangers-npfl-champions-continental-stakes",
        "excerpt": (
            "Enugu Rangers have completed another title campaign in the Nigeria Premier Football League, "
            "with the race also confirming continental implications for Rangers and Rivers United."
        ),
        "source_url": "https://punchng.com/enugu-rangers-win-ninth-npfl-title-remo-relegated/",
        "image_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Akwa%20United%20facing%20Enugu%20Rangers%20in%20their%20last%20league%20match%20of%20the%202021-22%20season.jpg",
        "image_filename": "enugu-rangers-npfl-match.jpg",
        "image_credit": "Wikimedia Commons, CC BY-SA",
        "tags": ["NPFL", "Enugu Rangers", "Rivers United", "CAF Champions League"],
        "is_featured": True,
        "content": dedent(
            """
            <p>Enugu Rangers have been crowned champions of the Nigeria Premier Football League, adding another major chapter to one of the country's most storied football institutions. Their latest title run underlines the club's ability to survive pressure in a league where travel, fixture congestion and late-season margins often decide everything.</p>

            <p>The final stretch of the campaign carried more than trophy tension. Rivers United pushed hard enough to keep the title race alive and, by finishing as runners-up, secured continental relevance for next season. That means Nigeria's domestic campaign has ended with two of its most visible clubs carrying responsibility into Africa.</p>

            <h2>A title built on control</h2>

            <p>Rangers' advantage was not only about isolated match-winning moments. It was about finding enough structure to manage the long season. In the NPFL, that usually means winning home games, limiting damage on difficult away trips and keeping the squad stable when injuries and administrative pressures arrive.</p>

            <p>The league table ultimately rewarded Rangers' consistency. Their latest championship also strengthens the argument that clubs with history still need modern football operations to stay ahead. Supporters will celebrate the badge and the legacy, but the next challenge will be less romantic: squad planning, financial discipline and continental preparation.</p>

            <h2>Continental football is the next test</h2>

            <p>For Nigerian clubs, local success does not automatically translate into African competitiveness. CAF Champions League football asks different questions. The matches are more tactical, the travel is more demanding, and mistakes are punished faster. Rangers and Rivers United will need to treat qualification not as a reward lap, but as a project.</p>

            <p>The gap between winning at home and competing deep in Africa is still one of Nigerian football's biggest development challenges. Better recruitment, stronger sports science, reliable player registration work and early pre-season planning will matter as much as crowd support.</p>

            <h2>Why this matters for the league</h2>

            <p>A strong Rangers campaign helps the NPFL's visibility because the club carries national recognition. But the league needs more than heritage names. It needs better broadcast consistency, cleaner matchday operations and a stronger commercial pitch to sponsors. A dramatic title race is useful; a reliable product is better.</p>

            <p>Rangers' triumph should therefore be read in two ways. It is a celebration for Enugu, and it is also a reminder that Nigerian club football still has major room to grow. If the champions can convert domestic momentum into a credible African run, the whole league benefits.</p>

            <p><strong>Source reference:</strong> Punch reported that Enugu Rangers were crowned NPFL champions, with Rivers United finishing runners-up and taking a CAF Champions League slot.</p>
            """
        ).strip(),
    },
    {
        "title": "Port Harcourt Gets Historic NWFL Super Six As Women's Football Pushes For Bigger Stage",
        "slug": "port-harcourt-nwfl-super-six-womens-football-bigger-stage",
        "excerpt": (
            "The Nigeria Women Football League has named Port Harcourt as host city for the 2026 "
            "NWFL Premiership Super Six Finals, a move that gives the women's game another major "
            "showcase outside its usual centres."
        ),
        "source_url": "https://blueprint.ng/nwfl-announces-date-host-city-for-2026-nwfl-premiership-super-six/",
        "image_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Women%20play%20football.jpg",
        "image_filename": "nwfl-womens-football.jpg",
        "image_credit": "K2Prince, Wikimedia Commons",
        "tags": ["NWFL", "Women's Football", "Port Harcourt", "Super Six"],
        "is_featured": False,
        "content": dedent(
            """
            <p>Port Harcourt will host the 2026 NWFL Premiership Super Six Finals, giving Nigeria's women's top flight a significant stage in the Garden City and placing another spotlight on the growth of the domestic women's game.</p>

            <p>The Nigeria Women Football League's decision is important because the Super Six is not just a conclusion to the season. It is the league's showcase window: the point at which title contenders, national-team hopefuls, scouts, sponsors and football administrators all converge around the best teams in the competition.</p>

            <h2>Why Port Harcourt is a meaningful choice</h2>

            <p>Taking the finals to Port Harcourt broadens the map of Nigerian women's football. The city has a deep sporting culture, a strong football audience and the infrastructure profile to stage events that can draw attention beyond the immediate clubs involved.</p>

            <p>For the NWFL, host-city selection is part of brand building. A well-run Super Six can help the league look more professional to partners and broadcasters. It can also give younger players a stronger sense that women's football has a visible pathway in Nigeria, not only at national-team level but at club level too.</p>

            <h2>The bigger commercial question</h2>

            <p>Women's football in Nigeria has never lacked talent. The issue has often been packaging, investment and continuity. The Super Falcons have carried the country's reputation across Africa and at global tournaments, but the domestic league needs more regular visibility to turn talent into a sustainable industry.</p>

            <p>A strong Super Six can become a commercial product if it is treated properly. That means fixture clarity, reliable streaming or broadcast access, improved media operations, player storytelling and better matchday presentation. The audience will grow when the league makes itself easier to follow.</p>

            <h2>What success should look like</h2>

            <p>Success in Port Harcourt should not only be measured by who lifts the trophy. The finals should also be judged by attendance, broadcast reach, media coverage, player welfare and whether the league can convert attention into longer-term partnerships.</p>

            <p>If the NWFL can use the Super Six to raise standards, the competition could become one of the strongest platforms for discovering the next generation of Super Falcons. Port Harcourt now has a chance to host more than a tournament. It can host a statement.</p>

            <p><strong>Source reference:</strong> Blueprint reported that the NWFL announced Port Harcourt as host city for the 2026 NWFL Premiership Super Six Finals.</p>
            """
        ).strip(),
    },
    {
        "title": "Sporting Lagos Return To NPFL With Bigger Ambition And A Bigger Lagos Football Story",
        "slug": "sporting-lagos-return-npfl-bigger-ambition",
        "excerpt": (
            "Sporting Lagos are heading back to the Nigeria Premier Football League, and their return "
            "adds another layer to Lagos football's expanding top-flight presence."
        ),
        "source_url": "https://www.naijanews.com/2026/05/16/sporting-lagos-return-npfl-continental-ambition-weekend-spectacle-enakhena/",
        "image_url": "https://commons.wikimedia.org/wiki/Special:FilePath/National%20Stadium%2C%20Lagos.jpg",
        "image_filename": "lagos-football-stadium.jpg",
        "image_credit": "Ridzaina, Wikimedia Commons, CC BY-SA 4.0",
        "tags": ["Sporting Lagos", "NPFL", "Lagos Football", "NNL"],
        "is_featured": False,
        "content": dedent(
            """
            <p>Sporting Lagos are preparing for life back in the Nigeria Premier Football League, and their return carries more meaning than promotion alone. It strengthens Lagos' presence in the top flight and renews one of the more interesting modern football projects in the country.</p>

            <p>The club's promotion came after a tense run through the Nigeria National League pathway, with Sporting Lagos securing the result needed to return to the elite division. For a club that has built much of its identity around community, matchday culture and a younger urban fan base, the next season will be a test of whether style can meet substance.</p>

            <h2>A second chance at top-flight stability</h2>

            <p>Promotion is only the first part of the work. The NPFL is unforgiving, especially for clubs that want to play ambitious football while managing travel, squad depth and financial pressure. Sporting Lagos now have to prove that their project has matured since their previous top-flight spell.</p>

            <p>That means recruitment must be sharper, matchday execution must be consistent and the club's technical direction must survive the inevitable rough patches of a long campaign. The brand is strong, but survival and progress will be decided on the pitch.</p>

            <h2>Lagos is becoming a bigger NPFL market</h2>

            <p>Sporting Lagos' return also matters because Lagos football is becoming more crowded and more competitive. With other Lagos-based clubs also operating around the top-flight conversation, the city is moving closer to the kind of local football market that can create rivalries, fan identity and commercial value.</p>

            <p>For sponsors and broadcasters, Lagos offers visibility. For the league, it offers audience scale. But the opportunity will only become valuable if clubs turn attention into quality football and reliable operations.</p>

            <h2>Ambition now needs evidence</h2>

            <p>Sporting Lagos have rarely hidden their ambition. The club wants to be more than another promoted side trying to survive. Its leadership has spoken about long-term growth, fan experience and continental dreams. Those goals are legitimate, but the NPFL has a way of separating slogans from systems.</p>

            <p>The coming season will show whether Sporting Lagos can convert their modern identity into league points. If they can, their return may become one of the most useful stories for Nigerian football: a club proving that presentation, planning and performance can belong in the same sentence.</p>

            <p><strong>Source reference:</strong> Naija News reported that Sporting Lagos sealed promotion back to the NPFL and are preparing for the next phase of the club's project.</p>
            """
        ).strip(),
    },
]


class Command(BaseCommand):
    help = "Seed authentic, long-form sports articles with related featured images."

    def add_arguments(self, parser):
        parser.add_argument("--author-email", default="desk@solakuti.com")
        parser.add_argument("--author-name", default="Solakuti Sports Desk")
        parser.add_argument("--skip-images", action="store_true")
        parser.add_argument("--refresh-images", action="store_true")

    def handle(self, *args, **options):
        author = self.get_author(options["author_email"], options["author_name"])
        category, _ = Category.objects.get_or_create(
            name="Sports",
            defaults={"description": "Football, live scores and major sports stories."},
        )

        session = requests.Session()
        session.headers.update({"User-Agent": "SolakutiSportsSeeder/1.0"})

        created = 0
        updated = 0
        images_attached = 0

        for story in SPORTS_STORIES:
            article, was_created = Article.objects.update_or_create(
                slug=story["slug"],
                defaults={
                    "title": story["title"],
                    "excerpt": story["excerpt"],
                    "content": story["content"],
                    "category": category,
                    "author": author,
                    "editorial_status": Article.EditorialStatus.PUBLISHED,
                    "is_published": True,
                    "is_featured": story.get("is_featured", False),
                    "is_breaking": False,
                    "seo_title": story["title"][:255],
                    "seo_description": story["excerpt"][:320],
                    "canonical_url": story["source_url"],
                    "published_at": timezone.now(),
                },
            )
            article.tags.set(self.resolve_tags(story["tags"]))

            should_attach_image = (
                not options["skip_images"]
                and story.get("image_url")
                and (options["refresh_images"] or not article.featured_image)
            )
            if should_attach_image and self.attach_featured_image(session, article, story):
                images_attached += 1

            created += int(was_created)
            updated += int(not was_created)

        self.stdout.write(self.style.SUCCESS("Sports news seed complete."))
        self.stdout.write(f"Created: {created}")
        self.stdout.write(f"Updated: {updated}")
        self.stdout.write(f"Images attached: {images_attached}")

    def get_author(self, email, full_name):
        User = get_user_model()
        author, created = User.objects.get_or_create(
            email=email,
            defaults={
                "full_name": full_name,
                "role": User.Role.EDITOR,
                "is_verified": True,
                "is_staff": True,
            },
        )
        if created:
            author.set_unusable_password()
            author.save(update_fields=["password"])
        return author

    def resolve_tags(self, names):
        tags = []
        for name in names:
            tag, _ = Tag.objects.get_or_create(name=name[:80])
            tags.append(tag)
        return tags

    def attach_featured_image(self, session, article, story):
        try:
            response = session.get(story["image_url"], timeout=30)
            response.raise_for_status()
        except requests.RequestException as exc:
            self.stderr.write(f"Could not download image for {story['slug']}: {exc}")
            return False

        content_type = response.headers.get("content-type", "")
        if not content_type.startswith("image/"):
            self.stderr.write(f"Skipped non-image response for {story['slug']}: {content_type}")
            return False

        parsed = urlparse(response.url)
        filename = story.get("image_filename") or Path(parsed.path).name or f"{story['slug']}.jpg"
        article.featured_image.save(filename, ContentFile(response.content), save=True)
        article.og_image.save(filename, ContentFile(response.content), save=True)
        return True
