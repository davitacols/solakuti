"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AlertCircle, Check, Loader2, Upload, User } from "lucide-react";

export const MIN_BIO_LENGTH = 80;

export type JournalistProfileValues = {
  fullName: string;
  email: string;
  password: string;
  bio: string;
  xHandle: string;
  linkedinUrl: string;
  photo: File | null;
};

type JournalistProfileFormProps = {
  /** Invite flow supplies a fixed email; application flow collects one. */
  lockedEmail?: string;
  submitLabel: string;
  onSubmit: (values: JournalistProfileValues) => Promise<string | null>;
};

export default function JournalistProfileForm({
  lockedEmail,
  submitLabel,
  onSubmit
}: JournalistProfileFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
  const nameValid = nameParts.length >= 2;
  const bioValid = bio.trim().length >= MIN_BIO_LENGTH;
  const canSubmit =
    nameValid && bioValid && !!photo && password.length >= 8 && (!!lockedEmail || email.includes("@"));

  function handlePhoto(file: File | null) {
    setPhoto(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    const message = await onSubmit({
      fullName: fullName.trim(),
      email: lockedEmail ?? email.trim(),
      password,
      bio: bio.trim(),
      xHandle: xHandle.trim(),
      linkedinUrl: linkedinUrl.trim(),
      photo
    });
    if (message) setError(message);
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Photo */}
      <div>
        <label className="text-xs font-black uppercase tracking-[0.16em] text-black/45">
          Profile photo <span className="text-red-600">*</span>
        </label>
        <div className="mt-3 flex items-center gap-4">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-black/10 bg-black/[0.03]">
            {preview ? (
              <Image src={preview} alt="Profile preview" fill sizes="80px" className="object-cover" unoptimized />
            ) : (
              <div className="grid h-full w-full place-items-center">
                <User className="size-7 text-black/25" aria-hidden="true" />
              </div>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-black/70 transition hover:border-black hover:bg-black hover:text-white"
            >
              <Upload className="size-3.5" aria-hidden="true" />
              {photo ? "Change photo" : "Upload photo"}
            </button>
            <p className="mt-2 text-xs text-black/45">
              A real headshot. Readers need to see who wrote the story.
            </p>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handlePhoto(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      {/* Name + email */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Full name"
          required
          value={fullName}
          onChange={setFullName}
          placeholder="Chidi Okeke"
          hint={fullName && !nameValid ? "Enter your first and last name." : undefined}
          invalid={!!fullName && !nameValid}
        />
        {lockedEmail ? (
          <div>
            <label className="text-xs font-black uppercase tracking-[0.16em] text-black/45">Email</label>
            <div className="mt-2 flex h-12 items-center gap-2 rounded-lg border border-black/10 bg-black/[0.03] px-4 text-sm font-semibold text-black/55">
              <Check className="size-4 shrink-0 text-green-600" aria-hidden="true" />
              <span className="truncate">{lockedEmail}</span>
            </div>
            <p className="mt-1.5 text-xs text-black/40">Set by your invitation.</p>
          </div>
        ) : (
          <Field
            label="Email"
            required
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
          />
        )}
      </div>

      <Field
        label="Password"
        required
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="At least 8 characters"
        hint={password && password.length < 8 ? "Must be at least 8 characters." : undefined}
        invalid={!!password && password.length < 8}
      />

      {/* Bio */}
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <label className="text-xs font-black uppercase tracking-[0.16em] text-black/45">
            Biography <span className="text-red-600">*</span>
          </label>
          <span className={`text-xs font-bold ${bioValid ? "text-green-600" : "text-black/35"}`}>
            {bio.trim().length}/{MIN_BIO_LENGTH}
          </span>
        </div>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Describe your reporting background and the subjects you cover."
          className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-black ${
            bio && !bioValid ? "border-red-300" : "border-black/12"
          }`}
        />
        <p className="mt-1.5 text-xs text-black/45">
          This appears publicly on your author page and every article you publish.
        </p>
      </div>

      {/* Socials */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="X (Twitter)" value={xHandle} onChange={setXHandle} placeholder="@yourhandle" />
        <Field
          label="LinkedIn"
          type="url"
          value={linkedinUrl}
          onChange={setLinkedinUrl}
          placeholder="https://linkedin.com/in/you"
        />
      </div>
      <p className="-mt-2 text-xs text-black/45">
        Optional, but public profiles help readers verify who you are.
      </p>

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-red-600 px-6 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#111] disabled:cursor-not-allowed disabled:bg-black/20"
      >
        {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {submitting ? "Submitting..." : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  hint,
  invalid = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
  invalid?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-black uppercase tracking-[0.16em] text-black/45">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`mt-2 h-12 w-full rounded-lg border bg-white px-4 text-sm font-semibold outline-none transition focus:border-black ${
          invalid ? "border-red-300" : "border-black/12"
        }`}
      />
      {hint && <p className="mt-1.5 text-xs font-semibold text-red-600">{hint}</p>}
    </div>
  );
}
