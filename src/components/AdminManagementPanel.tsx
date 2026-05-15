"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  FileImage,
  FilePlus2,
  Layers3,
  MessageSquareText,
  RefreshCw,
  Shield,
  Trash2,
  Users
} from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import {
  AdminCategory,
  AdminComment,
  AdminMediaAsset,
  AdminUser,
  adminApproveComment,
  adminCreateArticle,
  adminCreateCategory,
  adminCreateUser,
  adminDeleteArticle,
  adminDeleteCategory,
  adminDeleteComment,
  adminUpdateUser,
  adminUploadMedia,
  getAdminCategories,
  getAdminComments,
  getAdminMedia,
  getAdminUsers
} from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import { Article } from "@/types/article";

type AdminManagementPanelProps = {
  token: string;
  role: string;
  articles: Article[];
  onRefresh: () => Promise<void>;
};

type Tab = "articles" | "categories" | "comments" | "users" | "media";

const tabs: Array<{ id: Tab; label: string; icon: typeof FilePlus2 }> = [
  { id: "articles", label: "Articles", icon: FilePlus2 },
  { id: "categories", label: "Categories", icon: Layers3 },
  { id: "comments", label: "Comments", icon: MessageSquareText },
  { id: "users", label: "Users", icon: Users },
  { id: "media", label: "Media", icon: FileImage }
];

const roleOptions = ["admin", "editor", "journalist", "contributor"];

export default function AdminManagementPanel({ token, role, articles, onRefresh }: AdminManagementPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("articles");
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [media, setMedia] = useState<AdminMediaAsset[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const isAdmin = role === "admin";
  const visibleTabs = useMemo(() => tabs.filter((tab) => tab.id !== "users" || isAdmin), [isAdmin]);

  useEffect(() => {
    loadCollections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function loadCollections() {
    const [categoryResponse, commentResponse, mediaResponse, userResponse] = await Promise.all([
      getAdminCategories(token),
      getAdminComments(token),
      getAdminMedia(token),
      isAdmin ? getAdminUsers(token) : Promise.resolve(null)
    ]);
    setCategories(categoryResponse?.data ?? []);
    setComments(commentResponse?.data ?? []);
    setMedia(mediaResponse?.data ?? []);
    setUsers(userResponse?.data ?? []);
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
  }

  async function handleCreateArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const category = Number(form.get("category"));
    if (!category) {
      setMessage("Create a category before publishing an article.");
      return;
    }

    await runAction("create-article", () =>
      adminCreateArticle(token, {
        title: String(form.get("title") ?? ""),
        excerpt: String(form.get("excerpt") ?? ""),
        content: String(form.get("content") ?? ""),
        category,
        is_featured: form.get("is_featured") === "on",
        is_breaking: form.get("is_breaking") === "on",
        is_published: form.get("is_published") === "on",
        published_at: new Date().toISOString()
      })
    );
    event.currentTarget.reset();
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
    if (!mediaFile) {
      setMessage("Choose an image or video file first.");
      return;
    }
    const form = new FormData(event.currentTarget);
    form.set("file", mediaFile);
    await runAction("upload-media", () => adminUploadMedia(token, form));
    event.currentTarget.reset();
    setMediaFile(null);
  }

  return (
    <section className="mt-8 rounded-lg border border-black/10 bg-white p-5 editorial-shadow">
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

      <div className="mt-6">
        {activeTab === "articles" && (
          <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
            <AdminForm title="Create article" onSubmit={handleCreateArticle} busy={busy === "create-article"}>
              <TextInput name="title" placeholder="Headline" required />
              <Textarea name="excerpt" placeholder="Short excerpt" rows={3} required />
              <Textarea name="content" placeholder="Article body" rows={8} required />
              <SelectInput name="category" required>
                <option value="">Choose category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </SelectInput>
              <CheckboxRow labels={["is_published", "is_featured", "is_breaking"]} />
            </AdminForm>
            <AdminList title="Articles">
              {articles.map((article) => (
                <ListRow key={article.id} title={article.title} meta={`${article.category} - ${formatDate(article.publishedAt)}`}>
                  <LoadingButton
                    type="button"
                    onClick={() => runAction(`delete-article-${article.slug}`, () => adminDeleteArticle(token, article.slug))}
                    className="grid size-9 place-items-center rounded-full border border-black/10 text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white"
                    aria-label="Delete article"
                  >
                    <Trash2 className="size-4" />
                  </LoadingButton>
                </ListRow>
              ))}
            </AdminList>
          </div>
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
          <AdminList title="Comment moderation">
            {comments.map((comment) => (
              <ListRow
                key={comment.id}
                title={comment.content}
                meta={`${comment.user.full_name} - /article/${comment.article_slug}`}
              >
                {!comment.is_approved && (
                  <LoadingButton
                    type="button"
                    onClick={() => runAction(`approve-comment-${comment.id}`, () => adminApproveComment(token, comment.id))}
                    className="grid size-9 place-items-center rounded-full border border-black/10 text-emerald-700 transition hover:border-emerald-700 hover:bg-emerald-700 hover:text-white"
                    aria-label="Approve comment"
                  >
                    <CheckCircle2 className="size-4" />
                  </LoadingButton>
                )}
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
                onChange={(event) => setMediaFile(event.target.files?.[0] ?? null)}
                className="w-full rounded-md border border-black/10 bg-white p-3 text-sm font-bold"
                accept="image/*,video/*"
              />
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
                </ListRow>
              ))}
            </AdminList>
          </div>
        )}
      </div>
    </section>
  );
}

function AdminForm({
  title,
  busy,
  children,
  onSubmit
}: {
  title: string;
  busy: boolean;
  children: React.ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-black/10 bg-[#f7f4ef] p-4">
      <h4 className="text-lg font-black tracking-[-0.04em]">{title}</h4>
      <div className="mt-4 space-y-3">{children}</div>
      <LoadingButton
        type="submit"
        loading={busy}
        className="mt-4 h-11 w-full rounded-md bg-[#111] text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-red-600"
      >
        Save
      </LoadingButton>
    </form>
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
  children
}: {
  title: string;
  meta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="line-clamp-2 font-black tracking-[-0.03em] text-[#111]">{title}</p>
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
      className="h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm font-semibold outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full rounded-md border border-black/10 bg-white p-3 text-sm font-semibold outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
    />
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm font-black outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
    />
  );
}

function CheckboxRow({ labels }: { labels: string[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {labels.map((label) => (
        <label key={label} className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-black/55">
          <input name={label} type="checkbox" className="size-4 accent-red-600" defaultChecked={label === "is_published"} />
          {label.replace("is_", "").replace("_", " ")}
        </label>
      ))}
    </div>
  );
}
