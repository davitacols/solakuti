"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Check, Copy, Loader2, Mail, ShieldCheck, UserPlus, Users, X } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import {
  adminApproveApplicant,
  adminCreateInvite,
  adminRejectApplicant,
  adminRevokeInvite,
  getAdminInvites,
  getAdminPendingApplicants,
  type JournalistInvite,
  type JournalistRole,
  type PendingApplicant
} from "@/lib/api";

const ROLES: { value: JournalistRole; label: string }[] = [
  { value: "journalist", label: "Journalist" },
  { value: "editor", label: "Editor" },
  { value: "contributor", label: "Contributor" }
];

const STATUS_STYLES: Record<JournalistInvite["status"], string> = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-emerald-50 text-emerald-700",
  revoked: "bg-black/8 text-black/50",
  expired: "bg-black/8 text-black/50"
};

type JournalistAccessPanelProps = {
  token: string;
  /** Approving applicants is admin-only; editors can still manage invites. */
  role: string;
};

export default function JournalistAccessPanel({ token, role: viewerRole }: JournalistAccessPanelProps) {
  const canReviewApplications = viewerRole === "admin";
  const [invites, setInvites] = useState<JournalistInvite[]>([]);
  const [applicants, setApplicants] = useState<PendingApplicant[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<JournalistRole>("journalist");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  const load = useCallback(async () => {
    const [inviteResponse, applicantResponse] = await Promise.all([
      getAdminInvites(token),
      canReviewApplications ? getAdminPendingApplicants(token) : Promise.resolve(null)
    ]);
    // On error the API puts an object in `data` (e.g. {detail: "..."}), so a
    // null-coalesce is not enough — the shape has to be checked.
    setInvites(Array.isArray(inviteResponse?.data) ? inviteResponse.data : []);
    setApplicants(Array.isArray(applicantResponse?.data) ? applicantResponse.data : []);
  }, [token, canReviewApplications]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleInvite(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    setMessage(null);
    const response = await adminCreateInvite(token, {
      email: email.trim(),
      role,
      note: note.trim()
    });
    if (response?.success) {
      setEmail("");
      setNote("");
      setMessage("Invitation created. Copy the link and send it to the journalist.");
      await load();
    } else {
      setMessage(response?.message ?? "Could not create the invitation.");
    }
    setBusy(false);
  }

  async function handleCopy(invite: JournalistInvite) {
    await navigator.clipboard.writeText(invite.invite_url);
    setCopied(invite.id);
    setTimeout(() => setCopied((current) => (current === invite.id ? null : current)), 2000);
  }

  async function handleRevoke(inviteId: number) {
    setBusy(true);
    const response = await adminRevokeInvite(token, inviteId);
    setMessage(response?.success ? "Invitation revoked." : response?.message ?? "Could not revoke.");
    await load();
    setBusy(false);
  }

  async function handleApprove(userId: number, approveRole: JournalistRole) {
    setBusy(true);
    const response = await adminApproveApplicant(token, userId, approveRole);
    setMessage(response?.success ? response.message : response?.message ?? "Could not approve.");
    await load();
    setBusy(false);
  }

  async function handleReject(userId: number) {
    setBusy(true);
    const response = await adminRejectApplicant(token, userId);
    setMessage(response?.success ? "Application declined." : response?.message ?? "Could not decline.");
    await load();
    setBusy(false);
  }

  const pendingInvites = invites.filter((invite) => invite.status === "pending");

  return (
    <section className="rounded-lg border border-black/10 bg-white p-5 editorial-shadow">
      <div className="mb-5 flex items-center justify-between border-b border-black/10 pb-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Newsroom access</p>
          <h3 className="mt-1 text-2xl font-black tracking-[-0.05em]">Journalists</h3>
        </div>
        <Users className="size-6 text-black/25" aria-hidden="true" />
      </div>

      {message && (
        <p className="mb-4 rounded-md bg-black/5 p-3 text-sm font-bold text-black/70">{message}</p>
      )}

      {/* Invite form */}
      <form onSubmit={handleInvite} className="mb-6 rounded-md border border-black/10 bg-black/[0.02] p-4">
        <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-black/45">
          <UserPlus className="size-3.5" aria-hidden="true" />
          Invite a journalist
        </p>
        <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="journalist@example.com"
            className="h-11 w-full rounded-md border border-black/12 bg-white px-3 text-sm font-semibold outline-none transition focus:border-black"
          />
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as JournalistRole)}
            className="h-11 w-full rounded-md border border-black/12 bg-white px-3 text-sm font-semibold outline-none transition focus:border-black"
          >
            {ROLES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <input
          type="text"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Note (optional) — e.g. Politics desk"
          className="mt-3 h-11 w-full rounded-md border border-black/12 bg-white px-3 text-sm font-semibold outline-none transition focus:border-black"
        />
        <LoadingButton
          type="submit"
          className="mt-3 inline-flex h-10 items-center gap-2 rounded-full bg-black px-4 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-600 disabled:opacity-50"
        >
          <Mail className="size-3.5" aria-hidden="true" />
          Create invite link
        </LoadingButton>
      </form>

      {/* Pending applications — admin only */}
      {canReviewApplications && (
      <div className="mb-6">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-black/45">
          Byline applications ({applicants.length})
        </p>
        <div className="space-y-3">
          {applicants.map((applicant) => (
            <div key={applicant.id} className="rounded-md border border-black/10 p-3">
              <div className="flex items-start gap-3">
                <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-black/5">
                  {applicant.profile_image_url && (
                    <Image
                      src={applicant.profile_image_url}
                      alt={applicant.full_name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-[#111]">{applicant.full_name}</p>
                  <p className="truncate text-xs font-semibold text-black/45">{applicant.email}</p>
                  {applicant.bio && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-black/55">{applicant.bio}</p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleApprove(applicant.id as number, "journalist")}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-emerald-600 px-3 text-[11px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <ShieldCheck className="size-3" aria-hidden="true" />
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleReject(applicant.id as number)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-black/12 px-3 text-[11px] font-black uppercase tracking-[0.1em] text-black/55 transition hover:border-red-300 hover:text-red-700 disabled:opacity-50"
                >
                  <X className="size-3" aria-hidden="true" />
                  Decline
                </button>
              </div>
            </div>
          ))}
          {applicants.length === 0 && (
            <p className="text-sm font-bold text-black/45">No applications awaiting review.</p>
          )}
        </div>
      </div>
      )}

      {/* Pending invites */}
      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-black/45">
          Open invitations ({pendingInvites.length})
        </p>
        <div className="space-y-2">
          {pendingInvites.map((invite) => (
            <div key={invite.id} className="rounded-md bg-black/[0.03] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-black text-[#111]">{invite.email}</p>
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${STATUS_STYLES[invite.status]}`}
                >
                  {invite.role}
                </span>
              </div>
              {invite.note && <p className="mt-1 text-xs text-black/45">{invite.note}</p>}
              <div className="mt-2.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(invite)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-black/12 bg-white px-3 text-[11px] font-black uppercase tracking-[0.1em] text-black/65 transition hover:border-black hover:bg-black hover:text-white"
                >
                  {copied === invite.id ? (
                    <>
                      <Check className="size-3" aria-hidden="true" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" aria-hidden="true" />
                      Copy link
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleRevoke(invite.id)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-black uppercase tracking-[0.1em] text-black/45 transition hover:text-red-700 disabled:opacity-50"
                >
                  Revoke
                </button>
              </div>
            </div>
          ))}
          {pendingInvites.length === 0 && (
            <p className="text-sm font-bold text-black/45">No open invitations.</p>
          )}
        </div>
      </div>

      {busy && (
        <p className="mt-4 flex items-center gap-2 text-xs font-bold text-black/40">
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          Working...
        </p>
      )}
    </section>
  );
}
