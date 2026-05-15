"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
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
  Users
} from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import RichTextEditor from "@/components/RichTextEditor";
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
  adminDeleteMedia,
  adminUpdateUser,
  adminUpdateArticle,
  adminUploadMedia,
  getAdminArticle,
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
  const [articleImageFile, setArticleImageFile] = useState<File | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [articleEditorKey, setArticleEditorKey] = useState(0);
  const [editEditorKey, setEditEditorKey] = useState(0);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleQuery, setArticleQuery] = useState("");
  const [articleStatus, setArticleStatus] = useState("all");
  const [articleCategory, setArticleCategory] = useState("all");
  const [articleDraft, setArticleDraft] = useState<Record<string, string>>({});
  const [previewArticle, setPreviewArticle] = useState<{
    title: string;
    excerpt: string;
    category: string;
    content: string;
    image?: string;
    tags: string;
    status: string;
  } | null>(null);

  const isAdmin = role === "admin";
  const visibleTabs = useMemo(() => tabs.filter((tab) => tab.id !== "users" || isAdmin), [isAdmin]);
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

  function articleFormPayload(form: FormData, category: number, content: string, imageFile?: File | null, action = "publish") {
    const editorial = getEditorialState(action);
    const payload = new FormData();
    payload.set("title", String(form.get("title") ?? ""));
    payload.set("excerpt", String(form.get("excerpt") ?? ""));
    payload.set("content", content);
    payload.set("category", String(category));
    payload.set("tag_names", String(form.get("tag_names") ?? ""));
    payload.set("seo_title", String(form.get("seo_title") ?? ""));
    payload.set("seo_description", String(form.get("seo_description") ?? ""));
    payload.set("canonical_url", String(form.get("canonical_url") ?? ""));
    payload.set("is_featured", String(form.get("is_featured") === "on"));
    payload.set("is_breaking", String(form.get("is_breaking") === "on"));
    payload.set("is_published", String(editorial.isPublished));
    payload.set("editorial_status", editorial.editorialStatus);
    if (editorial.isPublished) {
      payload.set("published_at", new Date().toISOString());
    }
    if (imageFile) {
      payload.set("featured_image", imageFile);
    }
    return payload;
  }

  function saveLocalDraft(form: HTMLFormElement, key = "solakuti.articleDraft") {
    const data = Object.fromEntries(new FormData(form).entries());
    localStorage.setItem(key, JSON.stringify(data));
    setArticleDraft(data as Record<string, string>);
  }

  function handlePreview(form: HTMLFormElement, imageFile?: File | null) {
    const data = new FormData(form);
    setPreviewArticle({
      title: String(data.get("title") || "Untitled report"),
      excerpt: String(data.get("excerpt") || ""),
      category: categories.find((category) => String(category.id) === String(data.get("category")))?.name ?? "Uncategorized",
      content: String(data.get("content") || ""),
      image: imageFile ? URL.createObjectURL(imageFile) : undefined,
      tags: String(data.get("tag_names") || ""),
      status: getEditorialState(String(data.get("publish_action") || "draft")).editorialStatus
    });
  }

  function validateArticleForm(form: FormData) {
    const category = Number(form.get("category"));
    if (!category) {
      setMessage("Choose a category before saving the article.");
      return null;
    }
    const articleContent = String(form.get("content") ?? "").trim();
    const textContent = articleContent.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
    const hasMedia = /<(img|iframe|video)\b/i.test(articleContent);
    if (!textContent && !hasMedia) {
      setMessage("Add the article body, photo, or video before saving.");
      return null;
    }
    return { category, articleContent };
  }

  async function handleCreateArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const action = getSubmitAction(event);
    const form = new FormData(event.currentTarget);
    const valid = validateArticleForm(form);
    if (!valid) {
      return;
    }

    await runAction("create-article", () =>
      adminCreateArticle(token, articleFormPayload(form, valid.category, valid.articleContent, articleImageFile, action))
    );
    event.currentTarget.reset();
    setArticleImageFile(null);
    setArticleEditorKey((current) => current + 1);
    localStorage.removeItem("solakuti.articleDraft");
    setArticleDraft({});
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
  }

  async function handleUpdateArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const action = getSubmitAction(event);
    if (!editingArticle) {
      return;
    }
    const form = new FormData(event.currentTarget);
    const valid = validateArticleForm(form);
    if (!valid) {
      return;
    }

    await runAction("update-article", () =>
      adminUpdateArticle(token, editingArticle.slug, articleFormPayload(form, valid.category, valid.articleContent, editImageFile, action))
    );
    setEditImageFile(null);
    setEditingArticle(null);
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
              title="Create article"
              onSubmit={handleCreateArticle}
              busy={busy === "create-article"}
              hideDefaultSubmit
              onInput={(event) => saveLocalDraft(event.currentTarget)}
            >
              <TextInput name="title" placeholder="Headline" defaultValue={articleDraft.title ?? ""} required />
              <Textarea name="excerpt" placeholder="Short excerpt" rows={3} defaultValue={articleDraft.excerpt ?? ""} required />
              <RichTextEditor name="content" label="Article body" resetKey={articleEditorKey} initialHtml={articleDraft.content ?? ""} mediaAssets={media} />
              <FileInput
                label="Featured image"
                onChange={(file) => setArticleImageFile(file)}
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
                <div className="border-b border-black/10 bg-[#f7f4ef] p-4">
                  <AdminForm title={`Edit: ${editingArticle.title}`} onSubmit={handleUpdateArticle} busy={busy === "update-article"} hideDefaultSubmit>
                    <TextInput name="title" placeholder="Headline" defaultValue={editingArticle.title} required />
                    <Textarea name="excerpt" placeholder="Short excerpt" rows={3} defaultValue={editingArticle.excerpt} required />
                    <RichTextEditor
                      name="content"
                      label="Article body"
                      initialHtml={editingArticle.contentHtml ?? editingArticle.body.map((paragraph) => `<p>${paragraph}</p>`).join("")}
                      resetKey={editEditorKey}
                      mediaAssets={media}
                    />
                    <FileInput
                      label="Replace featured image"
                      helper="Leave empty to keep the current image."
                      onChange={(file) => setEditImageFile(file)}
                    />
                    <TextInput name="tag_names" placeholder="Optional tags, separated by commas" defaultValue={(editingArticle.tags ?? []).join(", ")} />
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
                onDelete={(article) => runAction(`delete-article-${article.slug}`, () => adminDeleteArticle(token, article.slug))}
              />
            </div>
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
                  {article.published && (
                    <Link href={`/article/${article.slug}`} target="_blank" className="grid size-9 place-items-center rounded-full border border-black/10 text-black/60 transition hover:border-black hover:bg-black hover:text-white" aria-label="Open article">
                      <ExternalLink className="size-4" />
                    </Link>
                  )}
                  <LoadingButton type="button" loading={busy === `edit-load-${article.slug}`} onClick={() => onEdit(article.slug)} className="grid size-9 place-items-center rounded-full border border-black/10 text-black/60 transition hover:border-black hover:bg-black hover:text-white" aria-label="Edit article">
                    <Pencil className="size-4" />
                  </LoadingButton>
                  <LoadingButton type="button" onClick={() => onDelete(article)} className="grid size-9 place-items-center rounded-full border border-black/10 text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white" aria-label="Delete article">
                    <Trash2 className="size-4" />
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
                      {article.published && (
                        <Link href={`/article/${article.slug}`} target="_blank" className="grid size-9 place-items-center rounded-full border border-black/10 text-black/60 transition hover:border-black hover:bg-black hover:text-white" aria-label="Open article">
                          <ExternalLink className="size-4" />
                        </Link>
                      )}
                      <LoadingButton type="button" loading={busy === `edit-load-${article.slug}`} onClick={() => onEdit(article.slug)} className="grid size-9 place-items-center rounded-full border border-black/10 text-black/60 transition hover:border-black hover:bg-black hover:text-white" aria-label="Edit article">
                        <Pencil className="size-4" />
                      </LoadingButton>
                      <LoadingButton type="button" onClick={() => onDelete(article)} className="grid size-9 place-items-center rounded-full border border-black/10 text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white" aria-label="Delete article">
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
  preview: { title: string; excerpt: string; category: string; content: string; image?: string; tags: string; status: string };
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
        {preview.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview.image} alt="" className="h-72 w-full object-cover" />
        )}
        <article className="p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">{preview.category}</p>
          <h1 className="mt-3 text-4xl font-black leading-none tracking-[-0.06em] text-[#111]">{preview.title}</h1>
          <p className="mt-4 text-lg leading-8 text-black/60">{preview.excerpt}</p>
          {preview.tags && <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-black/35">{preview.tags}</p>}
          <div className="article-body mt-8" dangerouslySetInnerHTML={{ __html: preview.content }} />
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

function FileInput({
  label,
  helper,
  onChange
}: {
  label: string;
  helper?: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="block min-w-0 overflow-hidden rounded-md border border-black/10 bg-white p-3">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-black/42">{label}</span>
      <input
        type="file"
        accept="image/*"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        className="mt-2 min-w-0 w-full text-xs font-bold text-black/62 file:mr-2 file:rounded-full file:border-0 file:bg-black file:px-3 file:py-2 file:text-[10px] file:font-black file:uppercase file:tracking-[0.08em] file:text-white sm:text-sm sm:file:mr-3 sm:file:px-4 sm:file:text-xs sm:file:tracking-[0.12em]"
      />
      {helper && <span className="mt-2 block text-xs font-bold text-black/38">{helper}</span>}
    </label>
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
