import Image from "next/image";
import { Trophy } from "lucide-react";
import { SportsTeam } from "@/types/sports";

type TeamBadgeProps = {
  team: SportsTeam;
  align?: "left" | "right";
  compact?: boolean;
};

export default function TeamBadge({ team, align = "left", compact = false }: TeamBadgeProps) {
  const name = compact ? team.short_name || team.name : team.name;

  return (
    <div className={`flex min-w-0 items-center gap-1.5 overflow-hidden sm:gap-2 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <span className="grid size-6 shrink-0 place-items-center overflow-hidden rounded-full border border-black/8 bg-white sm:size-8">
        {team.crest_url ? (
          <Image src={team.crest_url} alt="" width={28} height={28} className="size-4 object-contain sm:size-5" />
        ) : (
          <Trophy className="size-3 text-black/30 sm:size-3.5" />
        )}
      </span>
      <span className="min-w-0 max-w-full truncate text-[10px] font-black text-[#111] sm:text-xs">{name}</span>
    </div>
  );
}
