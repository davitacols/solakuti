import { SportsStanding } from "@/types/sports";

type StandingsTableProps = {
  standings: SportsStanding[];
  compact?: boolean;
};

export default function StandingsTable({ standings, compact = false }: StandingsTableProps) {
  if (!standings.length) {
    return (
      <div className="rounded-lg border border-dashed border-black/15 bg-white p-5 text-sm font-bold text-black/45">
        Standings are not available yet.
      </div>
    );
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-black/10 bg-white">
      <div className="overflow-x-auto">
        <table className={`w-full text-xs sm:text-sm ${compact ? "min-w-[340px] sm:min-w-[420px]" : "min-w-[560px] sm:min-w-[640px]"}`}>
          <thead className="bg-[#111] text-white">
            <tr>
              {(compact ? ["#", "Team", "P", "GD", "Pts"] : ["#", "Team", "P", "W", "D", "L", "GD", "Pts", "Form"]).map((head) => (
                <th key={head} className="px-2 py-3 text-left text-[10px] font-black uppercase tracking-[0.1em] sm:px-3 sm:text-xs sm:tracking-[0.14em]">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => (
              <tr key={row.id} className="border-b border-black/8 last:border-b-0">
                <td className="px-2 py-3 font-black text-black/45 sm:px-3">{row.position}</td>
                <td className="px-2 py-3 font-black text-[#111] sm:px-3">{row.team.name}</td>
                <td className="px-2 py-3 font-bold text-black/58 sm:px-3">{row.played}</td>
                {!compact && <td className="px-2 py-3 font-bold text-black/58 sm:px-3">{row.won}</td>}
                {!compact && <td className="px-2 py-3 font-bold text-black/58 sm:px-3">{row.drawn}</td>}
                {!compact && <td className="px-2 py-3 font-bold text-black/58 sm:px-3">{row.lost}</td>}
                <td className="px-2 py-3 font-bold text-black/58 sm:px-3">{row.goal_difference}</td>
                <td className="px-2 py-3 font-black text-[#111] sm:px-3">{row.points}</td>
                {!compact && <td className="px-2 py-3 font-bold text-black/48 sm:px-3">{row.form}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
