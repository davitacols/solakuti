"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "solakuti-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/10 bg-white px-4 py-4 shadow-xl md:flex md:items-center md:justify-between md:gap-8 md:px-6">
      <p className="text-sm leading-6 text-black/68">
        Solakuti uses cookies — including those placed by Google AdSense — to serve ads and analyse traffic.{" "}
        <Link href="/privacy-policy" className="font-bold underline underline-offset-2 hover:text-black">
          Privacy policy
        </Link>
        .{" "}
        <a
          href="https://optout.aboutads.info/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold underline underline-offset-2 hover:text-black"
        >
          Opt out of personalised ads
        </a>
        .
      </p>
      <div className="mt-4 flex shrink-0 gap-3 md:mt-0">
        <button
          onClick={decline}
          className="rounded-full border border-black/15 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-black/55 transition hover:border-black/35 hover:text-black"
        >
          Decline
        </button>
        <button
          onClick={accept}
          className="rounded-full bg-[#111] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-600"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
