"use client";

import { useEffect, useState } from "react";

type RelativeTimeProps = {
  date: string;
  className?: string;
};

function getRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-NG", { month: "short", day: "numeric" }).format(new Date(dateStr));
}

export default function RelativeTime({ date, className }: RelativeTimeProps) {
  const [text, setText] = useState(getRelative(date));

  useEffect(() => {
    const interval = setInterval(() => setText(getRelative(date)), 60000);
    return () => clearInterval(interval);
  }, [date]);

  return <time dateTime={date} className={className}>{text}</time>;
}
