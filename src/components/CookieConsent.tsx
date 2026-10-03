"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "solakuti-cookie-consent";
const CONSENT_EVENT = "solakuti-cookie-consent-change";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    window.dispatchEvent(new Event(CONSENT_EVENT));
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, "declined");
    window.dispatchEvent(new Event(CONSENT_EVENT));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-5xl rounded-2xl border border-black/10 bg-white/95 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-5 lg:flex lg:items-center lg:gap-8"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black tracking-[-0.01em] text-[#111]">Your privacy, your choice</p>
        <p className="mt-1 text-xs leading-5 text-black/60 sm:text-sm sm:leading-6">
          We use cookies for audience analytics and to support advertising. You can accept them or continue without optional cookies.{" "}
          <Link
            href="/privacy-policy"
            className="font-bold text-[#111] underline decoration-black/25 underline-offset-2 hover:text-red-600"
          >
            Privacy policy
          </Link>
          {" · "}
          <a
            href="https://optout.aboutads.info/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#111] underline decoration-black/25 underline-offset-2 hover:text-red-600"
          >
            Ad choices
          </a>
        </p>
      </div>
      <div className="mt-4 grid shrink-0 grid-cols-2 gap-2 lg:mt-0 lg:flex">
        <button
          type="button"
          onClick={decline}
          className="min-h-11 rounded-full border border-black/15 px-5 py-2 text-xs font-black uppercase tracking-[0.12em] text-black/55 transition hover:border-black/35 hover:text-black"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={accept}
          className="min-h-11 rounded-full bg-[#111] px-6 py-2 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-600"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
