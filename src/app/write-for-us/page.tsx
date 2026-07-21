"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileText, ShieldCheck, Users } from "lucide-react";
import JournalistProfileForm, { JournalistProfileValues } from "@/components/JournalistProfileForm";
import { applyAsJournalist } from "@/lib/api";

const EXPECTATIONS = [
  {
    icon: ShieldCheck,
    title: "Verified identity",
    body: "Real name, photograph and biography. Anonymous bylines are not published."
  },
  {
    icon: FileText,
    title: "Original reporting",
    body: "Stories with sourcing, context and public value — not rewrites of other outlets."
  },
  {
    icon: Users,
    title: "Editorial review",
    body: "An editor reviews your profile before you can publish under your own byline."
  }
];

export default function WriteForUsPage() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  async function handleSubmit(values: JournalistProfileValues): Promise<string | null> {
    const form = new FormData();
    form.append("full_name", values.fullName);
    form.append("email", values.email);
    form.append("password", values.password);
    form.append("bio", values.bio);
    if (values.xHandle) form.append("x_handle", values.xHandle);
    if (values.linkedinUrl) form.append("linkedin_url", values.linkedinUrl);
    if (values.photo) form.append("profile_image", values.photo);

    const response = await applyAsJournalist(form);
    if (response?.success) {
      setSubmitted(values.fullName);
      return null;
    }
    return response?.message ?? "Could not submit your application. Please try again.";
  }

  return (
    <main className="bg-[#f7f4ef]">
      <section className="border-b border-white/8 bg-[#111] text-white">
        <div className="container-page py-12 lg:py-16">
          <span className="inline-block rounded-full border border-red-500/30 bg-red-600/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-red-400">
            Write for Solakuti
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-none tracking-[-0.06em] sm:text-6xl">
            Report the stories that matter in Nigeria.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/60">
            Solakuti is looking for journalists with original reporting, real sourcing and a clear
            point of view. Apply below and an editor will review your profile.
          </p>
        </div>
      </section>

      <section className="container-page py-10 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <aside>
            <h2 className="text-xs font-black uppercase tracking-[0.18em] text-black/40">
              What we expect
            </h2>
            <div className="mt-5 grid gap-5">
              {EXPECTATIONS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-700">
                    <Icon className="size-4.5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-[-0.02em] text-[#111]">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-black/55">{body}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-7 border-t border-black/8 pt-5 text-sm leading-7 text-black/55">
              Read our{" "}
              <Link href="/editorial-policy" className="font-black text-red-700 underline underline-offset-2">
                editorial policy
              </Link>{" "}
              before applying.
            </p>
          </aside>

          <div className="rounded-xl border border-black/10 bg-white p-6 editorial-shadow sm:p-8">
            {submitted ? (
              <div className="py-6 text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-green-50 text-green-600">
                  <CheckCircle2 className="size-6" aria-hidden="true" />
                </div>
                <h2 className="mt-5 text-2xl font-black tracking-[-0.04em] text-[#111]">
                  Application received
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-black/55">
                  Thanks, {submitted.split(" ")[0]}. An editor will review your profile. You will be
                  able to publish under your byline once your account is approved.
                </p>
                <Link
                  href="/"
                  className="mt-6 inline-flex h-11 items-center rounded-full border border-black/15 px-5 text-xs font-black uppercase tracking-[0.12em] text-black/70 transition hover:border-black hover:bg-black hover:text-white"
                >
                  Back to homepage
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-7 border-b border-black/8 pb-6">
                  <h2 className="text-2xl font-black tracking-[-0.04em] text-[#111]">Apply to write</h2>
                  <p className="mt-2 text-sm leading-7 text-black/55">
                    Everything here appears publicly on your author page once approved.
                  </p>
                </div>
                <JournalistProfileForm submitLabel="Submit application" onSubmit={handleSubmit} />
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
