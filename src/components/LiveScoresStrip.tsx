"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import { SportsFixture } from "@/types/sports";

type LiveScoresStripProps = {
  fixtures: SportsFixture[];
};

function statusLabel(fixture: SportsFixture) {
  if (fixture.status === "live") return `${fixture.minute ?? ""}′`;
  if (fixture.status === "halftime") return "HT";
  if (fixture.status === "finished") return "FT";
  return new Intl.DateTimeFormat("en-NG", { hour: "2-digit", minute: "2-digit" }).format(new Date(fixture.kickoff_at));
}

export default function LiveScoresStrip({ fixtures }: LiveScoresStripProps) {
  if (!fixtures.length) return null;

  return (
    <section className="border-b border-black/10 bg-white">
      <div className="container-page flex items-center gap-4 overflow-x-auto py-3 scrollbar-hide">
        <div className="flex shrink-0 items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-red-600">
          <Activity className="size-3.5" />
          Live
        </div>
        {fixtures.map((fixture) => (
          <Link
            key={fixture.id}
            href={`/livescores/match/${fixture.id}`}
            className="flex shrink-0 items-center gap-2 rounded-md border border-black/8 px-3 py-1.5 text-xs font-bold text-[#111] transition hover:border-black/20 hover:bg-black/4"
          >
            <span className="max-w-[60px] truncate">{fixture.home_team.short_name || fixture.home_team.name}</span>
            <span className="font-black">
              {fixture.status === "scheduled" ? "vs" : `${fixture.home_score}-${fixture.away_score}`}
            </span>
            <span className="max-w-[60px] truncate">{fixture.away_team.short_name || fixture.away_team.name}</span>
            <span className={`ml-1 text-[10px] font-black uppercase ${fixture.status === "live" || fixture.status === "halftime" ? "text-red-600" : "text-black/40"}`}>
              {statusLabel(fixture)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
