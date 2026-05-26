import { BarChart3, Clock, Goal, Radio, Shirt } from "lucide-react";
import LoadingLink from "@/components/LoadingLink";
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
  if (fixture.status === "postponed") return "Postponed";
  if (fixture.status === "cancelled") return "Cancelled";
  return new Intl.DateTimeFormat("en-NG", { hour: "2-digit", minute: "2-digit" }).format(new Date(fixture.kickoff_at));
}

function statusTone(fixture: SportsFixture) {
  if (fixture.status === "live" || fixture.status === "halftime") return "bg-red-600 text-white";
  if (fixture.status === "finished") return "bg-[#111] text-white";
  if (fixture.status === "postponed" || fixture.status === "cancelled") return "bg-amber-100 text-amber-800";
  return "bg-black/5 text-black/45";
}

function kickoffLabel(fixture: SportsFixture) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(fixture.kickoff_at));
}

export default function MatchCard({ fixture }: MatchCardProps) {
  const isLive = fixture.status === "live" || fixture.status === "halftime";
  const isDone = fixture.status === "finished";
  const isScheduled = fixture.status === "scheduled";
  const eventCount = fixture.events?.length ?? 0;
  const statCount = fixture.statistics?.length ?? 0;
  const lineupCount = fixture.lineups?.length ?? 0;
  const showDataStrip = eventCount > 0 || statCount > 0 || lineupCount > 0 || fixture.home_formation || fixture.away_formation;

  return (
    <article className={cn(
      "group overflow-hidden border bg-white shadow-[0_18px_50px_rgba(18,18,18,0.06)] transition hover:-translate-y-1",
      isLive ? "border-red-500/50 ring-4 ring-red-600/5" : "border-black/10 hover:border-black/25"
    )}>
      <div className="flex min-w-0 items-center justify-between gap-3 border-b border-black/10 px-3 py-3 sm:px-4">
        <div className="min-w-0">
          <LoadingLink href={`/livescores/competition/${fixture.competition.slug}`} className="block truncate text-[11px] font-black uppercase tracking-[0.12em] text-black/42 transition hover:text-red-600 sm:text-xs sm:tracking-[0.16em]">
            {fixture.competition.name}
          </LoadingLink>
          <p className="mt-1 truncate text-[11px] font-bold text-black/35">{fixture.round_name || kickoffLabel(fixture)}</p>
        </div>
        <span className={cn("inline-flex shrink-0 items-center gap-1 px-2 py-1 text-[10px] font-black uppercase tracking-[0.09em] sm:px-2.5 sm:text-[11px] sm:tracking-[0.12em]", statusTone(fixture))}>
          {isLive ? <Radio className="size-3" /> : <Clock className="size-3" />}
          {statusLabel(fixture)}
        </span>
      </div>

      <LoadingLink href={`/livescores/match/${fixture.id}`} className="block min-w-0 p-3 sm:p-4">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_54px_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_82px_minmax(0,1fr)] sm:gap-3">
          <TeamBadge team={fixture.home_team} compact />
          <div className="text-center">
            <p className={`text-xl font-black tracking-[-0.045em] sm:text-3xl sm:tracking-[-0.06em] ${isLive ? "text-red-600" : "text-[#111]"}`}>
              {isLive || isDone ? `${fixture.home_score} - ${fixture.away_score}` : "vs"}
            </p>
            {isScheduled && <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-black/30">Kickoff</p>}
            {(fixture.home_xg || fixture.away_xg) && (
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-black/35">
                xG {fixture.home_xg ?? "-"} - {fixture.away_xg ?? "-"}
              </p>
            )}
          </div>
          <TeamBadge team={fixture.away_team} align="right" compact />
        </div>
        {showDataStrip && (
          <div className="mt-4 grid gap-2 border-t border-black/8 pt-3 text-[10px] font-black uppercase tracking-[0.09em] text-black/40 sm:grid-cols-3 sm:text-[11px] sm:tracking-[0.12em]">
            <span className="inline-flex items-center gap-1.5"><Goal className="size-3.5" />{eventCount} events</span>
            <span className="inline-flex items-center gap-1.5"><BarChart3 className="size-3.5" />{statCount} stats</span>
            <span className="inline-flex items-center gap-1.5"><Shirt className="size-3.5" />{lineupCount ? "Lineups" : fixture.home_formation || fixture.away_formation || "Teams"}</span>
          </div>
        )}
        <div className="mt-4 flex min-w-0 flex-wrap items-center justify-between gap-2 border-t border-black/8 pt-3 text-xs font-bold text-black/45">
          <span className="min-w-0 truncate">{fixture.venue || fixture.venue_detail?.name || "Venue TBC"}</span>
        </div>
      </LoadingLink>
    </article>
  );
}
