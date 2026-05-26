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
  const featuredCompetitions = competitions.filter((competition) => competition.is_featured).slice(0, 6);
  const headlineFixture = liveFixtures[0] ?? todayFixtures[0] ?? upcomingFixtures[0] ?? resultFixtures[0] ?? null;
  const tableCompetition = headlineFixture?.competition ?? featuredCompetitions[0] ?? competitions[0] ?? null;
  const tablePreview = tableCompetition ? await getCompetitionStandings(tableCompetition.slug) : [];
  const sportsArticles = getSportsArticles(latestArticles, 6);
  const totalMatches = liveFixtures.length + todayFixtures.length + upcomingFixtures.length + resultFixtures.length;
  const statusCards = [
    { label: "Live", value: liveFixtures.length, icon: Radio, tone: "text-red-600" },
    { label: "Today", value: todayFixtures.length, icon: Activity, tone: "text-emerald-600" },
    { label: "Upcoming", value: upcomingFixtures.length, icon: CalendarClock, tone: "text-blue-600" },
    { label: "Results", value: resultFixtures.length, icon: ShieldCheck, tone: "text-white/45" }
  ];

  return (
    <main>
      <BreakingNewsBar articles={latestArticles} />
      <section className="overflow-hidden border-b border-black/10 bg-[#0d0d0d] text-white">
        <div className="container-page py-8 sm:py-12">
          <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-end">
            <div className="min-w-0">
              <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] sm:px-4 sm:text-xs sm:tracking-[0.18em]">
                <Radio className="size-4 text-red-500" />
                Solakuti Sports
              </p>
              <h1 className="mt-5 max-w-5xl text-[2.6rem] font-black leading-[0.92] tracking-[-0.055em] sm:mt-6 sm:text-7xl sm:tracking-[-0.075em] xl:text-8xl">
                Live football command centre.
              </h1>
              <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-7 sm:grid-cols-4 sm:gap-3">
                {statusCards.map(({ label, value, icon: Icon, tone }) => (
                  <div key={label} className="min-w-0 border border-white/10 bg-white/[0.06] p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-[10px] font-black uppercase tracking-[0.13em] text-white/45 sm:text-[11px] sm:tracking-[0.18em]">{label}</p>
                      <Icon className={`size-4 ${tone}`} />
                    </div>
                    <p className="mt-3 text-2xl font-black tracking-[-0.05em] sm:text-3xl sm:tracking-[-0.06em]">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-w-0 border border-white/12 bg-white text-[#111] shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
              <div className="border-b border-black/10 bg-[#f5f1ea] px-4 py-4 sm:px-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-red-600 sm:text-xs sm:tracking-[0.18em]">Main board</p>
                  <span className="shrink-0 rounded-full bg-[#111] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-white sm:px-3 sm:text-[11px] sm:tracking-[0.14em]">
                    {totalMatches} matches
                  </span>
                </div>
              </div>
              {headlineFixture ? (
                <LoadingLink href={`/livescores/match/${headlineFixture.id}`} className="block min-w-0 p-4 transition hover:bg-black/[0.03] sm:p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="truncate text-xs font-black uppercase tracking-[0.16em] text-black/42">
                      {headlineFixture.competition.name}
                    </p>
                    <span className="shrink-0 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-white sm:text-[11px]">
                      {headlineFixture.status === "live" ? "Live" : headlineFixture.status}
                    </span>
                  </div>
                  <div className="mt-5 grid min-w-0 grid-cols-[minmax(0,1fr)_58px_minmax(0,1fr)] items-center gap-2 sm:mt-6 sm:grid-cols-[minmax(0,1fr)_86px_minmax(0,1fr)] sm:gap-3">
                    <TeamBadge team={headlineFixture.home_team} compact />
                    <div className="text-center">
                      <p className="text-xl font-black tracking-[-0.05em] sm:text-3xl sm:tracking-[-0.06em]">
                        {headlineFixture.status === "scheduled" ? "vs" : `${headlineFixture.home_score} - ${headlineFixture.away_score}`}
                      </p>
                    </div>
                    <TeamBadge team={headlineFixture.away_team} align="right" compact />
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-black/10 pt-4 text-[11px] font-black uppercase tracking-[0.1em] text-black/42 sm:text-xs sm:tracking-[0.14em]">
                    <span className="min-w-0 truncate">{headlineFixture.round_name || "Fixture"}</span>
                    <ChevronRight className="size-4" />
                  </div>
                </LoadingLink>
              ) : (
                <div className="p-5">
                  <p className="text-lg font-black tracking-[-0.04em]">No matches synced yet.</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-black/52">Run the sports provider sync to populate the board.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-white">
        <div className="container-page py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-600">Choose competition</p>
              <h2 className="mt-1 text-xl font-black tracking-[-0.04em] text-[#111]">League centres</h2>
            </div>
            <LoadingLink href="/livescores" className="hidden shrink-0 rounded-full bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-600 sm:inline-flex">
              All matches
            </LoadingLink>
          </div>
          <div className="mt-4 overflow-x-auto pb-1">
            <div className="flex min-w-max gap-2">
              {competitions.slice(0, 14).map((competition) => (
                <LoadingLink
                  key={competition.id}
                  href={`/livescores/competition/${competition.slug}`}
                  className="group inline-flex h-12 items-center gap-3 border border-black/10 bg-[#f8f5ef] px-3 text-sm font-black text-[#111] transition hover:-translate-y-0.5 hover:border-red-600 hover:bg-white hover:text-red-600"
                >
                  <span className="grid size-7 place-items-center overflow-hidden rounded-full bg-white text-[10px] ring-1 ring-black/10">
                    {competition.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={competition.logo_url} alt="" className="size-full object-contain" />
                    ) : (
                      <Trophy className="size-3.5 text-black/35" />
                    )}
                  </span>
                  <span className="max-w-36 truncate">{competition.name}</span>
                  <ChevronRight className="size-3.5 text-black/25 transition group-hover:text-red-600" />
                </LoadingLink>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page grid min-w-0 gap-6 py-6 sm:gap-8 sm:py-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <LiveScoreBoard
          liveFixtures={liveFixtures}
          todayFixtures={todayFixtures}
          upcomingFixtures={upcomingFixtures}
          resultFixtures={resultFixtures}
        />
        <aside className="min-w-0 space-y-5">
          <div className="min-w-0 border border-black/10 bg-white">
            <div className="border-b-2 border-black px-5 py-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Competitions</p>
            </div>
            <div className="divide-y divide-black/8">
              {featuredCompetitions.map((competition) => (
                <LoadingLink
                  key={competition.id}
                  href={`/livescores/competition/${competition.slug}`}
                  className="group flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-[#f5f1ea]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black tracking-[-0.02em] text-[#111]">{competition.name}</span>
                    <span className="mt-1 block text-xs font-bold text-black/42">{competition.country || "Football"}</span>
                  </span>
                  <span className="grid size-9 shrink-0 place-items-center border border-black/10 bg-white text-black/42 transition group-hover:border-red-600 group-hover:text-red-600">
                    <Trophy className="size-4" />
                  </span>
                </LoadingLink>
              ))}
              {!featuredCompetitions.length && (
                <div className="px-5 py-6 text-sm font-bold text-black/45">No competitions synced yet.</div>
              )}
            </div>
          </div>

          <div className="min-w-0 border border-black/10 bg-white">
            <div className="flex items-center justify-between gap-3 border-b-2 border-black px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Table watch</p>
                <h3 className="mt-1 truncate text-lg font-black tracking-[-0.04em] text-[#111]">
                  {tableCompetition?.name ?? "Standings"}
                </h3>
              </div>
              {tableCompetition && (
                <LoadingLink href={`/livescores/competition/${tableCompetition.slug}`} className="shrink-0 rounded-full border border-black/10 px-3 py-2 text-xs font-black transition hover:border-black hover:bg-black hover:text-white">
                  Full table
                </LoadingLink>
              )}
            </div>
            <div className="p-3">
              <StandingsTable standings={tablePreview.slice(0, 8)} compact />
            </div>
          </div>

          <div className="min-w-0 border border-black/10 bg-[#111] p-5 text-white">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/42">Sports wire</p>
            <div className="mt-4 divide-y divide-white/10">
              {sportsArticles.slice(0, 4).map((article) => (
                <LoadingLink key={article.id} href={`/article/${article.slug}`} className="block py-4 transition hover:text-red-400">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/35">{article.category}</p>
                  <p className="mt-1 text-sm font-black leading-5 tracking-[-0.02em]">{article.title}</p>
                </LoadingLink>
              ))}
              {!sportsArticles.length && <p className="py-4 text-sm font-bold text-white/45">Sports headlines will appear here when articles mention sports, football, teams or competitions.</p>}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
