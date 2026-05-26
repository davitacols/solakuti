import { SportsFixture, SportsFixtureStatistic } from "@/types/sports";

type MatchStatsPanelProps = {
  fixture: SportsFixture;
  compact?: boolean;
};

function numericValue(stat: SportsFixtureStatistic, side: "home" | "away") {
  const value = side === "home" ? stat.home_numeric : stat.away_numeric;
  if (value !== null && value !== undefined && value !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const raw = side === "home" ? stat.home_value : stat.away_value;
  const parsed = Number(String(raw).replace("%", ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function MatchStatsPanel({ fixture, compact = false }: MatchStatsPanelProps) {
  const statistics = fixture.statistics ?? [];
  const xgStats = fixture.home_xg || fixture.away_xg
    ? [{ id: -1, name: "Expected goals", home_value: fixture.home_xg ?? "-", away_value: fixture.away_xg ?? "-", group: "Attack", fixture: fixture.id, home_numeric: fixture.home_xg, away_numeric: fixture.away_xg, updated_at: fixture.updated_at }]
    : [];
  const rows = compact ? [...xgStats, ...statistics].slice(0, 6) : [...xgStats, ...statistics];

  if (!rows.length) {
    return (
      <div className="border border-dashed border-black/15 bg-white p-5 text-sm font-bold text-black/45">
        Match statistics will appear here when they are available.
      </div>
    );
  }

  return (
    <div className="border border-black/10 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Match stats</p>
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-black/35">
          {rows.length} metric{rows.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="mt-4 space-y-4">
        {rows.map((stat) => {
          const home = numericValue(stat, "home");
          const away = numericValue(stat, "away");
          const total = Math.max(home + away, 1);
          return (
            <div key={`${stat.id}-${stat.name}`}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm font-black">
                <span>{stat.home_value || "-"}</span>
                <span className="text-xs uppercase tracking-[0.14em] text-black/42">{stat.name}</span>
                <span>{stat.away_value || "-"}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="h-2 bg-black/8">
                  <div className="ml-auto h-full bg-red-600" style={{ width: `${(home / total) * 100}%` }} />
                </div>
                <div className="h-2 bg-black/8">
                  <div className="h-full bg-[#111]" style={{ width: `${(away / total) * 100}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
