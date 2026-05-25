import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LiveMatchCentre from "@/components/sports/LiveMatchCentre";
import { getSportsFixture, getTeamFixtures } from "@/lib/api";
import { SITE_URL, buildPageMetadata } from "@/lib/seo";

type MatchPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const fixture = await getSportsFixture(id);
  if (!fixture) {
    return { title: "Match not found" };
  }
  return buildPageMetadata({
    title: `${fixture.home_team.name} vs ${fixture.away_team.name}`,
    description: `Follow ${fixture.home_team.name} vs ${fixture.away_team.name} live scores, lineups, events and stats on Solakuti Sports.`,
    path: `/livescores/match/${fixture.id}`,
    image: fixture.home_team.crest_url || fixture.away_team.crest_url || fixture.competition.logo_url,
    imageAlt: `${fixture.home_team.name} vs ${fixture.away_team.name}`
  });
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;
  const fixture = await getSportsFixture(id);

  if (!fixture) {
    notFound();
  }

  const [homeFixtures, awayFixtures] = await Promise.all([
    getTeamFixtures(fixture.home_team.slug),
    getTeamFixtures(fixture.away_team.slug)
  ]);
  const nearbyFixtures = [...homeFixtures, ...awayFixtures]
    .filter((item, index, items) => item.id !== fixture.id && items.findIndex((entry) => entry.id === item.id) === index)
    .slice(0, 4);
  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${fixture.home_team.name} vs ${fixture.away_team.name}`,
    startDate: fixture.kickoff_at,
    eventStatus: fixture.status === "finished" ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled",
    location: fixture.venue ? { "@type": "Place", name: fixture.venue } : undefined,
    competitor: [
      { "@type": "SportsTeam", name: fixture.home_team.name },
      { "@type": "SportsTeam", name: fixture.away_team.name }
    ],
    organizer: { "@type": "SportsOrganization", name: fixture.competition.name },
    url: `${SITE_URL}/livescores/match/${fixture.id}`
  };

  return (
    <main className="bg-[#f8f5ef]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <LiveMatchCentre initialFixture={fixture} nearbyFixtures={nearbyFixtures} />
    </main>
  );
}
