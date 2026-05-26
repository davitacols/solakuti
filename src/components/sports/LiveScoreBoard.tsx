"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarDays, CheckCircle2, Flame, ListFilter, Radio, RefreshCw, Search } from "lucide-react";
import LeagueGroup from "@/components/sports/LeagueGroup";
import { SportsFixture } from "@/types/sports";
import { cn } from "@/lib/utils";
import { getLiveFixtures, getResultFixtures, getTodayFixtures, getUpcomingFixtures } from "@/lib/api";

type LiveScoreBoardProps = {
  liveFixtures: SportsFixture[];
  todayFixtures: SportsFixture[];
  upcomingFixtures: SportsFixture[];
  resultFixtures: SportsFixture[];
};

const tabs = [
  { id: "live", label: "Live", icon: Activity },
  { id: "today", label: "Today", icon: CalendarDays },
  { id: "upcoming", label: "Upcoming", icon: Flame },
  { id: "results", label: "Results", icon: CheckCircle2 }
] as const;

type TabId = typeof tabs[number]["id"];

function groupFixtures(fixtures: SportsFixture[]) {
  return fixtures.reduce<Record<string, SportsFixture[]>>((groups, fixture) => {
    const key = fixture.competition.name;
    groups[key] = [...(groups[key] ?? []), fixture];
    return groups;
  }, {});
}

function fixtureDateKey(fixture: SportsFixture) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date(fixture.kickoff_at));
}

function fixtureDateLabel(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00+01:00`);
  return new Intl.DateTimeFormat("en-NG", { weekday: "short", month: "short", day: "numeric" }).format(date);
}

export default function LiveScoreBoard({ liveFixtures, todayFixtures, upcomingFixtures, resultFixtures }: LiveScoreBoardProps) {
  const [feeds, setFeeds] = useState({
    live: liveFixtures,
    today: todayFixtures,
    upcoming: upcomingFixtures,
    results: resultFixtures
  });
  const [activeTab, setActiveTab] = useState<TabId>(liveFixtures.length ? "live" : "today");
  const [selectedDate, setSelectedDate] = useState("all");
  const [selectedCompetition, setSelectedCompetition] = useState("all");
  const [query, setQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const fixtures = feeds[activeTab];
  const availableDates = useMemo(() => Array.from(new Set(fixtures.map(fixtureDateKey))).slice(0, 8), [fixtures]);
  const competitions = useMemo(
    () => Array.from(new Set(fixtures.map((fixture) => fixture.competition.name))).sort(),
    [fixtures]
  );
  const visibleFixtures = useMemo(
    () => fixtures.filter((fixture) => {
      const matchesDate = selectedDate === "all" || fixtureDateKey(fixture) === selectedDate;
      const matchesCompetition = selectedCompetition === "all" || fixture.competition.name === selectedCompetition;
      const normalizedQuery = query.trim().toLowerCase();
      const haystack = [
        fixture.home_team.name,
        fixture.home_team.short_name,
        fixture.away_team.name,
        fixture.away_team.short_name,
        fixture.competition.name,
        fixture.venue,
        fixture.round_name
      ].join(" ").toLowerCase();
      return matchesDate && matchesCompetition && (!normalizedQuery || haystack.includes(normalizedQuery));
    }),
    [fixtures, query, selectedCompetition, selectedDate]
  );
  const groupedFixtures = useMemo(() => groupFixtures(visibleFixtures), [visibleFixtures]);

  useEffect(() => {
    setSelectedDate("all");
    setSelectedCompetition("all");
    setQuery("");
  }, [activeTab]);

  async function refreshFeeds(silent = false) {
    if (!silent) setIsRefreshing(true);
    try {
      const [live, today, upcoming, results] = await Promise.all([
        getLiveFixtures(),
        getTodayFixtures(),
        getUpcomingFixtures(),
        getResultFixtures()
      ]);
      setFeeds({ live, today, upcoming, results });
      setLastUpdated(new Date());
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }

  useEffect(() => {
    const interval = window.setInterval(() => refreshFeeds(true), 30000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="min-w-0 overflow-hidden">
      {/* Header */}
      <div className="mb-5 border-b-2 border-[#111] pb-4 sm:mb-6 sm:pb-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-600 sm:text-[11px] sm:tracking-[0.18em]">Match centre</p>
            <h2 className="mt-1.5 text-2xl font-black leading-none tracking-[-0.045em] text-[#111] sm:mt-2 sm:text-4xl">
              Scores &amp; fixtures
            </h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {lastUpdated && (
              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-black/35 sm:text-[10px] sm:tracking-[0.1em]">
                {new Intl.DateTimeFormat("en-NG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(lastUpdated)}
              </p>
            )}
            <button
              type="button"
              onClick={() => refreshFeeds()}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-black/10 bg-white px-2.5 text-[11px] font-black transition hover:border-black hover:bg-black hover:text-white sm:h-9 sm:gap-2 sm:px-3 sm:text-xs"
            >
              <RefreshCw className={cn("size-3 sm:size-3.5", isRefreshing && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[72px] z-20 mb-4 rounded-lg border border-black/10 bg-white/95 p-1 shadow-sm backdrop-blur sm:mb-5 sm:rounded-xl sm:p-1.5">
        <div className="grid grid-cols-4 gap-1 sm:flex sm:gap-1.5">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                "inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-black transition sm:h-10 sm:gap-2 sm:rounded-lg sm:px-4 sm:text-sm",
                activeTab === id
                  ? "bg-[#111] text-white shadow-sm"
                  : "text-black/50 hover:bg-[#f5f1ea] hover:text-[#111]"
              )}
            >
              <Icon className="size-3.5 sm:size-4" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.slice(0, 3)}</span>
              {id === "live" && feeds.live.length > 0 && (
                <span className="rounded-full bg-red-600 px-1 py-0.5 text-[9px] text-white sm:px-1.5 sm:text-[10px]">{feeds.live.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 grid gap-2 rounded-lg border border-black/10 bg-white p-2 sm:mb-5 sm:grid-cols-[1fr_200px] sm:gap-3 sm:rounded-xl sm:p-3">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-black/30 sm:size-4" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search teams, league..."
            className="h-9 w-full rounded-md border border-black/8 bg-[#faf8f4] pl-9 pr-3 text-xs font-semibold outline-none transition focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-600/10 sm:h-10 sm:rounded-lg sm:pl-10 sm:text-sm"
          />
        </label>
        <select
          value={selectedCompetition}
          onChange={(e) => setSelectedCompetition(e.target.value)}
          className="h-9 rounded-md border border-black/8 bg-[#faf8f4] px-2.5 text-xs font-bold outline-none transition focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-600/10 sm:h-10 sm:rounded-lg sm:px-3 sm:text-sm"
        >
          <option value="all">All competitions</option>
          {competitions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Date pills */}
      {availableDates.length > 1 && (
        <div className="mb-4 overflow-x-auto scrollbar-hide sm:mb-5">
          <div className="flex gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setSelectedDate("all")}
              className={cn(
                "h-8 shrink-0 rounded-full px-3 text-[11px] font-black transition sm:h-9 sm:px-4 sm:text-xs",
                selectedDate === "all" ? "bg-red-600 text-white" : "border border-black/10 bg-white text-black/50 hover:border-black hover:text-black"
              )}
            >
              All
            </button>
            {availableDates.map((dateKey) => (
              <button
                key={dateKey}
                type="button"
                onClick={() => setSelectedDate(dateKey)}
                className={cn(
                  "h-8 shrink-0 rounded-full px-3 text-[11px] font-black transition sm:h-9 sm:px-4 sm:text-xs",
                  selectedDate === dateKey ? "bg-[#111] text-white" : "border border-black/10 bg-white text-black/50 hover:border-black hover:text-black"
                )}
              >
                {fixtureDateLabel(dateKey)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Match count */}
      <p className="mb-3 text-[11px] font-bold text-black/40 sm:mb-4 sm:text-xs">{visibleFixtures.length} match{visibleFixtures.length === 1 ? "" : "es"} in view</p>

      {/* Fixtures */}
      {visibleFixtures.length ? (
        <div className="grid gap-3 sm:gap-4">
          {Object.entries(groupedFixtures).map(([competition, items]) => (
            <LeagueGroup key={competition} title={competition} fixtures={items} />
          ))}
        </div>
      ) : (
        <div className="grid min-h-48 place-items-center rounded-lg border border-dashed border-black/15 bg-[#faf8f4] p-6 text-center sm:min-h-64 sm:rounded-xl sm:p-8">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-lg border border-black/10 bg-white text-black/40 sm:size-14 sm:rounded-xl">
              {activeTab === "live" ? <Radio className="size-4 text-red-600 sm:size-5" /> : <ListFilter className="size-4 sm:size-5" />}
            </span>
            <h3 className="mt-3 text-lg font-black tracking-[-0.04em] text-[#111] sm:mt-4 sm:text-xl">No fixtures here yet</h3>
            <p className="mt-1.5 max-w-xs text-xs leading-5 text-black/50 sm:mt-2 sm:text-sm sm:leading-6">
              Matches will appear here as soon as fresh football data is available.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
