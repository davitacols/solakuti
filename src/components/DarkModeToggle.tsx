"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("solakuti-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("solakuti-theme", next ? "dark" : "light");
  }

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className="grid size-10 place-items-center rounded-full border border-black/10 bg-white/80 text-black transition hover:border-black hover:bg-black hover:text-white dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white dark:hover:text-black lg:size-11"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
