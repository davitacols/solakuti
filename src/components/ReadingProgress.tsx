"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
    }
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (progress === 0) return null;

  return (
    <div className="fixed left-0 top-0 z-50 h-[3px] w-full">
      <div
        className="h-full bg-red-600 transition-[width] duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
