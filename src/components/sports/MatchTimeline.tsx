import { Circle, Goal, Square } from "lucide-react";
import { SportsFixtureEvent } from "@/types/sports";

type MatchTimelineProps = {
  events: SportsFixtureEvent[];
};

function eventIcon(type: SportsFixtureEvent["event_type"]) {
  if (type === "goal") return Goal;
  if (type === "card") return Square;
  return Circle;
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
    <div className="rounded-lg border border-black/10 bg-white">
      {events.map((event) => {
        const Icon = eventIcon(event.event_type);
        return (
          <div key={event.id} className="grid grid-cols-[54px_32px_minmax(0,1fr)] gap-3 border-b border-black/8 px-4 py-4 last:border-b-0">
            <span className="text-sm font-black text-red-600">{event.minute !== null ? `${event.minute}'` : "-"}</span>
            <span className="grid size-8 place-items-center rounded-full bg-black text-white">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="font-black tracking-[-0.02em] text-[#111]">{event.player_name || event.event_type}</p>
              <p className="mt-1 text-sm leading-5 text-black/52">
                {event.team?.name ? `${event.team.name} - ` : ""}
                {event.detail || event.event_type}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
