"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function check() {
      setVisible(window.scrollY > 600);
    }
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 grid size-11 place-items-center rounded-full bg-[#111] text-white shadow-lg transition hover:bg-red-600 sm:size-12"
      aria-label="Back to top"
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
