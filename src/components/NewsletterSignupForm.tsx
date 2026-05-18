"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import { subscribeToNewsletter } from "@/lib/api";
import { cn } from "@/lib/utils";

type NewsletterSignupFormProps = {
  source?: string;
  compact?: boolean;
  dark?: boolean;
};

export default function NewsletterSignupForm({
  source = "website",
  compact = false,
  dark = true
}: NewsletterSignupFormProps) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return;
    }

    setBusy(true);
    setMessage(null);
    setSuccess(false);
    const response = await subscribeToNewsletter(trimmedEmail, source, website);
    setBusy(false);
    setMessage(response?.message ?? "Subscription failed. Please try again.");
    setSuccess(Boolean(response?.success));
    if (response?.success) {
      setEmail("");
      setWebsite("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-3", compact && "space-y-2")}>
      <label htmlFor={`newsletter-email-${source}`} className={cn("text-sm font-bold", dark ? "text-white/72" : "text-black/60")}>
        Email address
      </label>
      <input
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        name="website"
        className="hidden"
      />
      <div className={cn("flex gap-2", compact ? "rounded-md bg-white p-1" : "flex-col sm:flex-row")}>
        <div className="relative min-w-0 flex-1">
          {!compact && <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-black/35" />}
          <input
            id={`newsletter-email-${source}`}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            className={cn(
              "h-14 w-full rounded-md border bg-white text-base font-semibold text-black outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/20",
              compact ? "border-transparent px-3 text-sm" : "border-white/12 px-4 pl-11"
            )}
          />
        </div>
        <LoadingButton
          type="submit"
          loading={busy}
          className={cn(
            "rounded-md bg-red-600 font-black uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black",
            compact ? "h-12 px-4 text-xs" : "h-14 px-6 text-sm"
          )}
        >
          {compact ? "Join" : "Subscribe"}
        </LoadingButton>
      </div>
      {message && (
        <p className={cn("flex items-center gap-2 text-sm font-bold", success ? "text-emerald-300" : dark ? "text-white/72" : "text-red-700")}>
          {success && <CheckCircle2 className="size-4" />}
          {message}
        </p>
      )}
    </form>
  );
}
