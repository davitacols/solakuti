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
    <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
      <div className="overflow-x-auto">
        <table className={`w-full text-sm ${compact ? "min-w-[420px]" : "min-w-[640px]"}`}>
          <thead className="bg-[#111] text-white">
            <tr>
              {(compact ? ["#", "Team", "P", "GD", "Pts"] : ["#", "Team", "P", "W", "D", "L", "GD", "Pts", "Form"]).map((head) => (
                <th key={head} className="px-3 py-3 text-left text-xs font-black uppercase tracking-[0.14em]">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => (
              <tr key={row.id} className="border-b border-black/8 last:border-b-0">
                <td className="px-3 py-3 font-black text-black/45">{row.position}</td>
                <td className="px-3 py-3 font-black text-[#111]">{row.team.name}</td>
                <td className="px-3 py-3 font-bold text-black/58">{row.played}</td>
                {!compact && <td className="px-3 py-3 font-bold text-black/58">{row.won}</td>}
                {!compact && <td className="px-3 py-3 font-bold text-black/58">{row.drawn}</td>}
                {!compact && <td className="px-3 py-3 font-bold text-black/58">{row.lost}</td>}
                <td className="px-3 py-3 font-bold text-black/58">{row.goal_difference}</td>
                <td className="px-3 py-3 font-black text-[#111]">{row.points}</td>
                {!compact && <td className="px-3 py-3 font-bold text-black/48">{row.form}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
