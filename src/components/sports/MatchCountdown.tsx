"use client";

import { useEffect, useState } from "react";

type MatchCountdownProps = {
  kickoff: string;
  className?: string;
};

function getCountdown(kickoff: string) {
  const diff = new Date(kickoff).getTime() - Date.now();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${minutes}m`;
}

export default function MatchCountdown({ kickoff, className }: MatchCountdownProps) {
  const [countdown, setCountdown] = useState(getCountdown(kickoff));

  useEffect(() => {
    const interval = setInterval(() => setCountdown(getCountdown(kickoff)), 60000);
    return () => clearInterval(interval);
  }, [kickoff]);

  if (!countdown) return null;

  return <span className={className}>in {countdown}</span>;
}
