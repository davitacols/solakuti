"use client";

import { useState } from "react";
import { ChevronDown, Trophy } from "lucide-react";
import MatchCard from "@/components/sports/MatchCard";
import { SportsFixture } from "@/types/sports";
import { cn } from "@/lib/utils";

type LeagueGroupProps = {
  title: string;
  fixtures: SportsFixture[];
};

export default function LeagueGroup({ title, fixtures }: LeagueGroupProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (!fixtures.length) return null;

  const liveCount = fixtures.filter((f) => f.status === "live" || f.status === "halftime").length;
  const logo = fixtures[0]?.competition.logo_url;

  return (
    <section className="overflow-hidden rounded-xl border border-black/8 bg-[#faf8f4]">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between gap-2 border-b border-black/8 bg-white px-3 py-3 text-left transition hover:bg-[#faf8f4] sm:gap-3 sm:px-4 sm:py-3.5"
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-md bg-[#faf8f4] ring-1 ring-black/8 sm:size-8 sm:rounded-lg">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="size-4 object-contain sm:size-5" />
            ) : (
              <Trophy className="size-3 text-black/30 sm:size-3.5" />
            )}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-xs font-black text-[#111] sm:text-sm">{title}</h2>
            <p className="mt-0.5 text-[10px] font-medium text-black/35 sm:text-[11px]">
              {fixtures.length} match{fixtures.length === 1 ? "" : "es"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {liveCount > 0 && (
            <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[9px] font-black text-white sm:px-2 sm:text-[10px]">
              {liveCount} live
            </span>
          )}
          <ChevronDown className={cn("size-3.5 text-black/30 transition sm:size-4", collapsed && "-rotate-90")} />
        </div>
      </button>

      {!collapsed && (
        <div className="grid gap-2 p-2 sm:grid-cols-2 sm:gap-3 sm:p-3">
          {fixtures.map((fixture) => (
            <MatchCard key={fixture.id} fixture={fixture} />
          ))}
        </div>
      )}
    </section>
  );
}
