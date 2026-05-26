import { Clock, Radio } from "lucide-react";
import LoadingLink from "@/components/LoadingLink";
import MatchCountdown from "@/components/sports/MatchCountdown";
import ShareMatch from "@/components/sports/ShareMatch";
import TeamBadge from "@/components/sports/TeamBadge";
import { SportsFixture } from "@/types/sports";
import { cn } from "@/lib/utils";

type MatchCardProps = {
  fixture: SportsFixture;
};

function statusLabel(fixture: SportsFixture) {
  if (fixture.status === "live") return fixture.minute ? `${fixture.minute}'` : "Live";
  if (fixture.status === "halftime") return "HT";
  if (fixture.status === "finished") return "FT";
  if (fixture.status === "postponed") return "PPD";
  if (fixture.status === "cancelled") return "CAN";
  return new Intl.DateTimeFormat("en-NG", { hour: "2-digit", minute: "2-digit" }).format(new Date(fixture.kickoff_at));
}

function statusStyle(fixture: SportsFixture) {
  if (fixture.status === "live" || fixture.status === "halftime") return "bg-red-600 text-white";
  if (fixture.status === "finished") return "bg-[#111] text-white";
  if (fixture.status === "postponed" || fixture.status === "cancelled") return "bg-amber-100 text-amber-800";
  return "bg-black/5 text-black/50";
}

export default function MatchCard({ fixture }: MatchCardProps) {
  const isLive = fixture.status === "live" || fixture.status === "halftime";
  const isDone = fixture.status === "finished";
  const isScheduled = fixture.status === "scheduled";
  const lastGoal = fixture.events?.filter((e) => e.event_type === "goal" || e.event_type === "own_goal").slice(-1)[0] ?? null;

  return (
    <article className={cn(
      "group overflow-hidden rounded-lg border bg-white transition hover:-translate-y-0.5 hover:shadow-md sm:rounded-xl",
      isLive ? "border-red-500/40 ring-2 ring-red-600/8" : "border-black/8 hover:border-black/20"
    )}>
      <LoadingLink href={`/livescores/match/${fixture.id}`} className="block p-3 sm:p-4">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold text-black/40 sm:text-[11px]">
              {fixture.round_name || new Intl.DateTimeFormat("en-NG", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(fixture.kickoff_at))}
            </p>
          </div>
          <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.06em] sm:px-2.5 sm:py-1 sm:text-[10px] sm:tracking-[0.08em]", statusStyle(fixture))}>
            {isLive && <Radio className="size-2.5 animate-pulse sm:size-3" />}
            {!isLive && fixture.status === "scheduled" && <Clock className="size-2.5 sm:size-3" />}
            {statusLabel(fixture)}
          </span>
        </div>

        {/* Teams and score */}
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_42px_minmax(0,1fr)] items-center gap-1 sm:mt-4 sm:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] sm:gap-2">
          <TeamBadge team={fixture.home_team} compact />
          <div className="text-center">
            <p className={cn(
              "text-lg font-black tracking-[-0.04em] sm:text-2xl",
              isLive ? "text-red-600" : "text-[#111]"
            )}>
              {isLive || isDone ? `${fixture.home_score}-${fixture.away_score}` : "vs"}
            </p>
            {isScheduled && (
              <MatchCountdown kickoff={fixture.kickoff_at} className="mt-1 block text-[9px] font-bold text-black/35 sm:text-[10px]" />
            )}
            {(fixture.home_xg || fixture.away_xg) && (
              <p className="mt-0.5 text-[9px] font-bold text-black/30 sm:text-[10px]">
                xG {fixture.home_xg ?? "-"} - {fixture.away_xg ?? "-"}
              </p>
            )}
            {lastGoal && (
              <p className="mt-1 truncate text-[9px] font-bold text-black/40 sm:text-[10px]">
                Goal {lastGoal.player_name} {lastGoal.minute ? `${lastGoal.minute}'` : ""}
              </p>
            )}
          </div>
          <TeamBadge team={fixture.away_team} align="right" compact />
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-black/6 pt-2.5 text-[10px] font-medium text-black/35 sm:mt-4 sm:pt-3 sm:text-[11px]">
          <span className="truncate">{fixture.venue || fixture.venue_detail?.name || ""}</span>
          <ShareMatch fixture={fixture} />
        </div>
      </LoadingLink>
    </article>
  );
}

