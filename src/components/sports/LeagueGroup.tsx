import MatchCard from "@/components/sports/MatchCard";
import { SportsFixture } from "@/types/sports";

type LeagueGroupProps = {
  title: string;
  fixtures: SportsFixture[];
};

export default function LeagueGroup({ title, fixtures }: LeagueGroupProps) {
  if (!fixtures.length) {
    return null;
  }

  const liveCount = fixtures.filter((fixture) => fixture.status === "live" || fixture.status === "halftime").length;

  return (
    <section className="overflow-hidden border border-black/10 bg-[#f8f5ef]">
      <div className="flex items-center justify-between gap-3 border-b border-black/10 bg-white px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-black uppercase tracking-[0.18em] text-[#111]">{title}</h2>
          <p className="mt-1 text-xs font-bold text-black/38">{fixtures.length} match{fixtures.length === 1 ? "" : "es"} loaded</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {liveCount > 0 && (
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">
              {liveCount} live
            </span>
          )}
          <span className="bg-[#111] px-2.5 py-1 text-[11px] font-black text-white">
            {fixtures.length}
          </span>
        </div>
      </div>
      <div className="grid gap-3 p-3 sm:p-4">
        {fixtures.map((fixture) => (
          <MatchCard key={fixture.id} fixture={fixture} />
        ))}
      </div>
    </section>
  );
}
