"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Mail, MessageCircle } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import { subscribeToNewsletter } from "@/lib/api";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const response = await subscribeToNewsletter(email.trim());
    setBusy(false);
    setMessage(response?.message ?? "Subscription failed. Please try again.");
    if (response?.success) {
      setEmail("");
    }
  }

  async function handleNotificationOptIn() {
    if (!("Notification" in window)) {
      setMessage("Push notifications are not supported on this browser.");
      return;
    }
    const permission = await Notification.requestPermission();
    setMessage(permission === "granted" ? "Notifications enabled on this device." : "Notifications were not enabled.");
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="container-page py-12"
    >
      <div className="grid overflow-hidden rounded-lg bg-[#111] text-white editorial-shadow lg:grid-cols-[1fr_0.75fr]">
        <div className="p-7 sm:p-10 lg:p-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-red-300">
            <Mail className="size-4" />
            The Morning Signal
          </div>
          <h2 className="mt-5 max-w-2xl text-4xl font-black leading-none tracking-[-0.06em] sm:text-5xl">
            A sharper Nigerian briefing before the day gets loud.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/68">
            Politics, markets, security and culture, edited for readers who need context before commentary.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col justify-end gap-3 border-t border-white/10 p-7 sm:p-10 lg:border-l lg:border-t-0">
          <label htmlFor="newsletter-email" className="text-sm font-bold text-white/72">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            className="h-14 rounded-md border border-white/12 bg-white px-4 text-base font-semibold text-black outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
          />
          <LoadingButton
            type="submit"
            loading={busy}
            className="h-14 rounded-md bg-red-600 px-5 text-sm font-black uppercase tracking-[0.14em] transition hover:bg-white hover:text-black"
          >
            Subscribe
          </LoadingButton>
          {message && <p className="text-sm font-bold text-white/72">{message}</p>}
          <div className="grid gap-2 pt-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleNotificationOptIn}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/12 text-xs font-black uppercase tracking-[0.12em] text-white/76 transition hover:border-white hover:text-white"
            >
              <Bell className="size-4" />
              Alerts
            </button>
            <a
              href="https://wa.me/?text=Follow%20Solakuti%20for%20premium%20Nigerian%20news%20and%20analysis."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/12 text-xs font-black uppercase tracking-[0.12em] text-white/76 transition hover:border-white hover:text-white"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
          </div>
        </form>
      </div>
    </motion.section>
  );
}
