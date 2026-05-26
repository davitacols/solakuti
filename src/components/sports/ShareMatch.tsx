"use client";

import { MessageCircle, Share2, Twitter } from "lucide-react";
import { SportsFixture } from "@/types/sports";

type ShareMatchProps = {
  fixture: SportsFixture;
};

function buildText(fixture: SportsFixture) {
  const home = fixture.home_team.short_name || fixture.home_team.name;
  const away = fixture.away_team.short_name || fixture.away_team.name;
  if (fixture.status === "scheduled") return `${home} vs ${away} - ${fixture.competition.name}`;
  return `${home} ${fixture.home_score}-${fixture.away_score} ${away} - ${fixture.competition.name}`;
}

export default function ShareMatch({ fixture }: ShareMatchProps) {
  const text = encodeURIComponent(buildText(fixture));
  const url = encodeURIComponent(`${typeof window !== "undefined" ? window.location.origin : ""}/livescores/match/${fixture.id}`);

  return (
    <div className="flex items-center gap-1">
      <a
        href={`https://wa.me/?text=${text}%20${url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="grid size-7 place-items-center rounded-full text-black/25 transition hover:bg-black/5 hover:text-green-600"
        aria-label="Share on WhatsApp"
        onClick={(e) => e.stopPropagation()}
      >
        <MessageCircle className="size-3.5" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${text}&url=${url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="grid size-7 place-items-center rounded-full text-black/25 transition hover:bg-black/5 hover:text-blue-500"
        aria-label="Share on X"
        onClick={(e) => e.stopPropagation()}
      >
        <Twitter className="size-3.5" />
      </a>
    </div>
  );
}
