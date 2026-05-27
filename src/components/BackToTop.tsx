"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(scrollTop > 600);
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (!visible) return null;

  const circumference = 2 * Math.PI * 18;
  const offset = circumference - progress * circumference;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 grid size-12 place-items-center rounded-full bg-[#111] text-white shadow-xl transition hover:bg-red-600 sm:size-13"
      aria-label="Back to top"
    >
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" />
        <circle
          cx="22"
          cy="22"
          r="18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-150"
        />
      </svg>
      <ArrowUp className="size-5" />
    </button>
  );
}
