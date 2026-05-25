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
    if (!silent) {
      setIsRefreshing(true);
    }
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
      if (!silent) {
        setIsRefreshing(false);
      }
    }
  }

  useEffect(() => {
    const interval = window.setInterval(() => refreshFeeds(true), 30000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="min-w-0">
      <div className="mb-5 border-b-2 border-black pb-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Match centre</p>
            <h2 className="mt-2 text-3xl font-black leading-none tracking-[-0.055em] text-[#111] sm:text-5xl">
              Scores and fixtures
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-black text-black/42">{visibleFixtures.length} in view</p>
            {lastUpdated && (
              <p className="text-xs font-black uppercase tracking-[0.14em] text-black/35">
                Updated {new Intl.DateTimeFormat("en-NG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(lastUpdated)}
              </p>
            )}
            <button
              type="button"
              onClick={() => refreshFeeds()}
              className="inline-flex h-10 items-center gap-2 border border-black/10 bg-white px-3 text-xs font-black uppercase tracking-[0.12em] transition hover:border-black hover:bg-black hover:text-white"
            >
              <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="sticky top-[72px] z-20 mb-5 overflow-x-auto border border-black/10 bg-white/94 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.08)] backdrop-blur">
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
              {id === "live" && feeds.live.length > 0 && (
                <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] text-white">{feeds.live.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 grid gap-3 border border-black/10 bg-white p-3 lg:grid-cols-[minmax(0,1fr)_240px]">
        <label className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/35" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search teams, league, venue"
            className="h-11 w-full border border-black/10 bg-[#f8f5ef] pl-10 pr-3 text-sm font-bold outline-none transition focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-600/10"
          />
        </label>
        <select
          value={selectedCompetition}
          onChange={(event) => setSelectedCompetition(event.target.value)}
          className="h-11 min-w-0 border border-black/10 bg-[#f8f5ef] px-3 text-sm font-black outline-none transition focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-600/10"
        >
          <option value="all">All competitions</option>
          {competitions.map((competition) => (
            <option key={competition} value={competition}>{competition}</option>
          ))}
        </select>
      </div>

      {availableDates.length > 1 && (
        <div className="mb-5 overflow-x-auto">
          <div className="flex min-w-max gap-2">
            <button
              type="button"
              onClick={() => setSelectedDate("all")}
              className={cn(
                "h-10 px-4 text-xs font-black uppercase tracking-[0.12em] transition",
                selectedDate === "all" ? "bg-red-600 text-white" : "border border-black/10 bg-white text-black/55 hover:border-black"
              )}
            >
              All dates
            </button>
            {availableDates.map((dateKey) => (
              <button
                key={dateKey}
                type="button"
                onClick={() => setSelectedDate(dateKey)}
                className={cn(
                  "h-10 px-4 text-xs font-black uppercase tracking-[0.12em] transition",
                  selectedDate === dateKey ? "bg-[#111] text-white" : "border border-black/10 bg-white text-black/55 hover:border-black"
                )}
              >
                {fixtureDateLabel(dateKey)}
              </button>
            ))}
          </div>
        </div>
      )}

      {visibleFixtures.length ? (
        <div className="grid gap-4">
          {Object.entries(groupedFixtures).map(([competition, items]) => (
            <LeagueGroup key={competition} title={competition} fixtures={items} />
          ))}
        </div>
      ) : (
        <div className="grid min-h-80 place-items-center border border-dashed border-black/20 bg-[#f8f5ef] p-8 text-center">
          <div>
            <span className="mx-auto grid size-14 place-items-center border border-black/10 bg-white text-black/45">
              {activeTab === "live" ? <Radio className="size-5 text-red-600" /> : <ListFilter className="size-5" />}
            </span>
            <h2 className="mt-4 text-2xl font-black tracking-[-0.05em] text-[#111]">No fixtures here yet</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-black/55">
              Matches will appear here after the next successful sports provider sync.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
