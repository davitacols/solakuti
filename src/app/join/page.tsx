"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import JournalistProfileForm, { JournalistProfileValues } from "@/components/JournalistProfileForm";
import { acceptJournalistInvite, verifyJournalistInvite, type JournalistRole } from "@/lib/api";

type InviteState =
  | { status: "loading" }
  | { status: "invalid"; message: string }
  | { status: "valid"; email: string; role: JournalistRole }
  | { status: "done"; name: string };

function JoinContent() {
  const token = useSearchParams().get("token") ?? "";
  const [state, setState] = useState<InviteState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    if (!token) {
      setState({ status: "invalid", message: "This link is missing its invitation token." });
      return;
    }
    verifyJournalistInvite(token).then((response) => {
      if (!active) return;
      if (response?.success && response.data) {
        setState({ status: "valid", email: response.data.email, role: response.data.role });
      } else {
        setState({
          status: "invalid",
          message: response?.message ?? "This invitation link is invalid, expired or already used."
        });
      }
    });
    return () => {
      active = false;
    };
  }, [token]);

  async function handleSubmit(values: JournalistProfileValues): Promise<string | null> {
    const form = new FormData();
    form.append("token", token);
    form.append("full_name", values.fullName);
    form.append("password", values.password);
    form.append("bio", values.bio);
    if (values.xHandle) form.append("x_handle", values.xHandle);
    if (values.linkedinUrl) form.append("linkedin_url", values.linkedinUrl);
    if (values.photo) form.append("profile_image", values.photo);

    const response = await acceptJournalistInvite(form);
    if (response?.success) {
      setState({ status: "done", name: values.fullName });
      return null;
    }
    return response?.message ?? "Could not create your account. Please try again.";
  }

  if (state.status === "loading") {
    return (
      <div className="flex items-center gap-3 text-sm font-bold text-black/50">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Checking your invitation...
      </div>
    );
  }

  if (state.status === "invalid") {
    return (
      <div className="rounded-xl border border-black/10 bg-white p-8 text-center editorial-shadow">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-red-50 text-red-600">
          <AlertCircle className="size-6" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-2xl font-black tracking-[-0.04em] text-[#111]">Invitation not valid</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-black/55">{state.message}</p>
        <p className="mt-6 text-sm text-black/55">
          Think this is a mistake?{" "}
          <Link href="/contact" className="font-black text-red-700 underline underline-offset-2">
            Contact the newsroom
          </Link>
          .
        </p>
      </div>
    );
  }

  if (state.status === "done") {
    return (
      <div className="rounded-xl border border-black/10 bg-white p-8 text-center editorial-shadow">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-2xl font-black tracking-[-0.04em] text-[#111]">
          Welcome to the newsroom, {state.name.split(" ")[0]}.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-black/55">
          Your account is active and your author profile is live. Sign in to start filing stories.
        </p>
        <Link
          href="/admin"
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-red-600 px-6 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#111]"
        >
          Sign in
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-black/10 bg-white p-6 editorial-shadow sm:p-8">
      <div className="mb-7 border-b border-black/8 pb-6">
        <span className="inline-block rounded-full bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-red-700">
          {state.role} invitation
        </span>
        <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#111]">Complete your profile</h2>
        <p className="mt-2 text-sm leading-7 text-black/55">
          Solakuti bylines carry a real name, face and biography. Everything here appears publicly on
          your author page.
        </p>
      </div>
      <JournalistProfileForm
        lockedEmail={state.email}
        submitLabel="Create my account"
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default function JoinPage() {
  return (
    <main className="bg-[#f7f4ef]">
      <section className="border-b border-white/8 bg-[#111] text-white">
        <div className="container-page py-12 lg:py-16">
          <span className="inline-block rounded-full border border-red-500/30 bg-red-600/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-red-400">
            Newsroom onboarding
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-none tracking-[-0.06em] sm:text-6xl">
            Join the Solakuti newsroom.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/60">
            You have been invited to write for Solakuti. Set up the author profile readers will see on
            every story you publish.
          </p>
        </div>
      </section>

      <section className="container-page py-10 lg:py-12">
        <div className="mx-auto max-w-2xl">
          <Suspense
            fallback={
              <div className="flex items-center gap-3 text-sm font-bold text-black/50">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Loading...
              </div>
            }
          >
            <JoinContent />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
