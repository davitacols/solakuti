import type { Metadata } from "next";
import { Activity, CalendarDays, ChevronRight, Trophy } from "lucide-react";
import { notFound } from "next/navigation";
import LoadingLink from "@/components/LoadingLink";
import LeagueGroup from "@/components/sports/LeagueGroup";
import TeamBadge from "@/components/sports/TeamBadge";
import { getLatestArticles, getSportsTeams, getTeamFixtures } from "@/lib/api";
import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { getTeamArticles } from "@/lib/sports-news";

type TeamPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

function isLiveStatus(status: string) {
  return status === "live" || status === "halftime";
}

function resultForTeam(fixture: Awaited<ReturnType<typeof getTeamFixtures>>[number], teamId: number) {
  if (fixture.status !== "finished") return null;
  const isHome = fixture.home_team.id === teamId;
  const teamScore = isHome ? fixture.home_score : fixture.away_score;
  const opponentScore = isHome ? fixture.away_score : fixture.home_score;
  if (teamScore > opponentScore) return "W";
  if (teamScore < opponentScore) return "L";
  return "D";
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { slug } = await params;
  const teams = await getSportsTeams();
  const team = teams.find((item) => item.slug === slug);
  return team
    ? buildPageMetadata({
        title: `${team.name} Fixtures and Results`,
        description: `Follow ${team.name} fixtures, results and match updates on Solakuti Sports.`,
        path: `/livescores/team/${team.slug}`,
        image: team.crest_url,
        imageAlt: `${team.name} team page`
      })
    : { title: "Team not found" };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { slug } = await params;
  const [teams, fixtures, latestArticles] = await Promise.all([getSportsTeams(), getTeamFixtures(slug), getLatestArticles()]);
  const team = teams.find((item) => item.slug === slug);

  if (!team) {
    notFound();
  }

  const liveFixtures = fixtures.filter((fixture) => isLiveStatus(fixture.status));
  const upcomingFixtures = fixtures.filter((fixture) => fixture.status === "scheduled");
  const resultFixtures = fixtures.filter((fixture) => fixture.status === "finished");
  const nextFixture = upcomingFixtures[0] ?? liveFixtures[0];
  const form = resultFixtures
    .slice(-5)
    .map((fixture) => resultForTeam(fixture, team.id))
    .filter(Boolean);
  const relatedArticles = getTeamArticles(latestArticles, team, 6);

  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: team.name,
    sport: "Football",
    url: `${SITE_URL}/livescores/team/${team.slug}`,
    logo: team.crest_url || undefined
  };

  return (
    <main className="bg-[#f8f5ef]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="border-b border-black/10 bg-white">
        <div className="container-page py-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Team centre</p>
          <div className="mt-5">
            <TeamBadge team={team} />
          </div>
          <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.07em] text-[#111] sm:text-7xl">
            {team.name}
          </h1>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="border border-black/10 bg-[#f7f4ef] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-black/42">Country</p>
              <p className="mt-2 text-xl font-black tracking-[-0.04em]">{team.country || "Football"}</p>
            </div>
            <div className="border border-black/10 bg-[#f7f4ef] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-black/42">Form</p>
              <div className="mt-2 flex gap-1">
                {form.length ? form.map((item, index) => (
                  <span
                    key={`${item}-${index}`}
                    className={`grid size-7 place-items-center rounded-full text-xs font-black text-white ${
                      item === "W" ? "bg-emerald-600" : item === "D" ? "bg-zinc-500" : "bg-red-600"
                    }`}
                  >
                    {item}
                  </span>
                )) : <p className="text-xl font-black tracking-[-0.04em]">-</p>}
              </div>
            </div>
            <div className="border border-black/10 bg-[#111] p-4 text-white">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">Next up</p>
              <p className="mt-2 truncate text-xl font-black tracking-[-0.04em]">
                {nextFixture ? `${nextFixture.home_team.short_name || nextFixture.home_team.name} vs ${nextFixture.away_team.short_name || nextFixture.away_team.name}` : "No fixture"}
              </p>
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              ["Live", liveFixtures.length],
              ["Upcoming", upcomingFixtures.length],
              ["Results", resultFixtures.length]
            ].map(([label, value]) => (
              <div key={label} className="border border-black/10 bg-white px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-black/42">{label}</p>
                <p className="mt-1 text-2xl font-black tracking-[-0.06em]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-8 py-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <p className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-red-600">
            <CalendarDays className="size-4" />
            Fixtures and results
          </p>
          <LeagueGroup title="Live now" fixtures={liveFixtures} />
          <LeagueGroup title="Upcoming fixtures" fixtures={upcomingFixtures} />
          <LeagueGroup title="Recent results" fixtures={resultFixtures.slice(-10).reverse()} />
          {!fixtures.length && (
            <div className="border border-dashed border-black/15 bg-white p-6 text-sm font-bold text-black/45">
              No fixtures are available for this team yet. They will appear after the next sports sync.
            </div>
          )}
        </div>
        <aside className="space-y-5 self-start">
          {nextFixture && (
            <LoadingLink
              href={`/livescores/match/${nextFixture.id}`}
              className="block border border-black/10 bg-[#111] p-5 text-white transition hover:bg-red-600"
            >
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/55">
                <Activity className="size-4" />
                Next match
              </p>
              <p className="mt-3 text-lg font-black leading-6 tracking-[-0.04em]">
                {nextFixture.home_team.short_name || nextFixture.home_team.name} vs {nextFixture.away_team.short_name || nextFixture.away_team.name}
              </p>
              <p className="mt-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/55">
                Match centre <ChevronRight className="size-4" />
              </p>
            </LoadingLink>
          )}
          <div className="border border-black/10 bg-white p-5">
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-red-600">
              <Trophy className="size-4" />
              Team news
            </p>
            <div className="mt-4 divide-y divide-black/10">
              {relatedArticles.map((article) => (
                <LoadingLink key={article.id} href={`/article/${article.slug}`} className="block py-4 transition hover:text-red-600">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-black/35">{article.category}</p>
                  <p className="mt-1 text-sm font-black leading-5 tracking-[-0.02em]">{article.title}</p>
                </LoadingLink>
              ))}
              {!relatedArticles.length && <p className="py-4 text-sm font-bold text-black/45">Team stories will appear here when articles mention {team.name} or related sports keywords.</p>}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
