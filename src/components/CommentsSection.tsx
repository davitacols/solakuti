"use client";

import { FormEvent, useMemo, useState } from "react";
import { MessageCircle, Send, UserRound } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import { Comment } from "@/types/article";
import { formatDate } from "@/lib/utils";
import { login, postComment, register } from "@/lib/api";

type CommentsSectionProps = {
  articleId: string;
  initialComments: Comment[];
};

type Session = {
  access: string;
  fullName: string;
};

type AuthMode = "register" | "login";

export default function CommentsSection({ articleId, initialComments }: CommentsSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [session, setSession] = useState<Session | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("register");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const commentCount = useMemo(
    () => comments.reduce((count, comment) => count + 1 + comment.replies.length, 0),
    [comments]
  );

  async function establishSession(userEmail = email, userPassword = password) {
    const response = await login(userEmail, userPassword);
    if (!response?.success || !response.data?.access) {
      setMessage(response?.message ?? "Could not sign in. Check your email and password.");
      return false;
    }

    setSession({
      access: response.data.access,
      fullName: response.data.user.full_name
    });
    return true;
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    if (!fullName.trim() || !email.trim() || password.length < 8) {
      setBusy(false);
      setMessage("Enter your name, email and a password with at least 8 characters.");
      return;
    }

    const response = await register(fullName.trim(), email.trim(), password);
    if (!response?.success) {
      setBusy(false);
      setMessage(response?.message ?? "Could not create account. Try a different email.");
      return;
    }

    const signedIn = await establishSession(email.trim(), password);
    setBusy(false);
    if (signedIn) {
      setMessage("Account created. You can now post your comment.");
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const signedIn = await establishSession(email.trim(), password);
    setBusy(false);
    if (signedIn) {
      setMessage("Signed in. You can now join the discussion.");
    }
  }

  async function handleComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !content.trim()) {
      return;
    }

    setBusy(true);
    setMessage(null);
    const response = await postComment(articleId, content.trim(), session.access);
    setBusy(false);

    if (!response?.success || !response.data) {
      setMessage(response?.message ?? "Could not submit comment.");
      return;
    }

    setContent("");
    setMessage(response.message);
    if (response.data.is_approved) {
      setComments((current) => [
        {
          id: String(response.data.id),
          article: String(response.data.article),
          user: session.fullName,
          content: response.data.content,
          createdAt: response.data.created_at,
          isApproved: response.data.is_approved,
          replies: []
        },
        ...current
      ]);
    }
  }

  return (
    <section className="container-page border-t border-black/12 py-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,760px)_1fr]">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-[#111] text-white">
              <MessageCircle className="size-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-red-600">
                Reader room
              </p>
              <h2 className="text-3xl font-black tracking-[-0.055em] text-[#111]">
                Comments {commentCount ? `(${commentCount})` : ""}
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            {comments.length ? (
              comments.map((comment) => (
                <article key={comment.id} className="rounded-lg border border-black/10 bg-white p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-black/5 text-black/60">
                      <UserRound className="size-5" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black tracking-[-0.03em]">{comment.user}</h3>
                        <span className="text-xs font-bold text-black/38">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="mt-2 leading-7 text-black/68">{comment.content}</p>
                    </div>
                  </div>

                  {comment.replies.length > 0 && (
                    <div className="mt-4 space-y-3 border-l-2 border-red-600/20 pl-5">
                      {comment.replies.map((reply) => (
                        <div key={reply.id}>
                          <p className="text-sm font-black">{reply.user}</p>
                          <p className="mt-1 text-sm leading-6 text-black/62">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-black/16 bg-white/55 p-6">
                <p className="font-bold text-black/58">
                  No approved comments yet. Start the conversation once you sign in.
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-lg border border-black/10 bg-white p-5 lg:sticky lg:top-28 lg:self-start">
          {!session ? (
            <form onSubmit={authMode === "register" ? handleRegister : handleLogin} className="space-y-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
                  Reader account
                </p>
                <h3 className="mt-2 text-2xl font-black tracking-[-0.05em]">
                  Join the discussion
                </h3>
              </div>
              <div className="grid grid-cols-2 rounded-md bg-black/5 p-1">
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className={`h-10 rounded text-xs font-black uppercase tracking-[0.12em] transition ${
                    authMode === "register" ? "bg-[#111] text-white" : "text-black/55 hover:text-black"
                  }`}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className={`h-10 rounded text-xs font-black uppercase tracking-[0.12em] transition ${
                    authMode === "login" ? "bg-[#111] text-white" : "text-black/55 hover:text-black"
                  }`}
                >
                  Sign in
                </button>
              </div>
              {authMode === "register" && (
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="h-12 w-full rounded-md border border-black/10 px-4 text-sm font-semibold outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                  placeholder="Full name"
                  autoComplete="name"
                />
              )}
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-md border border-black/10 px-4 text-sm font-semibold outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                placeholder="Email"
                autoComplete="email"
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full rounded-md border border-black/10 px-4 text-sm font-semibold outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                placeholder="Password"
                autoComplete={authMode === "register" ? "new-password" : "current-password"}
              />
              {authMode === "register" && (
                <p className="text-xs font-bold leading-5 text-black/45">
                  Your account is created as a reader/contributor. Comments may be held for moderation before appearing publicly.
                </p>
              )}
              <LoadingButton
                type="submit"
                loading={busy}
                className="h-12 w-full rounded-md bg-[#111] text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {authMode === "register" ? "Create account" : "Sign in"}
              </LoadingButton>
            </form>
          ) : (
            <form onSubmit={handleComment} className="space-y-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
                  Signed in as
                </p>
                <h3 className="mt-2 text-2xl font-black tracking-[-0.05em]">{session.fullName}</h3>
              </div>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="min-h-32 w-full resize-none rounded-md border border-black/10 p-4 text-sm font-semibold leading-6 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                placeholder="Write a thoughtful comment..."
              />
              <LoadingButton
                type="submit"
                loading={busy}
                disabled={!content.trim()}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-red-600 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#111] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="size-4" />
                Post comment
              </LoadingButton>
            </form>
          )}

          {message && <p className="mt-4 rounded-md bg-black/5 p-3 text-sm font-bold text-black/62">{message}</p>}
        </aside>
      </div>
    </section>
  );
}
