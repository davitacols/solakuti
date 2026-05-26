import { SportsStanding } from "@/types/sports";

type StandingsTableProps = {
  standings: SportsStanding[];
  compact?: boolean;
};

function FormDots({ form }: { form: string }) {
  if (!form) return null;
  const results = form.slice(-5).split("");
  return (
    <div className="flex gap-0.5">
      {results.map((r, i) => (
        <span
          key={i}
          className={`size-2 rounded-full ${r === "W" ? "bg-emerald-500" : r === "D" ? "bg-amber-400" : r === "L" ? "bg-red-500" : "bg-black/10"}`}
        />
      ))}
    </div>
  );
}

export default function StandingsTable({ standings, compact = false }: StandingsTableProps) {
  if (!standings.length) {
    return (
      <div className="rounded-lg border border-dashed border-black/12 bg-[#faf8f4] p-5 text-sm font-bold text-black/40">
        Standings are not available yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-black/8 bg-white">
      <div className="overflow-x-auto">
        <table className={`w-full text-xs ${compact ? "min-w-[340px]" : "min-w-[720px]"}`}>
          <thead>
            <tr className="bg-[#111] text-white">
              {(compact ? ["#", "Team", "P", "GD", "Pts", "Form"] : ["#", "Team", "P", "W", "D", "L", "GF", "GA", "GD", "Pts", "Form"]).map((head) => (
                <th key={head} className="px-2.5 py-2.5 text-left text-[10px] font-black uppercase tracking-[0.1em]">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map((row, i) => (
              <tr key={row.id} className={`border-b border-black/5 last:border-b-0 ${i < 4 ? "bg-emerald-50/40" : ""}`}>
                <td className="px-2.5 py-2.5 font-black text-black/40">{row.position}</td>
                <td className="px-2.5 py-2.5 font-black text-[#111]">
                  <span className="truncate">{row.team.short_name || row.team.name}</span>
                </td>
                <td className="px-2.5 py-2.5 font-medium text-black/55">{row.played}</td>
                {!compact && <td className="px-2.5 py-2.5 font-medium text-black/55">{row.won}</td>}
                {!compact && <td className="px-2.5 py-2.5 font-medium text-black/55">{row.drawn}</td>}
                {!compact && <td className="px-2.5 py-2.5 font-medium text-black/55">{row.lost}</td>}
                {!compact && <td className="px-2.5 py-2.5 font-medium text-black/55">{row.goals_for}</td>}
                {!compact && <td className="px-2.5 py-2.5 font-medium text-black/55">{row.goals_against}</td>}
                <td className="px-2.5 py-2.5 font-bold text-black/55">{row.goal_difference}</td>
                <td className="px-2.5 py-2.5 font-black text-[#111]">{row.points}</td>
                <td className="px-2.5 py-2.5"><FormDots form={row.form} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
