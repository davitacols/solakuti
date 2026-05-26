import type { Metadata } from "next";
import { Activity, CalendarClock, ChevronRight, Radio, ShieldCheck, Trophy } from "lucide-react";
import BreakingNewsBar from "@/components/BreakingNewsBar";
import LoadingLink from "@/components/LoadingLink";
import LiveScoreBoard from "@/components/sports/LiveScoreBoard";
import StandingsTable from "@/components/sports/StandingsTable";
import TeamBadge from "@/components/sports/TeamBadge";
import { getCompetitionStandings, getLatestArticles, getLiveFixtures, getResultFixtures, getSportsCompetitions, getTodayFixtures, getUpcomingFixtures } from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo";
import { getSportsArticles } from "@/lib/sports-news";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Live Scores",
  description: "Follow live football scores, fixtures, results, league tables and match centres on Solakuti Sports.",
  path: "/livescores",
  imageAlt: "Solakuti Sports live scores"
});

export default async function LiveScoresPage() {
  const [latestArticles, liveFixtures, todayFixtures, upcomingFixtures, resultFixtures, competitions] = await Promise.all([
    getLatestArticles(),
    getLiveFixtures(),
    getTodayFixtures(),
    getUpcomingFixtures(),
    getResultFixtures(),
    getSportsCompetitions()
  ]);

  const featuredCompetitions = competitions.filter((c) => c.is_featured).slice(0, 6);
  const headlineFixture = liveFixtures[0] ?? todayFixtures[0] ?? upcomingFixtures[0] ?? resultFixtures[0] ?? null;
  const secondaryFixtures = [...liveFixtures, ...todayFixtures].filter((f) => f.id !== headlineFixture?.id).slice(0, 3);
  const tableCompetition = headlineFixture?.competition ?? featuredCompetitions[0] ?? competitions[0] ?? null;
  const tablePreview = tableCompetition ? await getCompetitionStandings(tableCompetition.slug) : [];
  const sportsArticles = getSportsArticles(latestArticles, 6);
  const breakingFixtures = [...liveFixtures, ...todayFixtures, ...upcomingFixtures.slice(0, 4), ...resultFixtures.slice(0, 4)]
    .filter((fixture, index, items) => items.findIndex((item) => item.id === fixture.id) === index)
    .slice(0, 8);

  const stats = [
    { label: "Live", value: liveFixtures.length, icon: Radio, dot: "bg-red-500" },
    { label: "Today", value: todayFixtures.length, icon: Activity, dot: "bg-emerald-500" },
    { label: "Upcoming", value: upcomingFixtures.length, icon: CalendarClock, dot: "bg-blue-500" },
    { label: "Results", value: resultFixtures.length, icon: ShieldCheck, dot: "bg-amber-500" }
  ];

  return (
    <main className="min-w-0 overflow-x-hidden">
      <BreakingNewsBar articles={latestArticles} fixtures={breakingFixtures} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0a0a0a] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        {liveFixtures.length > 0 && (
          <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-red-600/10 blur-[120px]" />
        )}

        <div className="container-page relative min-w-0 py-8 sm:py-12 lg:py-16">
          <div className="grid min-w-0 gap-6 lg:gap-8 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em]">
                <Radio className={`size-3.5 text-red-500 ${liveFixtures.length > 0 ? "animate-pulse" : ""}`} />
                <span className="text-white/70">Solakuti Sports</span>
                {liveFixtures.length > 0 && (
                  <span className="ml-1 rounded-full bg-red-600 px-2 py-0.5 text-[9px] text-white">{liveFixtures.length} LIVE</span>
                )}
              </div>

              <h1 className="mt-5 max-w-3xl text-3xl font-black leading-[0.96] tracking-[-0.04em] sm:mt-6 sm:text-5xl sm:leading-[0.92] lg:text-7xl">
                Live football<br />
                <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">command centre.</span>
              </h1>

              <p className="mt-5 max-w-lg text-sm font-medium leading-6 text-white/50">
                Real-time scores, fixtures, results and league tables from top competitions worldwide.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:flex-wrap sm:gap-6">
                {stats.map(({ label, value, dot }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className={`size-2 shrink-0 rounded-full ${dot}`} />
                    <span className="text-xl font-black tracking-[-0.04em] sm:text-2xl">{value}</span>
                    <span className="text-xs font-medium text-white/45 sm:text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Headline fixture card */}
            <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-sm sm:rounded-2xl">
              <div className="overflow-hidden rounded-lg bg-white text-[#111] shadow-2xl sm:rounded-xl">
                <div className="border-b border-black/8 bg-gradient-to-r from-[#f8f5ef] to-white px-4 py-3 sm:px-5 sm:py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-red-600 sm:text-[11px] sm:tracking-[0.16em]">Featured match</p>
                    <span className="rounded-full bg-[#111] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white sm:px-3 sm:text-[10px] sm:tracking-[0.12em]">
                      {liveFixtures.length + todayFixtures.length + upcomingFixtures.length + resultFixtures.length} total
                    </span>
                  </div>
                </div>

                {headlineFixture ? (
                  <LoadingLink href={`/livescores/match/${headlineFixture.id}`} className="block p-4 transition hover:bg-black/[0.02] sm:p-5">
                    <p className="truncate text-[11px] font-black uppercase tracking-[0.12em] text-black/40 sm:text-xs sm:tracking-[0.14em]">
                      {headlineFixture.competition.name}
                    </p>
                    <div className="mt-4 grid grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)] items-center gap-1.5 sm:mt-5 sm:grid-cols-[minmax(0,1fr)_70px_minmax(0,1fr)] sm:gap-3">
                      <TeamBadge team={headlineFixture.home_team} compact />
                      <div className="text-center">
                        {headlineFixture.status === "scheduled" ? (
                          <p className="text-base font-black text-black/30 sm:text-lg">vs</p>
                        ) : (
                          <p className={`text-xl font-black tracking-[-0.04em] sm:text-3xl ${headlineFixture.status === "live" || headlineFixture.status === "halftime" ? "text-red-600" : ""}`}>
                            {headlineFixture.home_score} - {headlineFixture.away_score}
                          </p>
                        )}
                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-black uppercase sm:text-[10px] ${headlineFixture.status === "live" || headlineFixture.status === "halftime" ? "bg-red-600 text-white" : "bg-black/5 text-black/40"}`}>
                          {headlineFixture.status === "live" ? `${headlineFixture.minute ?? ""}'` : headlineFixture.status === "halftime" ? "HT" : headlineFixture.status === "finished" ? "FT" : "Scheduled"}
                        </span>
                      </div>
                      <TeamBadge team={headlineFixture.away_team} align="right" compact />
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-black/8 pt-3 text-[10px] font-bold text-black/40 sm:mt-5 sm:pt-4 sm:text-[11px]">
                      <span className="truncate">{headlineFixture.round_name || headlineFixture.venue || "Match centre"}</span>
                      <ChevronRight className="size-4 shrink-0" />
                    </div>
                  </LoadingLink>
                ) : (
                  <div className="p-4 sm:p-5">
                    <p className="text-base font-black tracking-[-0.04em] sm:text-lg">No matches available yet.</p>
                    <p className="mt-2 text-sm text-black/50">Matches appear here when data is available.</p>
                  </div>
                )}

                {secondaryFixtures.length > 0 && (
                  <div className="border-t border-black/8 bg-[#faf8f4]">
                    {secondaryFixtures.map((fixture) => (
                      <LoadingLink
                        key={fixture.id}
                        href={`/livescores/match/${fixture.id}`}
                        className="flex items-center gap-2.5 border-b border-black/5 px-4 py-2.5 last:border-b-0 hover:bg-white sm:gap-3 sm:px-5 sm:py-3"
                      >
                        <span className={`size-1.5 shrink-0 rounded-full sm:size-2 ${fixture.status === "live" || fixture.status === "halftime" ? "animate-pulse bg-red-600" : "bg-black/15"}`} />
                        <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-[#111] sm:text-xs">
                          {fixture.home_team.short_name || fixture.home_team.name}
                          {" "}
                          <span className="font-black">
                            {fixture.status === "scheduled" ? "vs" : `${fixture.home_score}-${fixture.away_score}`}
                          </span>
                          {" "}
                          {fixture.away_team.short_name || fixture.away_team.name}
                        </span>
                        <span className="hidden shrink-0 text-[10px] font-black uppercase text-black/35 sm:inline">
                          {fixture.status === "live" ? `${fixture.minute ?? ""}'` : fixture.status === "halftime" ? "HT" : fixture.competition.name}
                        </span>
                      </LoadingLink>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competition strip */}
      <section className="border-b border-black/10 bg-white">
        <div className="container-page py-4 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-red-600 sm:text-[11px] sm:tracking-[0.16em]">Competitions</p>
              <h2 className="mt-0.5 text-base font-black tracking-[-0.03em] text-[#111] sm:mt-1 sm:text-xl">League centres</h2>
            </div>
            <LoadingLink href="/livescores" className="hidden shrink-0 rounded-full bg-[#111] px-4 py-2 text-xs font-black text-white transition hover:bg-red-600 sm:inline-flex">
              All matches
            </LoadingLink>
          </div>
          <div className="mt-3 overflow-x-auto scrollbar-hide sm:mt-4">
            <div className="flex gap-2">
              {competitions.slice(0, 14).map((competition) => (
                <LoadingLink
                  key={competition.id}
                  href={`/livescores/competition/${competition.slug}`}
                  className="group flex shrink-0 items-center gap-2 rounded-lg border border-black/8 bg-[#faf8f4] px-3 py-2.5 text-xs font-bold text-[#111] transition hover:-translate-y-0.5 hover:border-red-600/30 hover:bg-white hover:shadow-lg sm:gap-2.5 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
                >
                  <span className="grid size-6 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-black/8 sm:size-8">
                    {competition.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={competition.logo_url} alt="" className="size-4 object-contain sm:size-5" />
                    ) : (
                      <Trophy className="size-3 text-black/30 sm:size-3.5" />
                    )}
                  </span>
                  <span className="max-w-[100px] truncate sm:max-w-[120px]">{competition.name}</span>
                  <ChevronRight className="hidden size-3.5 text-black/20 transition group-hover:text-red-600 sm:block" />
                </LoadingLink>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="container-page grid min-w-0 gap-6 py-6 sm:gap-8 sm:py-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <LiveScoreBoard
          liveFixtures={liveFixtures}
          todayFixtures={todayFixtures}
          upcomingFixtures={upcomingFixtures}
          resultFixtures={resultFixtures}
        />

        <aside className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
            <div className="border-b-2 border-[#111] px-5 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-red-600">Featured</p>
              <h3 className="mt-1 text-lg font-black tracking-[-0.03em] text-[#111]">Top leagues</h3>
            </div>
            <div className="divide-y divide-black/6">
              {featuredCompetitions.map((competition) => (
                <LoadingLink
                  key={competition.id}
                  href={`/livescores/competition/${competition.slug}`}
                  className="group flex items-center gap-3 px-5 py-4 transition hover:bg-[#faf8f4]"
                >
                  <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-black/8 bg-white">
                    {competition.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={competition.logo_url} alt="" className="size-6 object-contain" />
                    ) : (
                      <Trophy className="size-4 text-black/30" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-[#111]">{competition.name}</p>
                    <p className="mt-0.5 text-xs font-medium text-black/40">{competition.country || "International"}</p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-black/20 transition group-hover:text-red-600" />
                </LoadingLink>
              ))}
              {!featuredCompetitions.length && (
                <div className="px-5 py-6 text-sm font-bold text-black/40">No competitions available yet.</div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
            <div className="flex items-center justify-between gap-3 border-b-2 border-[#111] px-5 py-4">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-red-600">Table</p>
                <h3 className="mt-1 truncate text-lg font-black tracking-[-0.03em] text-[#111]">
                  {tableCompetition?.name ?? "Standings"}
                </h3>
              </div>
              {tableCompetition && (
                <LoadingLink href={`/livescores/competition/${tableCompetition.slug}`} className="shrink-0 rounded-full border border-black/10 px-3 py-1.5 text-xs font-black transition hover:border-black hover:bg-black hover:text-white">
                  Full table
                </LoadingLink>
              )}
            </div>
            <div className="p-3">
              <StandingsTable standings={tablePreview.slice(0, 8)} compact />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl bg-[#111] p-5 text-white">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/40">Sports wire</p>
            <h3 className="mt-1 text-lg font-black tracking-[-0.03em]">Latest stories</h3>
            <div className="mt-4 divide-y divide-white/8">
              {sportsArticles.slice(0, 4).map((article) => (
                <LoadingLink key={article.id} href={`/article/${article.slug}`} className="group block py-4 first:pt-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/30">{article.category}</p>
                  <p className="mt-1.5 text-sm font-bold leading-snug text-white/85 transition group-hover:text-red-400">{article.title}</p>
                </LoadingLink>
              ))}
              {!sportsArticles.length && (
                <p className="py-4 text-sm font-medium text-white/40">Sports headlines will appear here.</p>
              )}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

