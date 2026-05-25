import type { Metadata } from "next";
import Link from "next/link";
import { Activity, CalendarClock, ChevronRight, Radio, ShieldCheck, Trophy } from "lucide-react";
import BreakingNewsBar from "@/components/BreakingNewsBar";
import LiveScoreBoard from "@/components/sports/LiveScoreBoard";
import StandingsTable from "@/components/sports/StandingsTable";
import TeamBadge from "@/components/sports/TeamBadge";
import { getCompetitionStandings, getLatestArticles, getLiveFixtures, getResultFixtures, getSportsCompetitions, getTodayFixtures, getUpcomingFixtures } from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo";

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
      <section className="border-b border-black/10 bg-[#0d0d0d] text-white">
        <div className="container-page py-8 sm:py-12">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-end">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-black uppercase tracking-[0.18em]">
                <Radio className="size-4 text-red-500" />
                Solakuti Sports
              </p>
              <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[0.9] tracking-[-0.075em] sm:text-7xl xl:text-8xl">
                Live football command centre.
              </h1>
              <div className="mt-7 grid gap-3 sm:grid-cols-4">
                {statusCards.map(({ label, value, icon: Icon, tone }) => (
                  <div key={label} className="border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">{label}</p>
                      <Icon className={`size-4 ${tone}`} />
                    </div>
                    <p className="mt-3 text-3xl font-black tracking-[-0.06em]">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-white/12 bg-white text-[#111] shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
              <div className="border-b border-black/10 bg-[#f5f1ea] px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Main board</p>
                  <span className="rounded-full bg-[#111] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white">
                    {totalMatches} matches
                  </span>
                </div>
              </div>
              {headlineFixture ? (
                <Link href={`/livescores/match/${headlineFixture.id}`} className="block p-5 transition hover:bg-black/[0.03]">
                  <div className="flex items-center justify-between gap-4">
                    <p className="truncate text-xs font-black uppercase tracking-[0.16em] text-black/42">
                      {headlineFixture.competition.name}
                    </p>
                    <span className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-white">
                      {headlineFixture.status === "live" ? "Live" : headlineFixture.status}
                    </span>
                  </div>
                  <div className="mt-6 grid grid-cols-[minmax(0,1fr)_86px_minmax(0,1fr)] items-center gap-3">
                    <TeamBadge team={headlineFixture.home_team} compact />
                    <div className="text-center">
                      <p className="text-3xl font-black tracking-[-0.06em]">
                        {headlineFixture.status === "scheduled" ? "vs" : `${headlineFixture.home_score} - ${headlineFixture.away_score}`}
                      </p>
                    </div>
                    <TeamBadge team={headlineFixture.away_team} align="right" compact />
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4 text-xs font-black uppercase tracking-[0.14em] text-black/42">
                    <span>{headlineFixture.round_name || "Fixture"}</span>
                    <ChevronRight className="size-4" />
                  </div>
                </Link>
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

      <section className="container-page grid gap-8 py-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <LiveScoreBoard
          liveFixtures={liveFixtures}
          todayFixtures={todayFixtures}
          upcomingFixtures={upcomingFixtures}
          resultFixtures={resultFixtures}
        />
        <aside className="space-y-5">
          <div className="border border-black/10 bg-white">
            <div className="border-b-2 border-black px-5 py-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Competitions</p>
            </div>
            <div className="divide-y divide-black/8">
              {featuredCompetitions.map((competition) => (
                <Link
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
                </Link>
              ))}
              {!featuredCompetitions.length && (
                <div className="px-5 py-6 text-sm font-bold text-black/45">No competitions synced yet.</div>
              )}
            </div>
          </div>

          <div className="border border-black/10 bg-white">
            <div className="flex items-center justify-between gap-3 border-b-2 border-black px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Table watch</p>
                <h3 className="mt-1 truncate text-lg font-black tracking-[-0.04em] text-[#111]">
                  {tableCompetition?.name ?? "Standings"}
                </h3>
              </div>
              {tableCompetition && (
                <Link href={`/livescores/competition/${tableCompetition.slug}`} className="shrink-0 rounded-full border border-black/10 px-3 py-2 text-xs font-black transition hover:border-black hover:bg-black hover:text-white">
                  Full table
                </Link>
              )}
            </div>
            <div className="p-3">
              <StandingsTable standings={tablePreview.slice(0, 8)} compact />
            </div>
          </div>

          <div className="border border-black/10 bg-[#111] p-5 text-white">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/42">Sports wire</p>
            <div className="mt-4 divide-y divide-white/10">
              {latestArticles.slice(0, 4).map((article) => (
                <Link key={article.id} href={`/article/${article.slug}`} className="block py-4 transition hover:text-red-400">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/35">{article.category}</p>
                  <p className="mt-1 text-sm font-black leading-5 tracking-[-0.02em]">{article.title}</p>
                </Link>
              ))}
              {!latestArticles.length && <p className="py-4 text-sm font-bold text-white/45">No sports headlines yet.</p>}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
