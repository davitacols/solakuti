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


FOREIGN_STORIES = [
    {
        "title": "Kyiv Braces For Fresh Barrage As Russia Keeps Drone Pressure On Ukraine",
        "slug": "kyiv-braces-fresh-barrage-russia-drone-pressure-ukraine",
        "excerpt": (
            "Ukraine says Russia fired more than 100 drones and ballistic missiles overnight, "
            "as warnings of further strikes on Kyiv deepen fears of another escalation in the war."
        ),
        "source_url": "https://apnews.com/article/2abde640e27e7b320715d74358ba28f3",
        "image_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Kyiv%20after%20Russian%20drone%20attack%2C%202022-10-17%20%2801%29.jpg",
        "image_filename": "kyiv-drone-attack-aftermath.jpg",
        "tags": ["Ukraine", "Russia", "Kyiv", "World News", "Security"],
        "is_featured": True,
        "content": dedent(
            """
            <p>Kyiv is again facing the possibility of a major Russian air assault after Ukraine reported another overnight wave of drones and ballistic missiles. The Ukrainian air force said Russia fired more than 100 drones and two ballistic missiles, extending a pattern of pressure that has kept civilians, diplomats and emergency services on alert.</p>

            <p>The warning has particular weight because Moscow also urged foreign citizens, including diplomatic personnel, to leave the Ukrainian capital quickly. For residents of Kyiv, the language is familiar but still serious. Russia has repeatedly used drones and missiles to target Ukrainian cities since its full-scale invasion began in February 2022, often forcing families into shelters through the night.</p>

            <h2>Drone warfare remains central to the conflict</h2>

            <p>The latest attacks underline how drones have become one of the defining weapons of the war. They are cheaper than ballistic missiles, harder to stop at scale and capable of exhausting air-defence systems when launched in large waves. Even when many are intercepted, the pressure on electricity infrastructure, apartment blocks and emergency-response teams remains heavy.</p>

            <p>Ukraine has invested heavily in air defences and electronic warfare, but the mathematics of modern drone warfare are difficult. A defender often spends more money stopping a drone than the attacker spends launching it. That imbalance has turned night skies into a persistent battlefield.</p>

            <h2>Diplomatic warnings raise the stakes</h2>

            <p>The latest Russian warnings to foreign missions add a diplomatic layer to the military pressure. When embassies are told to reduce exposure or evacuate staff, the message is not only aimed at Ukraine. It is also read by NATO capitals, humanitarian organisations and markets watching for signs that the war could enter a more dangerous phase.</p>

            <p>For Ukraine, the challenge is to absorb the pressure without allowing daily life in the capital to become paralysed. Kyiv has learned to function through alerts, curfews and blackouts. But repeated warnings of “systemic strikes” test morale and stretch state capacity.</p>

            <h2>Why it matters beyond Ukraine</h2>

            <p>The conflict has already reshaped European defence planning, energy security and global food supply chains. Fresh attacks on Kyiv remind the wider world that the war is not frozen. It is adapting. The air war, in particular, is now influencing how countries think about cities, drones, air defence budgets and civilian resilience.</p>

            <p>As the latest barrage shows, Russia is still willing to use long-range pressure to force political and psychological costs. Ukraine’s response will depend on air defence supplies, battlefield endurance and whether diplomatic partners continue to treat the war as an active strategic emergency rather than background noise.</p>

            <p><strong>Source reference:</strong> The Associated Press reported that Russia fired more than 100 drones and two ballistic missiles at Ukraine overnight while Kyiv was warned of possible further strikes.</p>
            """
        ).strip(),
    },
    {
        "title": "Gaza Aid Crisis Deepens As UN Pressure Builds Around Ceasefire Obligations",
        "slug": "gaza-aid-crisis-deepens-un-pressure-ceasefire-obligations",
        "excerpt": (
            "The humanitarian situation in Gaza remains under severe strain, with international officials "
            "warning that aid restrictions and fragile ceasefire arrangements risk locking civilians into a prolonged emergency."
        ),
        "source_url": "https://apnews.com/article/2d4c4a8e57aa6bbfa07a25c6cb4bbd23",
        "image_url": "https://commons.wikimedia.org/wiki/Special:FilePath/JLOTS%20Humanitarian%20Aid%20Movement%20%288504495%29.jpg",
        "image_filename": "gaza-humanitarian-aid-movement.jpg",
        "tags": ["Gaza", "United Nations", "Humanitarian Aid", "Middle East"],
        "is_featured": True,
        "content": dedent(
            """
            <p>International pressure is rising over Gaza’s humanitarian situation as ceasefire obligations, aid access and security arrangements remain contested. The debate at the United Nations has focused on two connected issues: the need for Hamas to disarm under the peace framework, and the need for Israel to uphold commitments on humanitarian access and protection of civilians.</p>

            <p>For Gaza’s population, the diplomatic language translates into immediate questions of survival. Food, medicine, fuel, shelter and safe movement remain central concerns. Humanitarian agencies have warned for months that restrictions on aid flows can quickly deepen hunger, displacement and preventable disease.</p>

            <h2>A ceasefire without relief is fragile</h2>

            <p>A ceasefire is only durable when civilians experience a material change in conditions. If aid remains unpredictable or if violence continues in pockets, public confidence in any political arrangement weakens. That is why humanitarian access has become a core test of the current framework.</p>

            <p>The official overseeing the U.S.-brokered ceasefire urged the UN Security Council to use its influence to press Hamas to disarm. He also said Israel must meet its obligations under the ceasefire, pointing to killings of Palestinians and restrictions affecting humanitarian flows. That dual pressure reflects the complexity of the moment: security demands and civilian needs are moving together, but not always in the same direction.</p>

            <h2>Why aid access is also a political issue</h2>

            <p>Aid delivery in Gaza is never only logistical. Every crossing, convoy route and distribution point carries political meaning. Controls are justified by security concerns, while aid agencies warn that delays can put civilians at risk. The result is a system where humanitarian work depends on political decisions made far from the people waiting for assistance.</p>

            <p>For international actors, the challenge is to prevent humanitarian access from becoming a bargaining chip. Civilians cannot wait for perfect political alignment before receiving food, medicine and basic services. That principle is likely to remain at the centre of UN debate.</p>

            <h2>The wider regional risk</h2>

            <p>Gaza’s crisis also affects the wider Middle East. If reconstruction stalls, displacement deepens or armed groups exploit desperation, the conflict can continue to shape regional diplomacy long after formal ceasefire language is agreed. Donor fatigue and mistrust between parties make the problem harder.</p>

            <p>The immediate test is whether the ceasefire can produce visible relief. Without that, Gaza risks becoming a permanent emergency managed through statements rather than solved through sustained access, accountability and political compromise.</p>

            <p><strong>Source reference:</strong> The Associated Press reported that the official overseeing the Gaza ceasefire urged the UN Security Council to press Hamas to disarm while also saying Israel must uphold its obligations on aid and civilian protection.</p>
            """
        ).strip(),
    },
    {
        "title": "WHO Declares Ebola Bundibugyo Outbreak In DRC And Uganda A Global Health Emergency",
        "slug": "who-ebola-bundibugyo-drc-uganda-global-health-emergency",
        "excerpt": (
            "The World Health Organization says the Ebola Bundibugyo outbreak in the Democratic Republic "
            "of Congo and Uganda is a public health emergency of international concern, though not a pandemic emergency."
        ),
        "source_url": "https://www.who.int/news/item/22-05-2026-first-meeting-of-the-ihr-emergency-committee-regarding-the-epidemic-of-ebola-bundibugyo-virus-disease-in-the-democratic-republic-of-the-congo-and-uganda-2026-temporary-recommendations",
        "image_url": "https://commons.wikimedia.org/wiki/Special:FilePath/7042%20lores-Ebola-Zaire-CDC%20Photo.jpg",
        "image_filename": "ebola-response-drc-health-workers.jpg",
        "tags": ["Ebola", "DR Congo", "Uganda", "WHO", "Global Health"],
        "is_featured": False,
        "content": dedent(
            """
            <p>The World Health Organization has declared the Ebola disease outbreak caused by Bundibugyo virus in the Democratic Republic of Congo and Uganda a public health emergency of international concern. The decision signals that the event requires coordinated international attention, even though WHO said it does not meet the criteria for a pandemic emergency.</p>

            <p>The outbreak was confirmed after health authorities in both countries reported Bundibugyo virus disease, a form of Ebola that can cause severe illness and death. WHO’s emergency committee issued temporary recommendations under the International Health Regulations, the framework countries use to coordinate around cross-border health threats.</p>

            <h2>Why the declaration matters</h2>

            <p>A public health emergency of international concern is not a symbolic label. It is intended to accelerate surveillance, laboratory testing, public communication, infection prevention and cross-border coordination. In outbreaks involving highly dangerous pathogens, speed is often the difference between containment and regional spread.</p>

            <p>The declaration also helps focus donor and technical support. Countries affected by Ebola need rapid case detection, safe isolation, contact tracing, protective equipment for health workers and community trust. When any of those elements fail, the virus can move through households, clinics and travel corridors.</p>

            <h2>Health workers are central to containment</h2>

            <p>Ebola outbreaks place health workers at extreme risk. Clinics can become amplification points if infection-prevention measures are weak or if patients arrive before the disease is recognised. That is why training, protective gear and clear referral systems are critical in the first weeks of response.</p>

            <p>The DRC has experience responding to Ebola, but each outbreak has its own geography, politics and social dynamics. Uganda’s involvement adds urgency because cross-border movement can complicate tracing and messaging. Public health teams must work across communities, not only hospitals.</p>

            <h2>What comes next</h2>

            <p>The next phase will depend on how quickly authorities can identify contacts, support patients and prevent rumours from undermining health guidance. Past Ebola responses have shown that communities cooperate more effectively when information is transparent, culturally sensitive and locally delivered.</p>

            <p>For Africa and the wider world, the outbreak is another reminder that health security is collective. A virus does not respect borders, and weak surveillance in one place can become a regional challenge. The priority now is containment before the emergency grows wider.</p>

            <p><strong>Source reference:</strong> WHO reported that the Ebola Bundibugyo outbreak in DRC and Uganda constitutes a public health emergency of international concern, but not a pandemic emergency.</p>
            """
        ).strip(),
    },
    {
        "title": "World Health Assembly Adopts New AMR Plan As Drug Resistance Threatens Millions",
        "slug": "world-health-assembly-amr-plan-drug-resistance-threatens-millions",
        "excerpt": (
            "WHO member states have approved an updated global action plan on antimicrobial resistance, "
            "warning that resistant infections could cause tens of millions of deaths by mid-century without urgent action."
        ),
        "source_url": "https://www.who.int/news/item/23-05-2026-seventy-ninth-world-health-assembly---daily-update--23-may-2026",
        "image_url": "https://commons.wikimedia.org/wiki/Special:FilePath/World%20Health%20Organisation%20headquarters%2C%20Geneva%2C%20north%20and%20west%20sides%202007.jpg",
        "image_filename": "world-health-organization-geneva.jpg",
        "tags": ["WHO", "Antimicrobial Resistance", "Global Health", "World Health Assembly"],
        "is_featured": False,
        "content": dedent(
            """
            <p>Member states at the World Health Assembly have approved an updated global action plan on antimicrobial resistance, renewing international commitments to confront one of the most serious long-term threats to modern medicine.</p>

            <p>Antimicrobial resistance, often shortened to AMR, happens when bacteria and other microbes evolve to survive medicines that once controlled them. The result is that routine infections become harder to treat, surgeries become riskier, and health systems face higher costs and longer hospital stays.</p>

            <h2>A slow crisis with massive consequences</h2>

            <p>WHO says surveillance data show that one in six common bacterial infections in 2023 were resistant to antibiotic treatment. Studies cited by the organisation estimate that millions of deaths are already associated with bacterial AMR, and that without urgent action, AMR could contribute to up to 39 million deaths by 2050.</p>

            <p>The scale of the threat is difficult because it is not always dramatic in the way outbreaks are. AMR grows quietly inside hospitals, farms, pharmacies and communities. It is driven by overuse and misuse of antibiotics, poor infection prevention, weak diagnostics and limited access to quality medicines.</p>

            <h2>The new plan takes a One Health view</h2>

            <p>The updated action plan for 2026 to 2036 places AMR inside a One Health framework, linking human health, animal health, agriculture and the environment. That matters because resistant organisms can move across all of those spaces. A hospital policy alone cannot solve a problem shaped by farming practices, wastewater, medicine supply chains and public behaviour.</p>

            <p>The plan aims to preserve the ability to treat infections by improving access to effective medicines, reducing unnecessary use of antimicrobials and strengthening surveillance. It also pushes countries to invest in infection prevention, diagnostics and better regulatory systems.</p>

            <h2>Why low- and middle-income countries need support</h2>

            <p>Low- and middle-income countries face a double burden. Many patients still struggle to access the right antibiotics when they genuinely need them, while weak controls can allow poor-quality or inappropriate medicines to circulate. This creates a dangerous gap: under-treatment and overuse can exist in the same health system.</p>

            <p>For African countries, the AMR agenda is especially important because health systems are already managing pressure from malaria, tuberculosis, HIV, maternal health needs and recurrent outbreaks. If first-line medicines become less reliable, routine care becomes more expensive and more dangerous.</p>

            <p>The World Health Assembly’s decision is therefore not just a technical health policy update. It is a warning that the world must protect the medicines it already has while developing stronger systems for the future.</p>

            <p><strong>Source reference:</strong> WHO reported that countries approved the Global Action Plan on Antimicrobial Resistance for 2026–2036 at the Seventy-ninth World Health Assembly.</p>
            """
        ).strip(),
    },
]


class Command(BaseCommand):
    help = "Seed authentic, long-form foreign/world news articles with related featured images."

    def add_arguments(self, parser):
        parser.add_argument("--author-email", default="desk@solakuti.com")
        parser.add_argument("--author-name", default="Solakuti World Desk")
        parser.add_argument("--skip-images", action="store_true")
        parser.add_argument("--refresh-images", action="store_true")

    def handle(self, *args, **options):
        author = self.get_author(options["author_email"], options["author_name"])
        category, _ = Category.objects.get_or_create(
            name="World News",
            defaults={"description": "International affairs, global conflict, diplomacy and major world developments."},
        )

        session = requests.Session()
        session.headers.update({"User-Agent": "SolakutiForeignNewsSeeder/1.0"})

        created = 0
        updated = 0
        images_attached = 0

        for story in FOREIGN_STORIES:
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

        self.stdout.write(self.style.SUCCESS("Foreign news seed complete."))
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
