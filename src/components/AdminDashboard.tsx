"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Download,
  ExternalLink,
  Eye,
  FileText,
  LockKeyhole,
  Mail,
  MessageSquare,
  Newspaper,
  ShieldCheck,
  Tags
} from "lucide-react";
import DistributionPanel from "@/components/DistributionPanel";
import AdminManagementPanel from "@/components/AdminManagementPanel";
import LoadingButton from "@/components/LoadingButton";
import {
  NewsletterSubscriber,
  deactivateNewsletterSubscriber,
  exportNewsletterSubscribers,
  getAdminArticles,
  getAdminOverview,
  getNewsletterSubscribers,
  login,
  logout
} from "@/lib/api";
import { Article } from "@/types/article";
import { formatDate } from "@/lib/utils";

type Session = {
  access: string;
  refresh: string;
  fullName: string;
  email: string;
  role: string;
  expiresAt: number;
};

type Overview = {
  total_articles: number;
  total_views: number;
  today_views: number;
  total_comments: number;
  total_newsletter_subscribers: number;
  popular_categories: Array<{
    id: number;
    name: string;
    slug: string;
    articles_count: number;
    views_count: number | null;
  }>;
  article_performance?: Array<{
    id: number;
    title: string;
    slug: string;
    category: string;
    views_count: number;
    today_views: number;
    comments_count: number;
    published_at: string | null;
  }>;
  recent_activity?: Array<{
    id: number;
    action: string;
    object_type: string;
    description: string;
    created_at: string;
  }>;
  recent_login_attempts?: Array<{
    id: number;
    email: string;
    success: boolean;
    created_at: string;
  }>;
  last_updated?: string;
  source?: "live_api";
};

const allowedRoles = new Set(["admin", "editor"]);
const sessionLengthMs = 30 * 60 * 1000;
const sessionWarningMs = 5 * 60 * 1000;

export default function AdminDashboard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const topArticle = useMemo(() => articles[0], [articles]);
  const recentActivity = overview?.recent_activity ?? [];
  const recentLogins = overview?.recent_login_attempts ?? [];
  const articlePerformance = overview?.article_performance ?? [];

  useEffect(() => {
    if (!session) {
      return;
    }
    const warningDelay = Math.max(0, session.expiresAt - Date.now() - sessionWarningMs);
    const expiryDelay = Math.max(0, session.expiresAt - Date.now());
    const warningTimer = window.setTimeout(() => {
      setMessage("Security notice: this admin session will close soon. Save your work.");
    }, warningDelay);
    const expiryTimer = window.setTimeout(() => {
      setSession(null);
      setOverview(null);
      setArticles([]);
      setSubscribers([]);
      setMessage("Your admin session expired. Please sign in again.");
    }, expiryDelay);
    return () => {
      window.clearTimeout(warningTimer);
      window.clearTimeout(expiryTimer);
    };
  }, [session]);

  async function loadDashboard(token: string) {
    const [overviewResponse, articlesResponse, subscribersResponse] = await Promise.all([
      getAdminOverview(token),
      getAdminArticles(token),
      getNewsletterSubscribers(token)
    ]);

    if (!overviewResponse?.success || !overviewResponse.data) {
      setMessage(overviewResponse?.message ?? "Could not load admin analytics.");
      return;
    }

    setOverview(overviewResponse.data);
    setArticles(articlesResponse?.data ?? []);
    setSubscribers(subscribersResponse?.data ?? []);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const response = await login(email.trim(), password);
      if (!response?.success || !response.data?.access) {
        setMessage(response?.message ?? "Could not sign in.");
        return;
      }

      const role = response.data.user.role ?? "contributor";
      if (!allowedRoles.has(role)) {
        setMessage("This dashboard is restricted to admins and editors.");
        return;
      }

      const nextSession = {
        access: response.data.access,
        refresh: response.data.refresh,
        fullName: response.data.user.full_name,
        email: response.data.user.email ?? email,
        role,
        expiresAt: Date.now() + sessionLengthMs
      };

      setSession(nextSession);
      await loadDashboard(nextSession.access);
    } catch {
      setMessage("Could not sign in. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    if (session?.refresh) {
      await logout(session.refresh, session.access);
    }
    setSession(null);
    setOverview(null);
    setArticles([]);
    setSubscribers([]);
    setMessage(null);
  }

  async function handleExportSubscribers() {
    if (!session) {
      return;
    }
    const blob = await exportNewsletterSubscribers(session.access);
    if (!blob) {
      setMessage("Could not export newsletter subscribers.");
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "solakuti-newsletter-subscribers.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleDeactivateSubscriber(subscriberId: number) {
    if (!session) {
      return;
    }
    const response = await deactivateNewsletterSubscriber(session.access, subscriberId);
    if (!response?.success) {
      setMessage(response?.message ?? "Could not update subscriber.");
      return;
    }
    await loadDashboard(session.access);
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef]">
      <section className="border-b border-black/10 bg-[#111] text-white">
        <div className="container-page flex flex-col justify-between gap-8 py-10 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-red-300">
              <ShieldCheck className="size-4" />
              Newsroom command
            </div>
            <h1 className="mt-5 text-5xl font-black leading-none tracking-[-0.07em] sm:text-7xl">
              Solakuti Admin
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/64">
              Monitor publishing activity, audience signals, comments and editorial priorities.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/12 px-5 text-sm font-black text-white/70 transition hover:border-white hover:text-white"
          >
            View site
          </Link>
        </div>
      </section>

      {!session ? (
        <section className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_420px]">
          <div className="rounded-lg border border-black/10 bg-white p-6 editorial-shadow sm:p-8">
            <div className="grid size-12 place-items-center rounded-full bg-red-600 text-white">
              <LockKeyhole className="size-5" />
            </div>
            <h2 className="mt-6 text-4xl font-black tracking-[-0.06em] text-[#111]">
              Sign in with an admin or editor account.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-black/60">
              This dashboard uses JWT auth from the Django API and only opens for users with admin or editor roles.
            </p>
          </div>

          <form onSubmit={handleLogin} className="rounded-lg border border-black/10 bg-white p-6 editorial-shadow">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Admin access</p>
            <div className="mt-5 space-y-3">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-md border border-black/10 px-4 text-sm font-semibold outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                placeholder="Admin email"
                autoComplete="email"
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full rounded-md border border-black/10 px-4 text-sm font-semibold outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                placeholder="Password"
                autoComplete="current-password"
              />
              <LoadingButton
                type="submit"
                loading={busy}
                className="h-12 w-full rounded-md bg-[#111] text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Open dashboard
              </LoadingButton>
            </div>
            {message && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">{message}</p>}
          </form>
        </section>
      ) : (
        <section className="container-page py-10">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-red-600">
                Signed in as {session.role}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.055em] text-[#111]">
                Welcome, {session.fullName}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <LoadingButton
                type="button"
                onClick={handleExportSubscribers}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-black text-white transition hover:bg-black"
              >
                <Download className="size-4" />
                Export subscribers
              </LoadingButton>
              <LoadingButton
                type="button"
                onClick={handleSignOut}
                className="h-11 rounded-full border border-black/10 bg-white px-5 text-sm font-black transition hover:border-black hover:bg-black hover:text-white"
              >
                Sign out
              </LoadingButton>
            </div>
          </div>

          {message && <p className="mb-5 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">{message}</p>}

          <AdminManagementPanel
            token={session.access}
            role={session.role}
            articles={articles}
            onRefresh={() => loadDashboard(session.access)}
          />

          <div className="grid gap-5 md:grid-cols-5">
            <StatCard icon={FileText} label="Live articles" value={overview?.total_articles ?? 0} />
            <StatCard icon={Eye} label="Real views" value={overview?.total_views ?? 0} />
            <StatCard icon={BarChart3} label="Today" value={overview?.today_views ?? 0} />
            <StatCard icon={MessageSquare} label="Live comments" value={overview?.total_comments ?? 0} />
            <div className="rounded-lg border border-black/10 bg-white p-5 editorial-shadow">
              <StatCard icon={Tags} label="Subscribers" value={overview?.total_newsletter_subscribers ?? 0} plain />
              <LoadingButton
                type="button"
                onClick={handleExportSubscribers}
                className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-full bg-black px-3 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-600"
              >
                <Download className="size-4" />
                Export CSV
              </LoadingButton>
            </div>
          </div>
          {overview?.last_updated && (
            <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-black/35">
              Live API data - refreshed {formatDate(overview.last_updated)}
            </p>
          )}

          <section className="mt-8 rounded-lg border border-black/10 bg-white p-5 editorial-shadow">
            <div className="mb-5 flex flex-col justify-between gap-3 border-b border-black/10 pb-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Article performance</p>
                <h3 className="mt-1 text-2xl font-black tracking-[-0.05em]">Real views per article</h3>
              </div>
              <Eye className="size-6 text-black/25" />
            </div>
            <div className="divide-y divide-black/10">
              {articlePerformance.map((article) => (
                <article key={article.id} className="grid gap-3 py-4 lg:grid-cols-[minmax(0,1fr)_120px_120px_120px] lg:items-center">
                  <div className="min-w-0">
                    <Link href={`/article/${article.slug}`} target="_blank" className="line-clamp-2 font-black tracking-[-0.03em] text-[#111] transition hover:text-red-600">
                      {article.title}
                    </Link>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-black/38">
                      {article.category} - {article.published_at ? formatDate(article.published_at) : "No publish date"}
                    </p>
                  </div>
                  <MetricPill label="Total" value={article.views_count} />
                  <MetricPill label="Today" value={article.today_views} />
                  <MetricPill label="Comments" value={article.comments_count} />
                </article>
              ))}
              {articlePerformance.length === 0 && (
                <p className="py-4 text-sm font-bold text-black/45">No article views have been recorded yet.</p>
              )}
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-lg border border-black/10 bg-white p-5 editorial-shadow">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Security audit</p>
                  <h3 className="mt-1 text-2xl font-black tracking-[-0.05em]">Recent activity</h3>
                </div>
                <ShieldCheck className="size-6 text-black/25" />
              </div>
              <div className="divide-y divide-black/10">
                {recentActivity.slice(0, 8).map((item) => (
                  <div key={item.id} className="py-3">
                    <p className="text-sm font-black text-[#111]">{item.description}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-black/38">
                      {item.action} · {item.object_type} · {formatDate(item.created_at)}
                    </p>
                  </div>
                ))}
                {recentActivity.length === 0 && <p className="text-sm font-bold text-black/45">No activity yet.</p>}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border border-black/10 bg-white p-5 editorial-shadow">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Newsletter</p>
                    <h3 className="mt-1 font-black tracking-[-0.03em]">Recent subscribers</h3>
                  </div>
                  <Mail className="size-5 text-black/25" />
                </div>
                <div className="space-y-3">
                  {subscribers.map((subscriber) => (
                    <div key={subscriber.id} className="rounded-md bg-black/5 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black">{subscriber.email}</p>
                          <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-black/38">
                            {subscriber.source} - {formatDate(subscriber.created_at)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeactivateSubscriber(subscriber.id)}
                          className="rounded-full border border-black/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-black/45 transition hover:border-red-600 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {subscribers.length === 0 && <p className="text-sm font-bold text-black/45">No subscribers yet.</p>}
                </div>
                <LoadingButton
                  type="button"
                  onClick={handleExportSubscribers}
                  className="mt-4 h-9 w-full rounded-full bg-black px-3 text-xs font-black text-white transition hover:bg-red-600"
                >
                  Export CSV
                </LoadingButton>
              </div>

              <div className="rounded-lg border border-black/10 bg-white p-5 editorial-shadow">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="font-black tracking-[-0.03em]">Login attempts</h3>
                </div>
                <div className="space-y-3">
                  {recentLogins.slice(0, 6).map((attempt) => (
                    <div key={attempt.id} className="rounded-md bg-black/5 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-black">{attempt.email || "Unknown email"}</p>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${attempt.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                          {attempt.success ? "Success" : "Failed"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-bold text-black/38">{formatDate(attempt.created_at)}</p>
                    </div>
                  ))}
                  {recentLogins.length === 0 && <p className="text-sm font-bold text-black/45">No login attempts yet.</p>}
                </div>
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <section className="rounded-lg border border-black/10 bg-white p-5 editorial-shadow">
              <div className="mb-5 flex items-center justify-between border-b border-black/10 pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Editorial queue</p>
                  <h3 className="mt-1 text-2xl font-black tracking-[-0.05em]">Recent articles</h3>
                </div>
                <Newspaper className="size-6 text-black/25" />
              </div>
              <div className="divide-y divide-black/10">
                {articles.map((article) => (
                  <article key={article.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        {article.published ? (
                          <Link href={`/article/${article.slug}`} className="font-black tracking-[-0.03em] transition hover:text-red-600">
                            {article.title}
                          </Link>
                        ) : (
                          <span className="font-black tracking-[-0.03em] text-[#111]">{article.title}</span>
                        )}
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                            article.published ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {article.published ? "Published" : "Draft"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-black/38">
                        {article.category} · {formatDate(article.publishedAt)}
                      </p>
                    </div>
                    {article.published ? (
                      <Link
                        href={`/article/${article.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-xs font-black text-black/45 transition hover:bg-black hover:text-white"
                      >
                        <ExternalLink className="size-3.5" />
                        Open
                      </Link>
                    ) : (
                      <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-black text-black/45">
                        {article.readTime}
                      </span>
                    )}
                  </article>
                ))}
              </div>
            </section>

            <aside className="space-y-6">
              <section className="rounded-lg border border-black/10 bg-[#111] p-5 text-white editorial-shadow">
                <div className="flex items-center gap-2">
                  <BarChart3 className="size-5 text-red-400" />
                  <h3 className="font-black tracking-[-0.03em]">Top signal</h3>
                </div>
                <p className="mt-4 text-2xl font-black leading-tight tracking-[-0.05em]">
                  {topArticle?.title ?? "No articles yet"}
                </p>
              </section>

              <section className="rounded-lg border border-black/10 bg-white p-5 editorial-shadow">
                <div className="mb-4 flex items-center gap-2">
                  <Tags className="size-5 text-red-600" />
                  <h3 className="font-black tracking-[-0.03em]">Popular categories</h3>
                </div>
                <div className="space-y-3">
                  {(overview?.popular_categories ?? []).map((category) => (
                    <div key={category.id} className="flex items-center justify-between rounded-md bg-black/5 px-3 py-2">
                      <span className="text-sm font-black">{category.name}</span>
                      <span className="text-xs font-black text-black/45">{category.views_count ?? 0} views</span>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>

          <div className="mt-8">
            <DistributionPanel articles={articles} />
          </div>
        </section>
      )}
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  plain = false
}: {
  icon: typeof FileText;
  label: string;
  value: number;
  plain?: boolean;
}) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-black/38">{label}</p>
        <Icon className="size-5 text-red-600" />
      </div>
      <p className="mt-4 text-4xl font-black tracking-[-0.06em] text-[#111]">{value.toLocaleString()}</p>
    </>
  );

  return plain ? (
    content
  ) : (
    <div className="rounded-lg border border-black/10 bg-white p-5 editorial-shadow">
      {content}
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-black/[0.03] px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-black/35">{label}</p>
      <p className="mt-1 text-lg font-black tracking-[-0.04em] text-[#111]">{value.toLocaleString()}</p>
    </div>
  );
}
