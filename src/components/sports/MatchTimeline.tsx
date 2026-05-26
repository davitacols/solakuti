import { ArrowLeftRight, BadgeAlert, Circle, Goal, MonitorCheck, ShieldAlert, Square } from "lucide-react";
import { SportsFixtureEvent } from "@/types/sports";

type MatchTimelineProps = {
  events: SportsFixtureEvent[];
};

function eventMeta(type: SportsFixtureEvent["event_type"]) {
  if (type === "goal" || type === "own_goal") return { icon: Goal, tone: "bg-red-600 text-white" };
  if (type === "red_card") return { icon: ShieldAlert, tone: "bg-red-700 text-white" };
  if (type === "yellow_card" || type === "card") return { icon: Square, tone: "bg-yellow-400 text-black" };
  if (type === "substitution") return { icon: ArrowLeftRight, tone: "bg-emerald-600 text-white" };
  if (type === "var") return { icon: MonitorCheck, tone: "bg-blue-600 text-white" };
  if (type === "penalty" || type === "missed_penalty") return { icon: BadgeAlert, tone: "bg-black text-white" };
  return { icon: Circle, tone: "bg-black text-white" };
}

function eventPeriod(event: SportsFixtureEvent) {
  if (event.period) return event.period;
  if (event.minute === null) return "Match notes";
  if (event.minute <= 45) return "First half";
  if (event.minute <= 90) return "Second half";
  return "Extra time";
}

export default function MatchTimeline({ events }: MatchTimelineProps) {
  if (!events.length) {
    return (
      <div className="rounded-lg border border-dashed border-black/15 bg-white p-6 text-sm font-bold text-black/45">
        Match events will appear here once the live desk updates the fixture.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
      {Object.entries(
        events.reduce<Record<string, SportsFixtureEvent[]>>((groups, event) => {
          const period = eventPeriod(event);
          groups[period] = [...(groups[period] ?? []), event];
          return groups;
        }, {})
      ).map(([period, periodEvents]) => (
        <div key={period} className="border-b border-black/10 last:border-b-0">
          <div className="bg-[#f7f4ef] px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-black/38">
            {period}
          </div>
          {periodEvents.map((event) => {
            const { icon: Icon, tone } = eventMeta(event.event_type);
            const minute = event.minute !== null
              ? `${event.minute}${event.extra_minute ? `+${event.extra_minute}` : ""}'`
              : "-";
            return (
              <div key={event.id} className="grid grid-cols-[54px_32px_minmax(0,1fr)] gap-3 border-b border-black/8 px-4 py-4 last:border-b-0">
                <span className="text-sm font-black text-red-600">{minute}</span>
                <span className={`grid size-8 place-items-center rounded-full ${tone}`}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-black tracking-[-0.02em] text-[#111]">{event.player_name || event.event_type.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-sm leading-5 text-black/52">
                    {event.team?.name ? `${event.team.name} - ` : ""}
                    {event.detail || event.event_type.replaceAll("_", " ")}
                    {event.related_player_name ? ` (${event.related_player_name})` : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
