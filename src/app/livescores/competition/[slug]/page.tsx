import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Activity, BarChart3, CalendarDays, CheckCircle2, ChevronRight, ListOrdered, Newspaper, Shield, Trophy, Users } from "lucide-react";
import { notFound } from "next/navigation";
import LoadingLink from "@/components/LoadingLink";
import LeagueGroup from "@/components/sports/LeagueGroup";
import StandingsTable from "@/components/sports/StandingsTable";
import { getCompetitionFixtures, getCompetitionStandings, getLatestArticles, getSportsCompetitions } from "@/lib/api";
import { SITE_URL, breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import { getCompetitionArticles } from "@/lib/sports-news";

type CompetitionPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ view?: string }>;
};

export const dynamic = "force-dynamic";

const tabs = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "fixtures", label: "Fixtures", icon: CalendarDays },
  { id: "results", label: "Results", icon: CheckCircle2 },
  { id: "standings", label: "Standings", icon: ListOrdered },
  { id: "teams", label: "Teams", icon: Users },
  { id: "news", label: "News", icon: Newspaper }
] as const;

function fixtureDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export async function generateMetadata({ params }: CompetitionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const competitions = await getSportsCompetitions();
  const competition = competitions.find((item) => item.slug === slug);
  return competition
    ? buildPageMetadata({
        title: `${competition.name} Live Scores`,
        description: `Follow ${competition.name} fixtures, live scores, results and table on Solakuti Sports.`,
        path: `/livescores/competition/${competition.slug}`,
        image: competition.logo_url,
        imageAlt: `${competition.name} live scores`
      })
    : { title: "Competition not found" };
}

export default async function CompetitionPage({ params, searchParams }: CompetitionPageProps) {
  const { slug } = await params;
  const view = ((await searchParams)?.view ?? "overview").toLowerCase();
  const [competitions, fixtures, standings, latestArticles] = await Promise.all([
    getSportsCompetitions(),
    getCompetitionFixtures(slug),
    getCompetitionStandings(slug),
    getLatestArticles()
  ]);
  const competition = competitions.find((item) => item.slug === slug);

  if (!competition) {
    notFound();
  }

  const liveFixtures = fixtures.filter((fixture) => fixture.status === "live" || fixture.status === "halftime");
  const resultFixtures = fixtures.filter((fixture) => fixture.status === "finished");
  const upcomingFixtures = fixtures.filter((fixture) => fixture.status !== "finished");
  const finished = resultFixtures.length;
  const upcoming = upcomingFixtures.length;
  const teams = Array.from(
    new Map(
      [
        ...standings.map((standing) => standing.team),
        ...fixtures.flatMap((fixture) => [fixture.home_team, fixture.away_team])
      ].map((team) => [team.id, team])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));
  const relatedArticles = getCompetitionArticles(latestArticles, competition, 6);
  const topTable = standings.slice(0, 4);
  const nextFixture = upcomingFixtures[0] ?? null;
  const activeView = tabs.some((tab) => tab.id === view) ? view : "overview";
  const schema = [
    breadcrumbJsonLd([
      { name: "Home", url: SITE_URL },
      { name: "Live Scores", url: `${SITE_URL}/livescores` },
      { name: competition.name, url: `${SITE_URL}/livescores/competition/${competition.slug}` }
    ]),
    {
      "@context": "https://schema.org",
      "@type": "SportsOrganization",
      name: competition.name,
      sport: "Football",
      url: `${SITE_URL}/livescores/competition/${competition.slug}`,
      logo: competition.logo_url || undefined
    }
  ];

  return (
    <main className="min-w-0 overflow-x-hidden bg-[#f8f5ef]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="border-b border-black/10 bg-[#0d0d0d] text-white">
        <div className="container-page min-w-0 py-8 sm:py-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-red-400">
            <Trophy className="size-4" />
            Competition
          </p>
          <h1 className="mt-5 max-w-5xl text-4xl font-black leading-[0.96] tracking-[-0.045em] sm:text-7xl sm:leading-[0.92] sm:tracking-[-0.07em]">
            {competition.name}
          </h1>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="border border-white/10 bg-white/[0.06] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">Country</p>
              <p className="mt-2 text-2xl font-black tracking-[-0.05em]">{competition.country || "Football"}</p>
            </div>
            <div className="border border-white/10 bg-white/[0.06] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">Live / Upcoming</p>
              <p className="mt-2 text-2xl font-black tracking-[-0.05em]">{liveFixtures.length} / {upcoming}</p>
            </div>
            <div className="border border-white/10 bg-white/[0.06] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">Results</p>
              <p className="mt-2 text-2xl font-black tracking-[-0.05em]">{finished}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-[72px] z-20 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="container-page overflow-x-auto py-3 scrollbar-hide">
          <div className="flex min-w-max gap-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <LoadingLink
                key={id}
                href={`/livescores/competition/${competition.slug}${id === "overview" ? "" : `?view=${id}`}`}
                className={`inline-flex h-11 items-center gap-2 border px-4 text-sm font-black transition ${
                  activeView === id
                    ? "border-[#111] bg-[#111] text-white"
                    : "border-black/10 bg-[#f8f5ef] text-black/55 hover:border-red-600 hover:bg-white hover:text-red-600"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </LoadingLink>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page grid min-w-0 gap-6 py-6 sm:gap-8 sm:py-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0 space-y-6 sm:space-y-8">
          {activeView === "overview" && (
            <>
              <div className="grid gap-4 lg:grid-cols-3">
                <OverviewCard label="Live matches" value={liveFixtures.length} icon={Activity} />
                <OverviewCard label="Teams tracked" value={teams.length} icon={Shield} />
                <OverviewCard label="Table rows" value={standings.length} icon={BarChart3} />
              </div>
              {nextFixture && (
                <LoadingLink href={`/livescores/match/${nextFixture.id}`} className="block min-w-0 border border-black/10 bg-white p-4 transition hover:-translate-y-1 hover:border-red-600 sm:p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Next match</p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-black tracking-[-0.04em] text-[#111] sm:text-2xl sm:tracking-[-0.05em]">
                        {nextFixture.home_team.name} vs {nextFixture.away_team.name}
                      </h2>
                      <p className="mt-2 text-sm font-bold text-black/45">{fixtureDateLabel(nextFixture.kickoff_at)} - {nextFixture.venue || "Venue TBC"}</p>
                    </div>
                    <ChevronRight className="size-5 text-black/25" />
                  </div>
                </LoadingLink>
              )}
              <LeagueGroup title="Live and upcoming" fixtures={[...liveFixtures, ...upcomingFixtures].slice(0, 8)} />
            </>
          )}

          {activeView === "fixtures" && (
            <SectionBlock eyebrow="Fixtures" icon={CalendarDays}>
              <LeagueGroup title={`${competition.name} fixtures`} fixtures={upcomingFixtures} />
            </SectionBlock>
          )}

          {activeView === "results" && (
            <SectionBlock eyebrow="Results" icon={CheckCircle2}>
              <LeagueGroup title={`${competition.name} results`} fixtures={resultFixtures} />
            </SectionBlock>
          )}

          {activeView === "standings" && (
            <SectionBlock eyebrow="Standings" icon={ListOrdered}>
              <StandingsTable standings={standings} />
            </SectionBlock>
          )}

          {activeView === "teams" && (
            <SectionBlock eyebrow="Teams" icon={Users}>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {teams.map((team) => (
                  <LoadingLink key={team.id} href={`/livescores/team/${team.slug}`} className="flex min-w-0 items-center gap-3 border border-black/10 bg-white p-4 transition hover:-translate-y-1 hover:border-red-600">
                    <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[#f8f5ef] ring-1 ring-black/10">
                      {team.crest_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={team.crest_url} alt="" className="size-full object-contain p-1" />
                      ) : (
                        <Shield className="size-5 text-black/30" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black text-[#111]">{team.name}</span>
                      <span className="mt-1 block truncate text-xs font-bold text-black/40">{team.country || competition.country || "Football"}</span>
                    </span>
                  </LoadingLink>
                ))}
                {!teams.length && <p className="text-sm font-bold text-black/45">Teams will appear as soon as fresh football data is available.</p>}
              </div>
            </SectionBlock>
          )}

          {activeView === "news" && (
            <CompetitionNews articles={relatedArticles} />
          )}
        </div>
        <aside className="min-w-0 space-y-6">
          {activeView !== "standings" && (
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-red-600">
                  <ListOrdered className="size-4" />
                  Table preview
                </p>
                <LoadingLink
                  href={`/livescores/competition/${competition.slug}?view=standings`}
                  className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-black/45 transition hover:border-black hover:bg-black hover:text-white"
                >
                  Full table
                </LoadingLink>
              </div>
              <StandingsTable standings={topTable} compact />
            </div>
          )}
          <CompetitionNews articles={relatedArticles.slice(0, 3)} compact />
        </aside>
      </section>
    </main>
  );
}

function OverviewCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Activity }) {
  return (
    <div className="border border-black/10 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-black/42">{label}</p>
        <Icon className="size-5 text-red-600" />
      </div>
      <p className="mt-4 text-4xl font-black tracking-[-0.06em] text-[#111]">{value}</p>
    </div>
  );
}

function SectionBlock({ eyebrow, icon: Icon, children }: { eyebrow: string; icon: typeof Activity; children: ReactNode }) {
  return (
    <div>
      <p className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-red-600">
        <Icon className="size-4" />
        {eyebrow}
      </p>
      {children}
    </div>
  );
}

function CompetitionNews({ articles, compact = false }: { articles: Awaited<ReturnType<typeof getLatestArticles>>; compact?: boolean }) {
  return (
    <div className="border border-black/10 bg-white p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Competition news</p>
      <div className={`mt-4 grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
        {articles.map((article) => (
          <LoadingLink key={article.id} href={`/article/${article.slug}`} className="border border-black/10 p-4 transition hover:-translate-y-1 hover:border-red-600">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-black/35">{article.category}</p>
            <p className="mt-2 text-sm font-black leading-5 tracking-[-0.02em]">{article.title}</p>
          </LoadingLink>
        ))}
        {!articles.length && <p className="text-sm font-bold text-black/45">Related articles will appear here.</p>}
      </div>
    </div>
  );
}
