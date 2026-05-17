"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function sendEvent(name: string, parameters: Record<string, string | number | boolean | undefined>) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || !window.gtag) {
    return;
  }
  window.gtag("event", name, parameters);
}

function AnalyticsEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollMarksRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !window.gtag) {
      return;
    }
    const queryString = searchParams.toString();
    const pagePath = queryString ? `${pathname}?${queryString}` : pathname;

    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title
    });
    scrollMarksRef.current = new Set();
  }, [pathname, searchParams]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      if (!target) {
        return;
      }
      const href = target.getAttribute("href") ?? "";
      if (!href) {
        return;
      }

      if (href.includes("/article/")) {
        sendEvent("article_click", {
          article_path: href,
          link_text: target.textContent?.trim().slice(0, 120)
        });
      }

      const shareProvider = getShareProvider(href);
      if (shareProvider) {
        sendEvent("share_click", {
          method: shareProvider,
          shared_url: href
        });
      }

      if (/^https?:\/\//i.test(href) && !href.includes(window.location.hostname)) {
        sendEvent("outbound_click", {
          link_url: href,
          link_domain: new URL(href).hostname
        });
      }
    }

    function handleScroll() {
      const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (pageHeight <= 0) {
        return;
      }
      const percentage = Math.round((window.scrollY / pageHeight) * 100);
      [50, 90].forEach((mark) => {
        if (percentage >= mark && !scrollMarksRef.current.has(mark)) {
          scrollMarksRef.current.add(mark);
          sendEvent("scroll_depth", {
            percent_scrolled: mark,
            page_path: window.location.pathname
          });
        }
      });
    }

    document.addEventListener("click", handleClick);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return null;
}

function getShareProvider(href: string) {
  if (href.includes("wa.me") || href.includes("whatsapp.com")) {
    return "whatsapp";
  }
  if (href.includes("twitter.com") || href.includes("x.com")) {
    return "x";
  }
  if (href.includes("facebook.com")) {
    return "facebook";
  }
  if (href.startsWith("mailto:")) {
    return "email";
  }
  return null;
}

export default function Analytics() {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="solakuti-ga4" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
      <AnalyticsEvents />
    </>
  );
}
