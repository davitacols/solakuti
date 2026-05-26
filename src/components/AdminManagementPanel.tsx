"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Clipboard,
  ExternalLink,
  FileImage,
  FilePlus2,
  Layers3,
  MessageSquareText,
  Pencil,
  Search,
  RefreshCw,
  Send,
  Shield,
  Trash2,
  Trophy,
  Users
} from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import RichTextEditor from "@/components/RichTextEditor";
import {
  AdminCategory,
  AdminComment,
  AdminArticleRevision,
  AdminMediaAsset,
  SportsAdminOverview,
  SportsSyncLog,
  AdminUser,
  adminCreateSportsCompetition,
  adminCreateSportsEvent,
  adminCreateSportsFixture,
  adminCreateSportsStanding,
  adminCreateSportsStatistic,
  adminCreateSportsTeam,
  adminUpdateSportsFixture,
  adminUpdateSportsCompetition,
  adminCreateArticle,
  adminCreateCategory,
  adminCreateUser,
  adminDeleteArticle,
  adminDeleteCategory,
  adminDeleteComment,
  adminDeleteMedia,
  adminUpdateUser,
  adminUpdateArticle,
  adminUploadMedia,
  getAdminArticle,
  getAdminCategories,
  getAdminComments,
  getAdminMedia,
  getAdminSportsOverview,
  getAdminSportsSyncLogs,
  getAdminUsers,
  getSportsCompetitions,
  getSportsFixtures,
  getSportsTeams,
  getArticleRevisions,
  restoreArticleRevision,
  sanitizeArticleHtml,
  triggerSportsSync
} from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import { Article } from "@/types/article";
import { SportsCompetition, SportsFixture, SportsTeam } from "@/types/sports";

type AdminManagementPanelProps = {
  token: string;
  role: string;
  articles: Article[];
  onRefresh: () => Promise<void>;
};

type Tab = "articles" | "sports" | "categories" | "comments" | "users" | "media";

const tabs: Array<{ id: Tab; label: string; icon: typeof FilePlus2 }> = [
  { id: "articles", label: "Articles", icon: FilePlus2 },
  { id: "sports", label: "Sports", icon: Trophy },
  { id: "categories", label: "Categories", icon: Layers3 },
  { id: "comments", label: "Comments", icon: MessageSquareText },
  { id: "users", label: "Users", icon: Users },
  { id: "media", label: "Media", icon: FileImage }
];

const roleOptions = ["admin", "editor", "journalist", "contributor"];
const maxImageUploadSize = 5 * 1024 * 1024;
const maxVideoUploadSize = 50 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const allowedVideoTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);

function toDateTimeLocalValue(value?: string) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function isArticlePublic(article: Article) {
  const publishedTime = new Date(article.publishedAt).getTime();
  return Boolean(article.published && (!Number.isFinite(publishedTime) || publishedTime <= Date.now()));
}

function fixtureOptionLabel(fixture: SportsFixture) {
  const home = fixture.home_team.short_name || fixture.home_team.name;
  const away = fixture.away_team.short_name || fixture.away_team.name;
  return `${home} vs ${away} - ${fixture.competition.name} - ${formatDate(fixture.kickoff_at)}`;
}

function articleSportsLinkValue(article: Article | null, targetType: "competition" | "team" | "fixture") {
  return article?.sportsLinks?.find((link) => link.targetType === targetType)?.targetId ?? "";
}

function SportsDeskPanel({
  overview,
  logs,
  competitions,
  teams,
  fixtures,
  competitionCodes,
  busy,
  onCompetitionCodesChange,
  onFullSync,
  onLiveSync,
  onToggleCompetition,
  onCreateCompetition,
  onCreateTeam,
  onCreateFixture,
  onUpdateFixture,
  onCreateEvent,
  onCreateStatistic,
  onCreateStanding
}: {
  overview: SportsAdminOverview | null;
  logs: SportsSyncLog[];
  competitions: SportsCompetition[];
  teams: SportsTeam[];
  fixtures: SportsFixture[];
  competitionCodes: string;
  busy: string | null;
  onCompetitionCodesChange: (value: string) => void;
  onFullSync: () => void;
  onLiveSync: () => void;
  onToggleCompetition: (competition: SportsCompetition) => void;
  onCreateCompetition: (event: FormEvent<HTMLFormElement>) => void;
  onCreateTeam: (event: FormEvent<HTMLFormElement>) => void;
  onCreateFixture: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateFixture: (event: FormEvent<HTMLFormElement>) => void;
  onCreateEvent: (event: FormEvent<HTMLFormElement>) => void;
  onCreateStatistic: (event: FormEvent<HTMLFormElement>) => void;
  onCreateStanding: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const stats = [
    ["Competitions", overview?.competitions ?? competitions.length],
    ["Teams", overview?.teams ?? 0],
    ["Fixtures", overview?.fixtures ?? 0],
    ["Live now", overview?.live_fixtures ?? 0],
    ["Today", overview?.today_fixtures ?? 0],
    ["Upcoming", overview?.upcoming_fixtures ?? 0],
    ["Results", overview?.result_fixtures ?? 0]
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0 space-y-6">
        <div className="min-w-0 overflow-hidden rounded-lg border border-black/10 bg-white">
        <div className="border-b-2 border-black p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Sports desk</p>
          <h4 className="mt-2 text-2xl font-black tracking-[-0.05em] text-[#111]">LiveScore control room</h4>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="border border-black/10 bg-[#f7f4ef] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-black/42">{label}</p>
              <p className="mt-2 text-3xl font-black tracking-[-0.06em] text-[#111]">{Number(value).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 border-t border-black/10 p-4 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
          <TextInput
            value={competitionCodes}
            onChange={(event) => onCompetitionCodesChange(event.target.value)}
            placeholder="Optional competition codes: PL,CL,SA"
          />
          <LoadingButton
            type="button"
            loading={busy === "sports-live-sync"}
            onClick={onLiveSync}
            className="h-11 rounded-md bg-red-600 px-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#111]"
          >
            <RefreshCw className="size-4" />
            Live sync
          </LoadingButton>
          <LoadingButton
            type="button"
            loading={busy === "sports-sync"}
            onClick={onFullSync}
            className="h-11 rounded-md border border-black/10 bg-white px-4 text-sm font-black uppercase tracking-[0.12em] text-[#111] transition hover:border-black hover:bg-[#111] hover:text-white"
          >
            <RefreshCw className="size-4" />
            Full sync
          </LoadingButton>
        </div>
        <div className="border-t border-black/10 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-black/42">Sync history</p>
          <div className="mt-3 divide-y divide-black/10">
            {logs.map((log) => (
              <div key={log.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[#111]">{log.message || log.task}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-black/38">
                    {log.provider} - {formatDate(log.started_at)}
                  </p>
                </div>
                <span className={cn(
                  "w-fit rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em]",
                  log.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                )}>
                  {log.status}
                </span>
              </div>
            ))}
            {!logs.length && <p className="py-4 text-sm font-bold text-black/45">No sync logs yet.</p>}
          </div>
        </div>
      </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <AdminForm title="Create competition" onSubmit={onCreateCompetition} busy={busy === "sports-create-competition"}>
            <TextInput name="name" placeholder="Competition name" required />
            <TextInput name="country" placeholder="Country or region" />
            <TextInput name="logo_url" placeholder="Logo URL" />
            <CheckboxRow labels={["is_featured"]} />
          </AdminForm>
          <AdminForm title="Create team" onSubmit={onCreateTeam} busy={busy === "sports-create-team"}>
            <TextInput name="name" placeholder="Team name" required />
            <TextInput name="short_name" placeholder="Short name e.g. ARS" />
            <TextInput name="country" placeholder="Country" />
            <TextInput name="crest_url" placeholder="Crest URL" />
          </AdminForm>
        </div>

        <AdminForm title="Create fixture" onSubmit={onCreateFixture} busy={busy === "sports-create-fixture"}>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectInput name="competition" required>
              <option value="">Competition</option>
              {competitions.map((competition) => <option key={competition.id} value={competition.id}>{competition.name}</option>)}
            </SelectInput>
            <TextInput name="kickoff_at" type="datetime-local" required />
            <SelectInput name="home_team" required>
              <option value="">Home team</option>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </SelectInput>
            <SelectInput name="away_team" required>
              <option value="">Away team</option>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </SelectInput>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <SelectInput name="status" defaultValue="scheduled">
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="halftime">Half-time</option>
              <option value="finished">Finished</option>
              <option value="postponed">Postponed</option>
              <option value="cancelled">Cancelled</option>
            </SelectInput>
            <TextInput name="round_name" placeholder="Round" />
            <TextInput name="venue" placeholder="Venue" />
          </div>
        </AdminForm>

        <div className="grid gap-4 lg:grid-cols-2">
          <AdminForm title="Update live score" onSubmit={onUpdateFixture} busy={busy === "sports-update-fixture"}>
            <FixtureSelect fixtures={fixtures} />
            <div className="grid gap-3 sm:grid-cols-3">
              <TextInput name="home_score" type="number" min="0" placeholder="Home" required />
              <TextInput name="away_score" type="number" min="0" placeholder="Away" required />
              <TextInput name="minute" type="number" min="0" placeholder="Minute" />
            </div>
            <SelectInput name="status" defaultValue="live">
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="halftime">Half-time</option>
              <option value="finished">Finished</option>
              <option value="postponed">Postponed</option>
              <option value="cancelled">Cancelled</option>
            </SelectInput>
          </AdminForm>
          <AdminForm title="Add match event" onSubmit={onCreateEvent} busy={busy === "sports-create-event"}>
            <FixtureSelect fixtures={fixtures} />
            <SelectInput name="event_type" defaultValue="goal">
              <option value="goal">Goal</option>
              <option value="yellow_card">Yellow card</option>
              <option value="red_card">Red card</option>
              <option value="substitution">Substitution</option>
              <option value="var">VAR</option>
              <option value="info">Info</option>
            </SelectInput>
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectInput name="team_id">
                <option value="">Team</option>
                {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </SelectInput>
              <TextInput name="minute" type="number" min="0" placeholder="Minute" />
            </div>
            <TextInput name="player_name" placeholder="Player" />
            <TextInput name="detail" placeholder="Details" />
          </AdminForm>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <AdminForm title="Add match statistic" onSubmit={onCreateStatistic} busy={busy === "sports-create-statistic"}>
            <FixtureSelect fixtures={fixtures} />
            <TextInput name="group" placeholder="Group e.g. Attack" />
            <TextInput name="name" placeholder="Stat name e.g. Possession" required />
            <div className="grid gap-3 sm:grid-cols-2">
              <TextInput name="home_value" placeholder="Home value" />
              <TextInput name="away_value" placeholder="Away value" />
            </div>
          </AdminForm>
          <AdminForm title="Add table row" onSubmit={onCreateStanding} busy={busy === "sports-create-standing"}>
            <SelectInput name="competition_id" required>
              <option value="">Competition</option>
              {competitions.map((competition) => <option key={competition.id} value={competition.id}>{competition.name}</option>)}
            </SelectInput>
            <SelectInput name="team_id" required>
              <option value="">Team</option>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </SelectInput>
            <div className="grid gap-3 sm:grid-cols-4">
              <TextInput name="position" type="number" min="1" placeholder="#" required />
              <TextInput name="played" type="number" min="0" placeholder="P" />
              <TextInput name="won" type="number" min="0" placeholder="W" />
              <TextInput name="drawn" type="number" min="0" placeholder="D" />
              <TextInput name="lost" type="number" min="0" placeholder="L" />
              <TextInput name="goals_for" type="number" min="0" placeholder="GF" />
              <TextInput name="goals_against" type="number" min="0" placeholder="GA" />
              <TextInput name="points" type="number" min="0" placeholder="Pts" />
            </div>
          </AdminForm>
        </div>
      </div>

      <aside className="rounded-lg border border-black/10 bg-white">
        <div className="border-b border-black/10 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Pinned leagues</p>
          <p className="mt-2 text-sm font-bold leading-6 text-black/52">Featured competitions appear in the public sports centre rail.</p>
        </div>
        <div className="divide-y divide-black/10">
          {competitions.map((competition) => (
            <div key={competition.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[#111]">{competition.name}</p>
                <p className="mt-1 text-xs font-bold text-black/42">{competition.country || "Football"}</p>
              </div>
              <LoadingButton
                type="button"
                loading={busy === `sports-competition-${competition.slug}`}
                onClick={() => onToggleCompetition(competition)}
                className={cn(
                  "h-9 rounded-full px-3 text-xs font-black transition",
                  competition.is_featured ? "bg-[#111] text-white hover:bg-red-600" : "border border-black/10 text-black/55 hover:border-black hover:bg-black hover:text-white"
                )}
              >
                {competition.is_featured ? "Pinned" : "Pin"}
              </LoadingButton>
            </div>
          ))}
          {!competitions.length && <p className="p-4 text-sm font-bold text-black/45">No competitions synced yet.</p>}
        </div>
      </aside>
    </div>
  );
}

export default function AdminManagementPanel({ token, role, articles, onRefresh }: AdminManagementPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("articles");
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [media, setMedia] = useState<AdminMediaAsset[]>([]);
  const [sportsOverview, setSportsOverview] = useState<SportsAdminOverview | null>(null);
  const [sportsLogs, setSportsLogs] = useState<SportsSyncLog[]>([]);
  const [sportsCompetitions, setSportsCompetitions] = useState<SportsCompetition[]>([]);
  const [sportsTeams, setSportsTeams] = useState<SportsTeam[]>([]);
  const [sportsFixtures, setSportsFixtures] = useState<SportsFixture[]>([]);
  const [sportsCompetitionCodes, setSportsCompetitionCodes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [articleImageFile, setArticleImageFile] = useState<File | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [createFormKey, setCreateFormKey] = useState(0);
  const [articleEditorKey, setArticleEditorKey] = useState(0);
  const [editEditorKey, setEditEditorKey] = useState(0);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleQuery, setArticleQuery] = useState("");
  const [articleStatus, setArticleStatus] = useState("all");
  const [articleCategory, setArticleCategory] = useState("all");
  const [articleDraft, setArticleDraft] = useState<Record<string, string>>({});
  const [articleRevisions, setArticleRevisions] = useState<AdminArticleRevision[]>([]);
  const editFormRef = useRef<HTMLDivElement>(null);
  const [previewArticle, setPreviewArticle] = useState<{
    title: string;
    excerpt: string;
    category: string;
    content: string;
    image?: string;
    mediaType?: "image" | "video";
    tags: string;
    status: string;
  } | null>(null);

  const isAdmin = role === "admin";
  const canManageStructure = ["admin", "editor"].includes(role);
  const canManageMedia = ["admin", "editor", "journalist"].includes(role);
  const visibleTabs = useMemo(
    () =>
      tabs.filter((tab) => {
        if (tab.id === "users") return isAdmin;
        if (tab.id === "sports") return canManageStructure;
        if (tab.id === "categories" || tab.id === "comments") return canManageStructure;
        if (tab.id === "media") return canManageMedia;
        return true;
      }),
    [canManageMedia, canManageStructure, isAdmin]
  );
  const filteredArticles = useMemo(() => {
    const query = articleQuery.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesQuery = !query || [article.title, article.excerpt, article.category, ...(article.tags ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(query);
      const matchesStatus = articleStatus === "all" || (article.editorialStatus ?? (article.published ? "published" : "draft")) === articleStatus;
      const matchesCategory = articleCategory === "all" || article.category === articleCategory;
      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [articleCategory, articleQuery, articleStatus, articles]);

  useEffect(() => {
    loadCollections();
    try {
      const savedDraft = localStorage.getItem("solakuti.articleDraft");
      if (savedDraft) {
        setArticleDraft(JSON.parse(savedDraft) as Record<string, string>);
      }
    } catch {
      setArticleDraft({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function loadCollections() {
    const [
      categoryResponse,
      commentResponse,
      mediaResponse,
      userResponse,
      sportsOverviewResponse,
      sportsLogsResponse,
      sportsCompetitionsResponse,
      sportsTeamsResponse,
      sportsFixturesResponse
    ] = await Promise.all([
      getAdminCategories(token),
      getAdminComments(token),
      getAdminMedia(token),
      isAdmin ? getAdminUsers(token) : Promise.resolve(null),
      canManageStructure ? getAdminSportsOverview(token) : Promise.resolve(null),
      canManageStructure ? getAdminSportsSyncLogs(token) : Promise.resolve(null),
      canManageStructure ? getSportsCompetitions() : Promise.resolve([]),
      canManageStructure ? getSportsTeams() : Promise.resolve([]),
      canManageStructure ? getSportsFixtures() : Promise.resolve([])
    ]);
    setCategories(categoryResponse?.data ?? []);
    setComments(commentResponse?.data ?? []);
    setMedia(mediaResponse?.data ?? []);
    setUsers(userResponse?.data ?? []);
    setSportsOverview(sportsOverviewResponse?.data ?? null);
    setSportsLogs(sportsLogsResponse?.data ?? []);
    setSportsCompetitions(sportsCompetitionsResponse ?? []);
    setSportsTeams(sportsTeamsResponse ?? []);
    setSportsFixtures(sportsFixturesResponse ?? []);
  }

  async function runAction(label: string, action: () => Promise<{ success: boolean; message: string } | null>) {
    setBusy(label);
    setMessage(null);
    const response = await action();
    setBusy(null);
    setMessage(response?.message ?? "Request failed.");
    if (response?.success) {
      await Promise.all([loadCollections(), onRefresh()]);
    }
    return response;
  }

  function getSubmitAction(event: FormEvent<HTMLFormElement>) {
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    return submitter?.value || "publish";
  }

  function getEditorialState(action: string) {
    if (action === "draft") {
      return { isPublished: false, editorialStatus: "draft" };
    }
    if (action === "review") {
      return { isPublished: false, editorialStatus: "review" };
    }
    return { isPublished: true, editorialStatus: "published" };
  }

  function buildArticleSportsLinks(form: FormData) {
    const links = new Map<string, {
      target_type: "competition" | "team" | "fixture";
      target_id: string;
      target_slug: string;
      target_name: string;
    }>();

    function addLink(
      targetType: "competition" | "team" | "fixture",
      targetId: string | number | null | undefined,
      targetSlug: string | null | undefined,
      targetName: string | null | undefined
    ) {
      const id = String(targetId ?? "").trim();
      if (!id) {
        return;
      }
      links.set(`${targetType}:${id}`, {
        target_type: targetType,
        target_id: id,
        target_slug: String(targetSlug ?? ""),
        target_name: String(targetName ?? "")
      });
    }

    const competition = sportsCompetitions.find((item) => String(item.id) === String(form.get("related_competition")));
    const team = sportsTeams.find((item) => String(item.id) === String(form.get("related_team")));
    const fixture = sportsFixtures.find((item) => String(item.id) === String(form.get("related_fixture")));

    if (competition) {
      addLink("competition", competition.id, competition.slug, competition.name);
    }
    if (team) {
      addLink("team", team.id, team.slug, team.name);
    }
    if (fixture) {
      addLink("fixture", fixture.id, "", `${fixture.home_team.name} vs ${fixture.away_team.name}`);
      addLink("competition", fixture.competition.id, fixture.competition.slug, fixture.competition.name);
      addLink("team", fixture.home_team.id, fixture.home_team.slug, fixture.home_team.name);
      addLink("team", fixture.away_team.id, fixture.away_team.slug, fixture.away_team.name);
    }

    return Array.from(links.values());
  }

  function articleFormPayload(form: FormData, category: number, content: string, mediaFile?: File | null, action = "publish") {
    const editorial = getEditorialState(action);
    const scheduledAt = String(form.get("scheduled_at") ?? "").trim();
    const payload = new FormData();
    payload.set("title", String(form.get("title") ?? ""));
    payload.set("excerpt", String(form.get("excerpt") ?? ""));
    payload.set("content", content);
    payload.set("category", String(category));
    payload.set("tag_names", String(form.get("tag_names") ?? ""));
    payload.set("seo_title", String(form.get("seo_title") ?? ""));
    payload.set("seo_description", String(form.get("seo_description") ?? ""));
    payload.set("canonical_url", String(form.get("canonical_url") ?? ""));
    payload.set("sports_links", JSON.stringify(buildArticleSportsLinks(form)));
    payload.set("is_featured", String(form.get("is_featured") === "on"));
    payload.set("is_breaking", String(form.get("is_breaking") === "on"));
    payload.set("is_published", String(editorial.isPublished));
    payload.set("editorial_status", editorial.editorialStatus);
    if (editorial.isPublished) {
      payload.set("published_at", scheduledAt ? new Date(scheduledAt).toISOString() : new Date().toISOString());
    }
    if (mediaFile) {
      const isVideo = mediaFile.type.startsWith("video/");
      payload.set("featured_media_type", isVideo ? "video" : "image");
      payload.set(isVideo ? "featured_video" : "featured_image", mediaFile);
    }
    return payload;
  }

  function saveLocalDraft(form: HTMLFormElement, key = "solakuti.articleDraft") {
    const data = Object.fromEntries(new FormData(form).entries());
    localStorage.setItem(key, JSON.stringify(data));
  }

  function saveDraftContent(html: string, key = "solakuti.articleDraft") {
    try {
      const savedDraft = localStorage.getItem(key);
      const currentDraft = savedDraft ? (JSON.parse(savedDraft) as Record<string, string>) : {};
      localStorage.setItem(key, JSON.stringify({ ...currentDraft, content: html }));
    } catch {
      localStorage.setItem(key, JSON.stringify({ content: html }));
    }
  }

  function handlePreview(form: HTMLFormElement, mediaFile?: File | null) {
    const data = new FormData(form);
    setPreviewArticle({
      title: String(data.get("title") || "Untitled report"),
      excerpt: String(data.get("excerpt") || ""),
      category: categories.find((category) => String(category.id) === String(data.get("category")))?.name ?? "Uncategorized",
      content: String(data.get("content") || ""),
      image: mediaFile ? URL.createObjectURL(mediaFile) : undefined,
      mediaType: mediaFile?.type.startsWith("video/") ? "video" : "image",
      tags: String(data.get("tag_names") || ""),
      status: getEditorialState(String(data.get("publish_action") || "draft")).editorialStatus
    });
  }

  function validateArticleForm(form: FormData, mediaFile?: File | null) {
    const category = Number(form.get("category"));
    if (!category) {
      setMessage("Choose a category before saving the article.");
      return null;
    }
    const articleContent = String(form.get("content") ?? "").trim();
    const textContent = articleContent.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
    const hasMedia = /<(img|iframe|video)\b/i.test(articleContent);
    if (!textContent && !hasMedia && !mediaFile) {
      setMessage("Add the article body, photo, or video before saving.");
      return null;
    }
    return { category, articleContent: articleContent || "<p></p>" };
  }

  function validateUploadFile(file: File, assetType: "image" | "video") {
    if (assetType === "image") {
      if (!allowedImageTypes.has(file.type)) {
        setMessage("Use a JPG, PNG, WebP, or GIF image.");
        return false;
      }
      if (file.size > maxImageUploadSize) {
        setMessage("Images must be 5MB or smaller.");
        return false;
      }
    }

    if (assetType === "video") {
      if (!allowedVideoTypes.has(file.type)) {
        setMessage("Use an MP4, WebM, or MOV video.");
        return false;
      }
      if (file.size > maxVideoUploadSize) {
        setMessage("Videos must be 50MB or smaller.");
        return false;
      }
    }

    return true;
  }

  function validateFeaturedMedia(file: File) {
    if (file.type.startsWith("image/")) {
      return validateUploadFile(file, "image");
    }
    if (file.type.startsWith("video/")) {
      return validateUploadFile(file, "video");
    }
    setMessage("Use a JPG, PNG, WebP, GIF, MP4, WebM, or MOV file.");
    return false;
  }

  async function handleCreateArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const action = getSubmitAction(event);
    const form = new FormData(event.currentTarget);
    const valid = validateArticleForm(form, articleImageFile);
    if (!valid) {
      return;
    }
    if (articleImageFile && !validateFeaturedMedia(articleImageFile)) {
      return;
    }

    const response = await runAction("create-article", () =>
      adminCreateArticle(token, articleFormPayload(form, valid.category, valid.articleContent, articleImageFile, action))
    );
    if (!response?.success) {
      return;
    }
    setArticleImageFile(null);
    setArticleDraft({});
    localStorage.removeItem("solakuti.articleDraft");
    setCreateFormKey((current) => current + 1);
    setArticleEditorKey((current) => current + 1);
  }

  async function startEditingArticle(slug: string) {
    setBusy(`edit-load-${slug}`);
    setMessage(null);
    const response = await getAdminArticle(token, slug);
    setBusy(null);
    if (!response?.success || !response.data) {
      setMessage(response?.message ?? "Could not load article for editing.");
      return;
    }
    setEditingArticle(response.data);
    setEditImageFile(null);
    setEditEditorKey((current) => current + 1);
    window.setTimeout(() => {
      editFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    const revisionsResponse = await getArticleRevisions(token, slug);
    setArticleRevisions(revisionsResponse?.data ?? []);
  }

  async function handleUpdateArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const action = getSubmitAction(event);
    if (!editingArticle) {
      return;
    }
    const form = new FormData(event.currentTarget);
    const valid = validateArticleForm(form, editImageFile);
    if (!valid) {
      return;
    }
    if (editImageFile && !validateFeaturedMedia(editImageFile)) {
      return;
    }

    const response = await runAction("update-article", () =>
      adminUpdateArticle(token, editingArticle.slug, articleFormPayload(form, valid.category, valid.articleContent, editImageFile, action))
    );
    if (!response?.success) {
      return;
    }
    setEditImageFile(null);
    setEditingArticle(null);
    setArticleRevisions([]);
  }

  async function handleDeleteArticle(article: Article) {
    const confirmed = window.confirm(`Delete "${article.title}" permanently? This cannot be undone.`);
    if (!confirmed) {
      return;
    }
    const response = await runAction(`delete-article-${article.slug}`, () => adminDeleteArticle(token, article));
    if (response?.success && editingArticle?.slug === article.slug) {
      setEditingArticle(null);
      setEditImageFile(null);
      setArticleRevisions([]);
    }
  }

  function optionalNumber(value: FormDataEntryValue | null) {
    const normalized = String(value ?? "").trim();
    return normalized ? Number(normalized) : null;
  }

  async function handleCreateSportsCompetition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await runAction("sports-create-competition", () =>
      adminCreateSportsCompetition(token, {
        name: String(form.get("name") ?? ""),
        country: String(form.get("country") ?? ""),
        logo_url: String(form.get("logo_url") ?? ""),
        is_featured: form.get("is_featured") === "on"
      })
    );
    event.currentTarget.reset();
  }

  async function handleCreateSportsTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await runAction("sports-create-team", () =>
      adminCreateSportsTeam(token, {
        name: String(form.get("name") ?? ""),
        short_name: String(form.get("short_name") ?? ""),
        country: String(form.get("country") ?? ""),
        crest_url: String(form.get("crest_url") ?? "")
      })
    );
    event.currentTarget.reset();
  }

  async function handleCreateSportsFixture(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await runAction("sports-create-fixture", () =>
      adminCreateSportsFixture(token, {
        competition: Number(form.get("competition")),
        home_team: Number(form.get("home_team")),
        away_team: Number(form.get("away_team")),
        kickoff_at: new Date(String(form.get("kickoff_at"))).toISOString(),
        status: String(form.get("status") ?? "scheduled"),
        round_name: String(form.get("round_name") ?? ""),
        venue: String(form.get("venue") ?? "")
      })
    );
    event.currentTarget.reset();
  }

  async function handleUpdateSportsFixture(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fixtureId = Number(form.get("fixture"));
    await runAction("sports-update-fixture", () =>
      adminUpdateSportsFixture(token, fixtureId, {
        home_score: Number(form.get("home_score") ?? 0),
        away_score: Number(form.get("away_score") ?? 0),
        minute: optionalNumber(form.get("minute")),
        status: String(form.get("status") ?? "live")
      })
    );
  }

  async function handleCreateSportsEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await runAction("sports-create-event", () =>
      adminCreateSportsEvent(token, {
        fixture: Number(form.get("fixture")),
        team_id: optionalNumber(form.get("team_id")),
        event_type: String(form.get("event_type") ?? "info"),
        minute: optionalNumber(form.get("minute")),
        player_name: String(form.get("player_name") ?? ""),
        detail: String(form.get("detail") ?? "")
      })
    );
    event.currentTarget.reset();
  }

  async function handleCreateSportsStatistic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await runAction("sports-create-statistic", () =>
      adminCreateSportsStatistic(token, {
        fixture: Number(form.get("fixture")),
        group: String(form.get("group") ?? ""),
        name: String(form.get("name") ?? ""),
        home_value: String(form.get("home_value") ?? ""),
        away_value: String(form.get("away_value") ?? "")
      })
    );
    event.currentTarget.reset();
  }

  async function handleCreateSportsStanding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const goalsFor = Number(form.get("goals_for") ?? 0);
    const goalsAgainst = Number(form.get("goals_against") ?? 0);
    await runAction("sports-create-standing", () =>
      adminCreateSportsStanding(token, {
        competition_id: Number(form.get("competition_id")),
        team_id: Number(form.get("team_id")),
        position: Number(form.get("position")),
        played: Number(form.get("played") ?? 0),
        won: Number(form.get("won") ?? 0),
        drawn: Number(form.get("drawn") ?? 0),
        lost: Number(form.get("lost") ?? 0),
        goals_for: goalsFor,
        goals_against: goalsAgainst,
        goal_difference: goalsFor - goalsAgainst,
        points: Number(form.get("points") ?? 0)
      })
    );
    event.currentTarget.reset();
  }

  async function handleRestoreRevision(revisionId: number) {
    if (!editingArticle) {
      return;
    }
    const response = await runAction(`restore-revision-${revisionId}`, () => restoreArticleRevision(token, editingArticle.slug, revisionId));
    if (response?.success) {
      setEditingArticle(null);
      setArticleRevisions([]);
    }
  }

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await runAction("create-category", () =>
      adminCreateCategory(token, {
        name: String(form.get("name") ?? ""),
        description: String(form.get("description") ?? "")
      })
    );
    event.currentTarget.reset();
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await runAction("create-user", () =>
      adminCreateUser(token, {
        full_name: String(form.get("full_name") ?? ""),
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        role: String(form.get("role") ?? "contributor"),
        is_verified: form.get("is_verified") === "on",
        is_staff: ["admin", "editor"].includes(String(form.get("role") ?? "")),
        is_active: true
      })
    );
    event.currentTarget.reset();
  }

  async function handleUploadMedia(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mediaFiles.length) {
      setMessage("Choose at least one image or video file first.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const assetType = String(form.get("asset_type") ?? "image") === "video" ? "video" : "image";
    const uploaded = await uploadMediaFiles(
      mediaFiles,
      assetType,
      String(form.get("title") ?? ""),
      String(form.get("alt_text") ?? "")
    );
    if (!uploaded.length) {
      return;
    }
    event.currentTarget.reset();
    setMediaFiles([]);
  }

  async function uploadMediaFiles(files: File[], assetType: "image" | "video", titlePrefix = "", altText = "") {
    const validFiles = files.filter((file) => validateUploadFile(file, assetType));
    if (!validFiles.length) {
      return [];
    }

    setBusy("upload-media");
    setMessage(null);
    const uploaded: AdminMediaAsset[] = [];

    for (const [index, file] of validFiles.entries()) {
      const form = new FormData();
      form.set("title", titlePrefix || file.name.replace(/\.[^.]+$/, "") || `Photo ${index + 1}`);
      form.set("alt_text", altText || file.name.replace(/\.[^.]+$/, ""));
      form.set("asset_type", assetType);
      form.set("file", file);
      const response = await adminUploadMedia(token, form);
      if (!response?.success || !response.data) {
        setMessage(response?.message ?? `Could not upload ${file.name}.`);
        setBusy(null);
        return uploaded;
      }
      uploaded.push(response.data);
    }

    setMedia((current) => [...uploaded, ...current]);
    setBusy(null);
    setMessage(`${uploaded.length} media file${uploaded.length === 1 ? "" : "s"} uploaded.`);
    await loadCollections();
    return uploaded;
  }

  async function uploadMixedArticleMedia(files: File[]) {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const videoFiles = files.filter((file) => file.type.startsWith("video/"));
    const invalidFiles = files.filter((file) => !file.type.startsWith("image/") && !file.type.startsWith("video/"));
    if (invalidFiles.length) {
      setMessage("Article media uploads support images and MP4, WebM, or MOV videos.");
      return [];
    }
    const uploadedImages = imageFiles.length ? await uploadMediaFiles(imageFiles, "image", "Article image") : [];
    const uploadedVideos = videoFiles.length ? await uploadMediaFiles(videoFiles, "video", "Article video") : [];
    return [...uploadedImages, ...uploadedVideos];
  }

  return (
    <section className="mt-8 min-w-0 overflow-hidden rounded-lg border border-black/10 bg-white p-3 editorial-shadow sm:p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Content management</p>
          <h3 className="mt-2 text-3xl font-black tracking-[-0.055em] text-[#111]">
            Run the newsroom from one place.
          </h3>
        </div>
        <LoadingButton
          type="button"
          loading={busy === "refresh"}
          onClick={() => runAction("refresh", async () => ({ success: true, message: "Admin data refreshed." }))}
          className="h-11 rounded-full border border-black/10 px-5 text-sm font-black transition hover:border-black hover:bg-black hover:text-white"
        >
          <RefreshCw className="size-4" />
          Refresh
        </LoadingButton>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto border-b border-black/10 pb-3">
        {visibleTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-black transition",
              activeTab === id ? "bg-[#111] text-white" : "bg-black/5 text-black/55 hover:bg-black/10 hover:text-black"
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {message && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">{message}</p>}

      <div className="mt-6 min-w-0">
        {activeTab === "articles" && (
          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
            <AdminForm
              key={createFormKey}
              title="Create article"
              onSubmit={handleCreateArticle}
              busy={busy === "create-article"}
              hideDefaultSubmit
              onInput={(event) => saveLocalDraft(event.currentTarget)}
            >
              <TextInput name="title" placeholder="Headline" defaultValue={articleDraft.title ?? ""} required />
              <Textarea name="excerpt" placeholder="Short excerpt" rows={3} defaultValue={articleDraft.excerpt ?? ""} required />
              <RichTextEditor
                name="content"
                label="Article body"
                resetKey={articleEditorKey}
                initialHtml={articleDraft.content ?? ""}
                mediaAssets={media}
                onUploadMediaFiles={uploadMixedArticleMedia}
                onHtmlChange={saveDraftContent}
              />
              <FileInput
                label="Featured media"
                helper="Upload a photo or video for the main story hero."
                accept="image/*,video/mp4,video/webm,video/quicktime"
                selectedFile={articleImageFile}
                onChange={(file) => setArticleImageFile(file)}
                onClear={() => setArticleImageFile(null)}
              />
              <SelectInput name="category" required>
                <option value="">Choose category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </SelectInput>
              <TextInput name="tag_names" placeholder="Optional tags, separated by commas" defaultValue={articleDraft.tag_names ?? ""} />
              <ArticleSportsLinkFields
                competitions={sportsCompetitions}
                teams={sportsTeams}
                fixtures={sportsFixtures}
                defaults={{
                  competition: articleDraft.related_competition ?? "",
                  team: articleDraft.related_team ?? "",
                  fixture: articleDraft.related_fixture ?? ""
                }}
              />
              <TextInput
                name="scheduled_at"
                type="datetime-local"
                placeholder="Schedule publish time"
                defaultValue={articleDraft.scheduled_at ?? ""}
              />
              <div className="rounded-md border border-black/10 bg-white p-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-black/42">SEO optional</p>
                <div className="mt-3 space-y-3">
                  <TextInput name="seo_title" placeholder="SEO title" defaultValue={articleDraft.seo_title ?? ""} />
                  <Textarea name="seo_description" placeholder="SEO description" rows={2} defaultValue={articleDraft.seo_description ?? ""} />
                  <TextInput name="canonical_url" placeholder="Canonical URL" defaultValue={articleDraft.canonical_url ?? ""} />
                </div>
              </div>
              <CheckboxRow labels={["is_featured", "is_breaking"]} defaults={{ is_featured: false, is_breaking: false }} />
              <ArticleFormActions
                busy={busy === "create-article"}
                onPreview={(form) => handlePreview(form, articleImageFile)}
              />
            </AdminForm>
            <div className="min-w-0 overflow-hidden rounded-lg border border-black/10 bg-white">
              {editingArticle && (
                <div ref={editFormRef} className="scroll-mt-24 border-b border-black/10 bg-[#f7f4ef] p-4">
                  <AdminForm title={`Edit: ${editingArticle.title}`} onSubmit={handleUpdateArticle} busy={busy === "update-article"} hideDefaultSubmit>
                    <TextInput name="title" placeholder="Headline" defaultValue={editingArticle.title} required />
                    <Textarea name="excerpt" placeholder="Short excerpt" rows={3} defaultValue={editingArticle.excerpt} required />
                    <RichTextEditor
                      name="content"
                      label="Article body"
                      initialHtml={editingArticle.contentHtml ?? editingArticle.body.map((paragraph) => `<p>${paragraph}</p>`).join("")}
                      resetKey={editEditorKey}
                      mediaAssets={media}
                      onUploadMediaFiles={uploadMixedArticleMedia}
                    />
                    <FileInput
                      label="Replace featured media"
                      helper="Leave empty to keep the current photo or video."
                      accept="image/*,video/mp4,video/webm,video/quicktime"
                      selectedFile={editImageFile}
                      onChange={(file) => setEditImageFile(file)}
                      onClear={() => setEditImageFile(null)}
                    />
                    <TextInput name="tag_names" placeholder="Optional tags, separated by commas" defaultValue={(editingArticle.tags ?? []).join(", ")} />
                    <ArticleSportsLinkFields
                      competitions={sportsCompetitions}
                      teams={sportsTeams}
                      fixtures={sportsFixtures}
                      defaults={{
                        competition: articleSportsLinkValue(editingArticle, "competition"),
                        team: articleSportsLinkValue(editingArticle, "team"),
                        fixture: articleSportsLinkValue(editingArticle, "fixture")
                      }}
                    />
                    <TextInput
                      name="scheduled_at"
                      type="datetime-local"
                      placeholder="Schedule publish time"
                      defaultValue={toDateTimeLocalValue(editingArticle.publishedAt)}
                    />
                    <div className="rounded-md border border-black/10 bg-white p-3">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-black/42">SEO optional</p>
                      <div className="mt-3 space-y-3">
                        <TextInput name="seo_title" placeholder="SEO title" defaultValue={editingArticle.seoTitle ?? ""} />
                        <Textarea name="seo_description" placeholder="SEO description" rows={2} defaultValue={editingArticle.seoDescription ?? ""} />
                        <TextInput name="canonical_url" placeholder="Canonical URL" defaultValue={editingArticle.canonicalUrl ?? ""} />
                      </div>
                    </div>
                    <SelectInput
                      name="category"
                      required
                      defaultValue={categories.find((category) => category.name === editingArticle.category)?.id ?? ""}
                    >
                      <option value="">Choose category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </SelectInput>
                    <CheckboxRow
                      labels={["is_featured", "is_breaking"]}
                      defaults={{
                        is_featured: editingArticle.featured ?? false,
                        is_breaking: editingArticle.breaking ?? false
                      }}
                    />
                    <ArticleFormActions
                      busy={busy === "update-article"}
                      onPreview={(form) => handlePreview(form, editImageFile)}
                    />
                    <button
                      type="button"
                      onClick={() => setEditingArticle(null)}
                      className="mt-3 h-10 w-full rounded-md border border-black/10 text-sm font-black transition hover:border-black hover:bg-white"
                    >
                      Cancel edit
                    </button>
                    <RevisionList
                      revisions={articleRevisions}
                      busy={busy}
                      onRestore={handleRestoreRevision}
                    />
                  </AdminForm>
                </div>
              )}
              <ArticleTable
                articles={filteredArticles}
                categories={categories}
                query={articleQuery}
                status={articleStatus}
                category={articleCategory}
                busy={busy}
                onQueryChange={setArticleQuery}
                onStatusChange={setArticleStatus}
                onCategoryChange={setArticleCategory}
                onEdit={startEditingArticle}
                onDelete={handleDeleteArticle}
              />
            </div>
          </div>
        )}

        {activeTab === "sports" && canManageStructure && (
          <SportsDeskPanel
            overview={sportsOverview}
            logs={sportsLogs}
            competitions={sportsCompetitions}
            teams={sportsTeams}
            fixtures={sportsFixtures}
            competitionCodes={sportsCompetitionCodes}
            busy={busy}
            onCompetitionCodesChange={setSportsCompetitionCodes}
            onLiveSync={() =>
              runAction("sports-live-sync", () => triggerSportsSync(token, sportsCompetitionCodes, "live"))
            }
            onFullSync={() =>
              runAction("sports-sync", () => triggerSportsSync(token, sportsCompetitionCodes))
            }
            onToggleCompetition={(competition) =>
              runAction(`sports-competition-${competition.slug}`, () =>
                adminUpdateSportsCompetition(token, competition.slug, { is_featured: !competition.is_featured })
              )
            }
            onCreateCompetition={handleCreateSportsCompetition}
            onCreateTeam={handleCreateSportsTeam}
            onCreateFixture={handleCreateSportsFixture}
            onUpdateFixture={handleUpdateSportsFixture}
            onCreateEvent={handleCreateSportsEvent}
            onCreateStatistic={handleCreateSportsStatistic}
            onCreateStanding={handleCreateSportsStanding}
          />
        )}

        {activeTab === "categories" && (
          <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <AdminForm title="Create category" onSubmit={handleCreateCategory} busy={busy === "create-category"}>
              <TextInput name="name" placeholder="Category name" required />
              <Textarea name="description" placeholder="Category description" rows={5} required />
            </AdminForm>
            <AdminList title="Categories">
              {categories.map((category) => (
                <ListRow key={category.id} title={category.name} meta={`${category.articles_count ?? 0} articles`}>
                  <LoadingButton
                    type="button"
                    onClick={() => runAction(`delete-category-${category.slug}`, () => adminDeleteCategory(token, category.slug))}
                    className="grid size-9 place-items-center rounded-full border border-black/10 text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white"
                    aria-label="Delete category"
                  >
                    <Trash2 className="size-4" />
                  </LoadingButton>
                </ListRow>
              ))}
            </AdminList>
          </div>
        )}

        {activeTab === "comments" && (
          <AdminList title="Comments">
            {comments.map((comment) => (
              <ListRow
                key={comment.id}
                title={comment.content}
                meta={`${comment.user.full_name} - /article/${comment.article_slug}`}
              >
                <LoadingButton
                  type="button"
                  onClick={() => runAction(`delete-comment-${comment.id}`, () => adminDeleteComment(token, comment.id))}
                  className="grid size-9 place-items-center rounded-full border border-black/10 text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white"
                  aria-label="Delete comment"
                >
                  <Trash2 className="size-4" />
                </LoadingButton>
              </ListRow>
            ))}
          </AdminList>
        )}

        {activeTab === "users" && isAdmin && (
          <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <AdminForm title="Create user" onSubmit={handleCreateUser} busy={busy === "create-user"}>
              <TextInput name="full_name" placeholder="Full name" required />
              <TextInput name="email" placeholder="Email" type="email" required />
              <TextInput name="password" placeholder="Password" type="password" required />
              <SelectInput name="role" required>
                {roleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectInput>
              <label className="flex items-center gap-2 text-sm font-black">
                <input name="is_verified" type="checkbox" className="size-4 accent-red-600" />
                Verified user
              </label>
            </AdminForm>
            <AdminList title="Users">
              {users.map((user) => (
                <ListRow key={user.id} title={user.full_name} meta={`${user.email} - ${user.role}`}>
                  <select
                    value={user.role}
                    onChange={(event) =>
                      runAction(`role-user-${user.id}`, () =>
                        adminUpdateUser(token, user.id, {
                          role: event.target.value,
                          is_staff: ["admin", "editor"].includes(event.target.value)
                        })
                      )
                    }
                    className="h-9 rounded-full border border-black/10 bg-white px-3 text-xs font-black outline-none"
                  >
                    {roleOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <LoadingButton
                    type="button"
                    onClick={() =>
                      runAction(`verify-user-${user.id}`, () =>
                        adminUpdateUser(token, user.id, { is_verified: !user.is_verified })
                      )
                    }
                    className="h-9 rounded-full border border-black/10 px-3 text-xs font-black transition hover:border-black hover:bg-black hover:text-white"
                  >
                    <Shield className="size-4" />
                    {user.is_verified ? "Verified" : "Verify"}
                  </LoadingButton>
                </ListRow>
              ))}
            </AdminList>
          </div>
        )}

        {activeTab === "media" && (
          <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <AdminForm title="Upload media" onSubmit={handleUploadMedia} busy={busy === "upload-media"}>
              <TextInput name="title" placeholder="Media title" required />
              <TextInput name="alt_text" placeholder="Alt text" />
              <SelectInput name="asset_type" required>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </SelectInput>
              <input
                name="file"
                type="file"
                multiple
                onChange={(event) => setMediaFiles(Array.from(event.target.files ?? []))}
                className="w-full rounded-md border border-black/10 bg-white p-3 text-sm font-bold"
                accept="image/*,video/*"
              />
              {mediaFiles.length > 0 && (
                <p className="text-xs font-black uppercase tracking-[0.14em] text-black/42">
                  {mediaFiles.length} file{mediaFiles.length === 1 ? "" : "s"} selected
                </p>
              )}
            </AdminForm>
            <AdminList title="Media library">
              {media.map((asset) => (
                <ListRow key={asset.id} title={asset.title} meta={`${asset.asset_type} - ${asset.alt_text || "No alt text"}`}>
                  {asset.thumbnail_url || asset.optimized_url ? (
                    <a
                      href={asset.optimized_url ?? asset.thumbnail_url}
                      target="_blank"
                      className="rounded-full border border-black/10 px-3 py-2 text-xs font-black transition hover:border-black hover:bg-black hover:text-white"
                    >
                      Open
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(asset.optimized_url ?? asset.file ?? asset.thumbnail_url ?? "")}
                    className="grid size-9 place-items-center rounded-full border border-black/10 text-black/60 transition hover:border-black hover:bg-black hover:text-white"
                    aria-label="Copy media URL"
                  >
                    <Clipboard className="size-4" />
                  </button>
                  <LoadingButton
                    type="button"
                    onClick={() => runAction(`delete-media-${asset.id}`, () => adminDeleteMedia(token, asset.id))}
                    className="grid size-9 place-items-center rounded-full border border-black/10 text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white"
                    aria-label="Delete media"
                  >
                    <Trash2 className="size-4" />
                  </LoadingButton>
                </ListRow>
              ))}
            </AdminList>
          </div>
        )}
      </div>
      {previewArticle && (
        <PreviewModal preview={previewArticle} onClose={() => setPreviewArticle(null)} />
      )}
    </section>
  );
}

function AdminForm({
  title,
  busy,
  hideDefaultSubmit = false,
  children,
  onSubmit,
  onInput
}: {
  title: string;
  busy: boolean;
  hideDefaultSubmit?: boolean;
  children: React.ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onInput?: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} onInput={onInput} className="min-w-0 overflow-hidden rounded-lg border border-black/10 bg-[#f7f4ef] p-3 sm:p-4">
      <h4 className="text-lg font-black tracking-[-0.04em]">{title}</h4>
      <div className="mt-4 min-w-0 space-y-3">{children}</div>
      {!hideDefaultSubmit && (
        <LoadingButton
          type="submit"
          loading={busy}
          className="mt-4 h-11 w-full rounded-md bg-[#111] text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-red-600"
        >
          Save
        </LoadingButton>
      )}
    </form>
  );
}

function FixtureSelect({ fixtures }: { fixtures: SportsFixture[] }) {
  return (
    <SelectInput name="fixture" required>
      <option value="">Choose fixture</option>
      {fixtures.map((fixture) => (
        <option key={fixture.id} value={fixture.id}>
          {(fixture.home_team.short_name || fixture.home_team.name)} vs {(fixture.away_team.short_name || fixture.away_team.name)} - {formatDate(fixture.kickoff_at)}
        </option>
      ))}
    </SelectInput>
  );
}

function ArticleFormActions({
  busy,
  onPreview
}: {
  busy: boolean;
  onPreview: (form: HTMLFormElement) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <button
        type="button"
        onClick={(event) => {
          const form = event.currentTarget.form;
          if (form) onPreview(form);
        }}
        className="h-11 rounded-md border border-black/10 bg-white text-sm font-black uppercase tracking-[0.12em] transition hover:border-black hover:bg-black hover:text-white"
      >
        Preview
      </button>
      <LoadingButton
        type="submit"
        name="publish_action"
        value="draft"
        loading={busy}
        className="h-11 rounded-md border border-black/10 bg-white text-sm font-black uppercase tracking-[0.12em] transition hover:border-black hover:bg-black hover:text-white"
      >
        Save draft
      </LoadingButton>
      <LoadingButton
        type="submit"
        name="publish_action"
        value="review"
        loading={busy}
        className="h-11 rounded-md bg-amber-500 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-amber-600"
      >
        <Send className="size-4" />
        Review
      </LoadingButton>
      <LoadingButton
        type="submit"
        name="publish_action"
        value="publish"
        loading={busy}
        className="h-11 rounded-md bg-red-600 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#111]"
      >
        Publish
      </LoadingButton>
    </div>
  );
}

function RevisionList({
  revisions,
  busy,
  onRestore
}: {
  revisions: AdminArticleRevision[];
  busy: string | null;
  onRestore: (revisionId: number) => void;
}) {
  if (revisions.length === 0) {
    return (
      <div className="mt-3 rounded-md border border-black/10 bg-white p-3">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-black/42">Revision history</p>
        <p className="mt-2 text-sm font-bold text-black/42">No saved revisions yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-md border border-black/10 bg-white p-3">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-black/42">Revision history</p>
      <div className="mt-3 space-y-2">
        {revisions.slice(0, 5).map((revision) => (
          <div key={revision.id} className="flex flex-col gap-2 rounded-md bg-black/5 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-[#111]">{revision.note || revision.title}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-black/38">
                {revision.editorial_status} - {formatDate(revision.created_at)}
              </p>
            </div>
            <LoadingButton
              type="button"
              loading={busy === `restore-revision-${revision.id}`}
              onClick={() => onRestore(revision.id)}
              className="h-9 rounded-full border border-black/10 bg-white px-3 text-xs font-black transition hover:border-black hover:bg-black hover:text-white"
            >
              Restore
            </LoadingButton>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArticleTable({
  articles,
  categories,
  query,
  status,
  category,
  busy,
  onQueryChange,
  onStatusChange,
  onCategoryChange,
  onEdit,
  onDelete
}: {
  articles: Article[];
  categories: AdminCategory[];
  query: string;
  status: string;
  category: string;
  busy: string | null;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onEdit: (slug: string) => void;
  onDelete: (article: Article) => void;
}) {
  return (
    <div className="min-w-0">
      <div className="border-b border-black/10 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <h4 className="text-lg font-black tracking-[-0.04em]">News desk</h4>
          <div className="grid min-w-0 gap-2 sm:grid-cols-[1fr_150px_160px] xl:w-[620px]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/35" />
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search reports"
                className="h-10 w-full rounded-md border border-black/10 pl-9 pr-3 text-sm font-semibold outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
              />
            </label>
            <select value={status} onChange={(event) => onStatusChange(event.target.value)} className="h-10 rounded-md border border-black/10 px-3 text-sm font-black">
              <option value="all">All status</option>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
            </select>
            <select value={category} onChange={(event) => onCategoryChange(event.target.value)} className="h-10 rounded-md border border-black/10 px-3 text-sm font-black">
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="divide-y divide-black/10 md:hidden">
        {articles.map((article) => {
          const articleStatus = article.editorialStatus ?? (article.published ? "published" : "draft");
          return (
            <article key={article.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="line-clamp-2 font-black tracking-[-0.03em] text-[#111]">{article.title}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-black/38">
                    {article.category} - {formatDate(article.publishedAt)}
                  </p>
                </div>
                <span className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em]",
                  articleStatus === "published" ? "bg-emerald-50 text-emerald-700" : articleStatus === "review" ? "bg-amber-50 text-amber-700" : "bg-black/5 text-black/48"
                )}>
                  {articleStatus}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-black text-black/42">{(article.viewsCount ?? 0).toLocaleString()} views</span>
                <div className="flex gap-2">
                  {isArticlePublic(article) && (
                    <Link href={`/article/${article.slug}`} target="_blank" className="grid size-9 place-items-center rounded-full border border-black/10 text-black/60 transition hover:border-black hover:bg-black hover:text-white" aria-label="Open article">
                      <ExternalLink className="size-4" />
                    </Link>
                  )}
                  <LoadingButton type="button" loading={busy === `edit-load-${article.slug}`} onClick={() => onEdit(article.slug)} className="inline-flex h-9 items-center gap-2 rounded-full border border-black/10 px-3 text-xs font-black text-black/60 transition hover:border-black hover:bg-black hover:text-white" aria-label="Edit article">
                    <Pencil className="size-4" />
                    Edit
                  </LoadingButton>
                  <LoadingButton type="button" loading={busy === `delete-article-${article.slug}`} onClick={() => onDelete(article)} className="inline-flex h-9 items-center gap-2 rounded-full border border-black/10 px-3 text-xs font-black text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white" aria-label="Delete article">
                    <Trash2 className="size-4" />
                    Delete
                  </LoadingButton>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div className="hidden max-w-full overflow-x-auto md:block">
        <table className="w-full min-w-[820px] text-left">
          <thead className="bg-black/[0.03] text-[11px] font-black uppercase tracking-[0.16em] text-black/42">
            <tr>
              <th className="px-4 py-3">Report</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {articles.map((article) => {
              const articleStatus = article.editorialStatus ?? (article.published ? "published" : "draft");
              return (
                <tr key={article.id} className="align-top">
                  <td className="px-4 py-4">
                    <p className="line-clamp-2 font-black tracking-[-0.03em] text-[#111]">{article.title}</p>
                    <p className="mt-1 line-clamp-1 text-xs font-bold text-black/42">{(article.tags ?? []).join(", ") || article.author}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em]",
                      articleStatus === "published" ? "bg-emerald-50 text-emerald-700" : articleStatus === "review" ? "bg-amber-50 text-amber-700" : "bg-black/5 text-black/48"
                    )}>
                      {articleStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-black text-black/60">{article.category}</td>
                  <td className="px-4 py-4 text-sm font-black text-black/60">{(article.viewsCount ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-4 text-xs font-bold uppercase tracking-[0.12em] text-black/38">{formatDate(article.publishedAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {isArticlePublic(article) && (
                        <Link href={`/article/${article.slug}`} target="_blank" className="grid size-9 place-items-center rounded-full border border-black/10 text-black/60 transition hover:border-black hover:bg-black hover:text-white" aria-label="Open article">
                          <ExternalLink className="size-4" />
                        </Link>
                      )}
                      <LoadingButton type="button" loading={busy === `edit-load-${article.slug}`} onClick={() => onEdit(article.slug)} className="grid size-9 place-items-center rounded-full border border-black/10 text-black/60 transition hover:border-black hover:bg-black hover:text-white" aria-label="Edit article">
                        <Pencil className="size-4" />
                      </LoadingButton>
                      <LoadingButton type="button" loading={busy === `delete-article-${article.slug}`} onClick={() => onDelete(article)} className="grid size-9 place-items-center rounded-full border border-black/10 text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white" aria-label="Delete article">
                        <Trash2 className="size-4" />
                      </LoadingButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {articles.length === 0 && <p className="p-4 text-sm font-bold text-black/45">No reports match this view.</p>}
    </div>
  );
}

function PreviewModal({
  preview,
  onClose
}: {
  preview: { title: string; excerpt: string; category: string; content: string; image?: string; mediaType?: "image" | "video"; tags: string; status: string };
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg bg-white editorial-shadow">
        <div className="sticky top-0 flex items-center justify-between border-b border-black/10 bg-white p-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Preview - {preview.status}</p>
            <h4 className="text-xl font-black tracking-[-0.04em]">Article preview</h4>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-black/10 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] transition hover:bg-black hover:text-white">
            Close
          </button>
        </div>
        {preview.image && preview.mediaType === "video" && (
          <video src={preview.image} controls playsInline className="h-72 w-full bg-black object-cover" />
        )}
        {preview.image && preview.mediaType !== "video" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview.image} alt="" className="h-72 w-full object-cover" />
        )}
        <article className="p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">{preview.category}</p>
          <h1 className="mt-3 text-4xl font-black leading-none tracking-[-0.06em] text-[#111]">{preview.title}</h1>
          <p className="mt-4 text-lg leading-8 text-black/60">{preview.excerpt}</p>
          {preview.tags && <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-black/35">{preview.tags}</p>}
          <div className="article-body mt-8" dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(preview.content) }} />
        </article>
      </div>
    </div>
  );
}

function AdminList({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white">
      <div className="border-b border-black/10 p-4">
        <h4 className="text-lg font-black tracking-[-0.04em]">{title}</h4>
      </div>
      <div className="divide-y divide-black/10">{children}</div>
    </div>
  );
}

function ListRow({
  title,
  meta,
  status,
  children
}: {
  title: string;
  meta: string;
  status?: "Published" | "Draft";
  children: React.ReactNode;
}) {
  const isPublished = status === "Published";

  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="line-clamp-2 font-black tracking-[-0.03em] text-[#111]">{title}</p>
          {status && (
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em]",
                isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              )}
            >
              {status}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-black/38">{meta}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-11 min-w-0 w-full rounded-md border border-black/10 bg-white px-3 text-sm font-semibold outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="min-w-0 w-full rounded-md border border-black/10 bg-white p-3 text-sm font-semibold outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
    />
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="h-11 min-w-0 w-full rounded-md border border-black/10 bg-white px-3 text-sm font-black outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
    />
  );
}

function ArticleSportsLinkFields({
  competitions,
  teams,
  fixtures,
  defaults
}: {
  competitions: SportsCompetition[];
  teams: SportsTeam[];
  fixtures: SportsFixture[];
  defaults?: {
    competition?: string;
    team?: string;
    fixture?: string;
  };
}) {
  return (
    <div className="rounded-md border border-black/10 bg-[#f7f4ef] p-3">
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-red-600" aria-hidden />
        <p className="text-xs font-black uppercase tracking-[0.14em] text-black/50">Livescore news link</p>
      </div>
      <div className="mt-3 grid gap-3">
        <SelectInput name="related_competition" defaultValue={defaults?.competition ?? ""}>
          <option value="">Attach to competition</option>
          {competitions.map((competition) => (
            <option key={competition.id} value={competition.id}>
              {competition.name}
            </option>
          ))}
        </SelectInput>
        <SelectInput name="related_team" defaultValue={defaults?.team ?? ""}>
          <option value="">Attach to team</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </SelectInput>
        <SelectInput name="related_fixture" defaultValue={defaults?.fixture ?? ""}>
          <option value="">Attach to match</option>
          {fixtures.map((fixture) => (
            <option key={fixture.id} value={fixture.id}>
              {fixtureOptionLabel(fixture)}
            </option>
          ))}
        </SelectInput>
      </div>
    </div>
  );
}

function FileInput({
  label,
  helper,
  accept = "image/*",
  selectedFile,
  onChange,
  onClear
}: {
  label: string;
  helper?: string;
  accept?: string;
  selectedFile?: File | null;
  onChange: (file: File | null) => void;
  onClear?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function clearFile() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onClear?.();
    onChange(null);
  }

  return (
    <div className="block min-w-0 overflow-hidden rounded-md border border-black/10 bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-black/42">{label}</span>
        {selectedFile && (
          <button
            type="button"
            onClick={clearFile}
            className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-red-700 transition hover:bg-red-600 hover:text-white"
          >
            Remove
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        className="mt-2 min-w-0 w-full text-xs font-bold text-black/62 file:mr-2 file:rounded-full file:border-0 file:bg-black file:px-3 file:py-2 file:text-[10px] file:font-black file:uppercase file:tracking-[0.08em] file:text-white sm:text-sm sm:file:mr-3 sm:file:px-4 sm:file:text-xs sm:file:tracking-[0.12em]"
      />
      {selectedFile && (
        <span className="mt-2 block truncate text-xs font-black text-black/55">
          Selected: {selectedFile.name}
        </span>
      )}
      {helper && <span className="mt-2 block text-xs font-bold text-black/38">{helper}</span>}
    </div>
  );
}

function CheckboxRow({
  labels,
  defaults = {}
}: {
  labels: string[];
  defaults?: Record<string, boolean>;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {labels.map((label) => (
        <label key={label} className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-black/55">
          <input name={label} type="checkbox" className="size-4 accent-red-600" defaultChecked={defaults[label] ?? false} />
          {label.replace("is_", "").replace("_", " ")}
        </label>
      ))}
    </div>
  );
}
