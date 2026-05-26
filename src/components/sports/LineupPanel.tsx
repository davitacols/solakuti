import TeamBadge from "@/components/sports/TeamBadge";
import { SportsFixture } from "@/types/sports";

type LineupPanelProps = {
  fixture: SportsFixture;
};

export default function LineupPanel({ fixture }: LineupPanelProps) {
  const lineups = fixture.lineups ?? [];
  const home = lineups.filter((item) => item.team.id === fixture.home_team.id);
  const away = lineups.filter((item) => item.team.id === fixture.away_team.id);

  if (!lineups.length) {
    return (
      <div className="border border-dashed border-black/15 bg-white p-5 text-sm font-bold text-black/45">
        Lineups will appear here when available.
      </div>
    );
  }

  return (
    <div className="border border-black/10 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Lineups</p>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-black/38">
          {fixture.home_formation || "-"} / {fixture.away_formation || "-"}
        </p>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {[
          { team: fixture.home_team, manager: fixture.home_manager, rows: home },
          { team: fixture.away_team, manager: fixture.away_manager, rows: away }
        ].map(({ team, manager, rows }) => {
          const starters = rows.filter((row) => row.is_starting);
          const bench = rows.filter((row) => !row.is_starting);
          return (
            <div key={team.id} className="min-w-0">
              <TeamBadge team={team} />
              {manager && <p className="mt-2 text-xs font-bold text-black/42">Manager: {manager}</p>}
              <div className="mt-4 space-y-3">
                {[
                  { label: "Starting XI", rows: starters },
                  { label: "Bench", rows: bench }
                ].map((group) => (
                  <div key={group.label} className="border border-black/8">
                    <div className="border-b border-black/8 bg-[#f7f4ef] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-black/38">
                      {group.label}
                    </div>
                    <div className="divide-y divide-black/8">
                      {group.rows.map((row) => (
                        <div key={row.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                          <span className="min-w-0 truncate font-black text-[#111]">
                            {row.shirt_number ? `${row.shirt_number}. ` : ""}{row.player_name}{row.is_captain ? " (C)" : ""}
                          </span>
                          <span className="shrink-0 text-xs font-bold uppercase tracking-[0.1em] text-black/38">
                            {row.position || (row.is_starting ? "XI" : "Sub")}
                          </span>
                        </div>
                      ))}
                      {!group.rows.length && (
                        <p className="px-3 py-3 text-xs font-bold text-black/38">Not available yet.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
