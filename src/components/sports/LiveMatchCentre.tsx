"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Gauge, Info, MapPin, Radio, RefreshCw, Shirt, Trophy } from "lucide-react";
import LoadingLink from "@/components/LoadingLink";
import LeagueGroup from "@/components/sports/LeagueGroup";
import LineupPanel from "@/components/sports/LineupPanel";
import MatchStatsPanel from "@/components/sports/MatchStatsPanel";
import MatchTimeline from "@/components/sports/MatchTimeline";
import MomentumPanel from "@/components/sports/MomentumPanel";
import TeamBadge from "@/components/sports/TeamBadge";
import { getSportsFixture } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Article } from "@/types/article";
import { SportsFixture } from "@/types/sports";

type LiveMatchCentreProps = {
  initialFixture: SportsFixture;
  nearbyFixtures: SportsFixture[];
  relatedArticles?: Article[];
};

const tabs = [
  { id: "overview", label: "Overview", icon: Radio },
  { id: "stats", label: "Stats", icon: Gauge },
  { id: "lineups", label: "Lineups", icon: Shirt },
  { id: "info", label: "Info", icon: Info }
] as const;

type MatchTab = typeof tabs[number]["id"];

function statusLabel(status: string) {
  if (status === "live") return "Live";
  if (status === "halftime") return "Half-time";
  if (status === "finished") return "Full-time";
  if (status === "scheduled") return "Scheduled";
  return status;
}

function showScore(fixture: SportsFixture) {
  return fixture.status === "live" || fixture.status === "halftime" || fixture.status === "finished";
}

function minutesSince(value?: string | null) {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
}

export default function LiveMatchCentre({ initialFixture, nearbyFixtures, relatedArticles = [] }: LiveMatchCentreProps) {
  const [fixture, setFixture] = useState(initialFixture);
  const [activeTab, setActiveTab] = useState<MatchTab>("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const kickoff = useMemo(() => new Date(fixture.kickoff_at), [fixture.kickoff_at]);
  const isLive = fixture.status === "live" || fixture.status === "halftime";
  const syncedMinutesAgo = minutesSince(fixture.last_synced_at);
  const isStale = syncedMinutesAgo !== null && syncedMinutesAgo > (isLive ? 8 : 35);
  const eventCount = fixture.events?.length ?? 0;
  const statCount = fixture.statistics?.length ?? 0;
  const lineupCount = fixture.lineups?.length ?? 0;

  async function refreshFixture(silent = false) {
    if (!silent) {
      setIsRefreshing(true);
    }
    try {
      const nextFixture = await getSportsFixture(String(fixture.id));
      if (nextFixture) {
        setFixture(nextFixture);
        setLastUpdated(new Date());
      }
    } finally {
      if (!silent) {
        setIsRefreshing(false);
      }
    }
  }

  useEffect(() => {
    const interval = window.setInterval(() => refreshFixture(true), isLive ? 15000 : 45000);
    return () => window.clearInterval(interval);
  }, [fixture.id, isLive]);

  return (
    <>
      <section className="border-b border-black/10 bg-[#0d0d0d] text-white">
        <div className="container-page py-8">
          <LoadingLink href="/livescores" className="text-xs font-black uppercase tracking-[0.18em] text-white/55 transition hover:text-white">
            Live scores
          </LoadingLink>
          <div className="mt-8 overflow-hidden border border-white/12 bg-white text-[#111] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 bg-[#f5f1ea] px-5 py-4">
              <LoadingLink href={`/livescores/competition/${fixture.competition.slug}`} className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
                {fixture.competition.name}
              </LoadingLink>
              <div className="flex flex-wrap items-center gap-2">
                {lastUpdated && (
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-black/35">
                    Updated {new Intl.DateTimeFormat("en-NG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(lastUpdated)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => refreshFixture()}
                  className="inline-flex h-8 items-center gap-1.5 border border-black/10 bg-white px-2.5 text-[10px] font-black uppercase tracking-[0.12em] transition hover:border-black hover:bg-black hover:text-white"
                >
                  <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
                  Refresh
                </button>
                <span className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-white",
                  isLive ? "bg-red-600" : "bg-black"
                )}>
                  <Radio className={cn("size-3 text-white", isLive && "animate-pulse")} />
                  {statusLabel(fixture.status)} {fixture.minute !== null ? `${fixture.minute}'` : ""}
                </span>
              </div>
            </div>
            <div className="p-5 sm:p-8">
              <div className="grid grid-cols-[minmax(0,1fr)_96px_minmax(0,1fr)] items-center gap-3">
                <TeamBadge team={fixture.home_team} />
                <div className={cn("text-center text-4xl font-black tracking-[-0.06em] sm:text-5xl", isLive && "text-red-600")}>
                  {showScore(fixture) ? `${fixture.home_score} - ${fixture.away_score}` : "vs"}
                </div>
                <TeamBadge team={fixture.away_team} align="right" />
              </div>
              <div className="mt-8 grid gap-3 border-t border-black/10 pt-5 text-sm font-bold text-black/55 sm:grid-cols-3">
                <span className="inline-flex items-center gap-2"><CalendarClock className="size-4" />{new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(kickoff)}</span>
                {(fixture.venue_detail?.name || fixture.venue) && <span className="inline-flex items-center gap-2"><MapPin className="size-4" />{fixture.venue_detail?.name || fixture.venue}</span>}
                <span className="inline-flex items-center gap-2"><Trophy className="size-4" />{fixture.round_name || "Fixture"}</span>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {[
                  ["Events", `${eventCount}`],
                  ["Stats", `${statCount}`],
                  ["Lineups", `${lineupCount}`]
                ].map(([label, value]) => (
                  <div key={label} className="border border-black/8 bg-[#f7f4ef] px-3 py-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-black/35">{label}</p>
                    <p className="mt-1 truncate text-sm font-black text-[#111]">{value}</p>
                  </div>
                ))}
              </div>
              {isStale && (
                <div className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  Live data is taking longer than expected to update. Scores may refresh shortly.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-8 py-8 xl:grid-cols-[minmax(0,760px)_1fr]">
        <div className="space-y-6">
          <div className="sticky top-[72px] z-20 overflow-x-auto border border-black/10 bg-white/95 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.08)] backdrop-blur">
            <div className="flex min-w-max gap-2">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    "inline-flex h-11 items-center gap-2 px-4 text-sm font-black transition",
                    activeTab === id ? "bg-[#111] text-white" : "bg-[#f5f1ea] text-black/55 hover:bg-red-600 hover:text-white"
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "overview" && (
            <>
              <MomentumPanel fixture={fixture} />
              <section>
                <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-red-600">Match timeline</p>
                <MatchTimeline events={fixture.events ?? []} />
              </section>
              <MatchStatsPanel fixture={fixture} compact />
              <LeagueGroup title="More from these teams" fixtures={nearbyFixtures} />
            </>
          )}
          {activeTab === "stats" && <MatchStatsPanel fixture={fixture} />}
          {activeTab === "lineups" && <LineupPanel fixture={fixture} />}
          {activeTab === "info" && (
            <div className="border border-black/10 bg-white p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Match info</p>
              <div className="mt-4 grid gap-3 text-sm font-bold text-black/58 sm:grid-cols-2">
                {fixture.season?.name && <p>Season: {fixture.season.name}</p>}
                {fixture.referee && <p>Referee: {fixture.referee}</p>}
                {fixture.attendance !== null && <p>Attendance: {fixture.attendance.toLocaleString()}</p>}
                {fixture.venue_detail?.city && <p>City: {fixture.venue_detail.city}</p>}
                {fixture.status_reason && <p>Status note: {fixture.status_reason}</p>}
                {fixture.home_manager && <p>{fixture.home_team.name} manager: {fixture.home_manager}</p>}
                {fixture.away_manager && <p>{fixture.away_team.name} manager: {fixture.away_manager}</p>}
              </div>
            </div>
          )}
        </div>
        <aside className="space-y-5 self-start">
          <div className="border border-black/10 bg-white p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Match facts</p>
            <div className="mt-4 space-y-3 text-sm font-bold text-black/55">
              <p>Competition: <span className="text-[#111]">{fixture.competition.name}</span></p>
              {fixture.round_name && <p>Round: <span className="text-[#111]">{fixture.round_name}</span></p>}
              {fixture.referee && <p>Referee: <span className="text-[#111]">{fixture.referee}</span></p>}
              {(fixture.venue_detail?.name || fixture.venue) && <p>Venue: <span className="text-[#111]">{fixture.venue_detail?.name || fixture.venue}</span></p>}
            </div>
          </div>
          <LineupPanel fixture={fixture} />
          <LeagueGroup title="Related fixtures" fixtures={nearbyFixtures.slice(0, 3)} />
          <div className="border border-black/10 bg-white p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Related news</p>
            <div className="mt-4 divide-y divide-black/10">
              {relatedArticles.slice(0, 4).map((article) => (
                <LoadingLink key={article.id} href={`/article/${article.slug}`} className="block py-4 transition hover:text-red-600">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-black/35">{article.category}</p>
                  <p className="mt-1 text-sm font-black leading-5 tracking-[-0.02em]">{article.title}</p>
                </LoadingLink>
              ))}
              {!relatedArticles.length && (
                <p className="py-4 text-sm font-bold text-black/45">
                  Match stories will appear here when articles mention either team or this competition.
                </p>
              )}
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
