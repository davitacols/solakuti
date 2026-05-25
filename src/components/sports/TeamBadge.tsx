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
    <div className={`flex min-w-0 items-center gap-2 ${align === "right" ? "justify-end text-right" : ""}`}>
      {align === "right" && <span className="truncate font-black text-[#111]">{compact ? team.short_name || team.name : team.name}</span>}
      <span className="grid size-9 shrink-0 place-items-center overflow-hidden border border-black/10 bg-white">
        {team.crest_url ? (
          <Image src={team.crest_url} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
        ) : (
          <Trophy className="size-4 text-black/38" />
        )}
      </span>
      {align === "left" && <span className="truncate font-black text-[#111]">{compact ? team.short_name || team.name : team.name}</span>}
    </div>
  );
}
