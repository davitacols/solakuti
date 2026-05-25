import Image from "next/image";
import { Trophy } from "lucide-react";
import { SportsTeam } from "@/types/sports";

type TeamBadgeProps = {
  team: SportsTeam;
  align?: "left" | "right";
  compact?: boolean;
};

export default function TeamBadge({ team, align = "left", compact = false }: TeamBadgeProps) {
  return (
    <div className={`flex min-w-0 items-center gap-1.5 sm:gap-2 ${align === "right" ? "justify-end text-right" : ""}`}>
      {align === "right" && <span className="min-w-0 truncate text-xs font-black text-[#111] sm:text-sm">{compact ? team.short_name || team.name : team.name}</span>}
      <span className="grid size-7 shrink-0 place-items-center overflow-hidden border border-black/10 bg-white sm:size-9">
        {team.crest_url ? (
          <Image src={team.crest_url} alt="" width={28} height={28} className="h-5 w-5 object-contain sm:h-7 sm:w-7" />
        ) : (
          <Trophy className="size-4 text-black/38" />
        )}
      </span>
      {align === "left" && <span className="min-w-0 truncate text-xs font-black text-[#111] sm:text-sm">{compact ? team.short_name || team.name : team.name}</span>}
    </div>
  );
}
