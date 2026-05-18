"use client";

import { ChangeEvent, FormEvent, KeyboardEvent, MouseEvent, useEffect, useRef, useState } from "react";
import {
  Bold,
  Heading2,
  Heading3,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  RemoveFormatting,
  Trash2,
  Undo2,
  Video
} from "lucide-react";
import type { AdminMediaAsset } from "@/lib/api";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  name: string;
  label: string;
  resetKey?: number;
  initialHtml?: string;
  mediaAssets?: AdminMediaAsset[];
  onUploadMediaFiles?: (files: File[]) => Promise<AdminMediaAsset[]>;
  onHtmlChange?: (html: string) => void;
};

const toolbar = [
  { label: "Paragraph", icon: Pilcrow, command: "formatBlock", value: "p" },
  { label: "Heading 2", icon: Heading2, command: "formatBlock", value: "h2" },
  { label: "Heading 3", icon: Heading3, command: "formatBlock", value: "h3" },
  { label: "Bold", icon: Bold, command: "bold" },
  { label: "Italic", icon: Italic, command: "italic" },
  { label: "Bulleted list", icon: List, command: "insertUnorderedList" },
  { label: "Numbered list", icon: ListOrdered, command: "insertOrderedList" },
  { label: "Quote", icon: Quote, command: "formatBlock", value: "blockquote" },
  { label: "Clear format", icon: RemoveFormatting, command: "removeFormat" }
];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function getVideoEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const watchId = parsed.searchParams.get("v");
      const pathParts = parsed.pathname.split("/").filter(Boolean);
      const embedId = watchId ?? (pathParts[0] === "shorts" || pathParts[0] === "embed" ? pathParts[1] : null);
      return embedId ? `https://www.youtube.com/embed/${embedId}` : null;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).find((part) => /^\d+$/.test(part));
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

export default function RichTextEditor({
  name,
  label,
  resetKey = 0,
  initialHtml = "",
  mediaAssets = [],
  onUploadMediaFiles,
  onHtmlChange
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const plainEditorRef = useRef<HTMLTextAreaElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [focused, setFocused] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [simpleMode, setSimpleMode] = useState(false);
  const selectedMediaRef = useRef<Element | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<string | null>(null);
  const visibleMedia = mediaAssets.slice(0, 8);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialHtml;
    }
    if (plainEditorRef.current) {
      plainEditorRef.current.value = htmlToText(initialHtml);
    }
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = initialHtml;
    }
    setIsEmpty(!htmlToText(initialHtml));
  }, [initialHtml, resetKey]);

  function sync() {
    const nextHtml = editorRef.current?.innerHTML ?? "";
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = nextHtml;
    }
    onHtmlChange?.(nextHtml);
    const nextIsEmpty = !htmlToText(nextHtml);
    setIsEmpty((current) => (current === nextIsEmpty ? current : nextIsEmpty));
  }

  function syncPlainText() {
    const text = plainEditorRef.current?.value ?? "";
    const nextHtml = textToHtml(text);
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = nextHtml;
    }
    onHtmlChange?.(nextHtml);
    const nextIsEmpty = !text.trim();
    setIsEmpty((current) => (current === nextIsEmpty ? current : nextIsEmpty));
  }

  function toggleSimpleMode() {
    setSimpleMode((current) => {
      const nextMode = !current;
      window.setTimeout(() => {
        if (nextMode) {
          const html = editorRef.current?.innerHTML ?? hiddenInputRef.current?.value ?? "";
          if (plainEditorRef.current) {
            plainEditorRef.current.value = htmlToText(html);
            plainEditorRef.current.focus();
          }
        } else {
          const html = hiddenInputRef.current?.value ?? "";
          if (editorRef.current) {
            editorRef.current.innerHTML = html;
            editorRef.current.focus();
          }
        }
      }, 0);
      return nextMode;
    });
  }

  function selectMedia(media: Element | null) {
    selectedMediaRef.current = media;
    if (!media) {
      setSelectedMediaType(null);
      return;
    }
    setSelectedMediaType(media.classList.contains("story-media-video") ? "video" : "media");
  }

  function runCommand(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    sync();
  }

  function insertHtml(markup: string) {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, markup);
    sync();
  }

  function addLink() {
    const url = window.prompt("Paste the link URL");
    if (!url) {
      return;
    }
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    runCommand("createLink", normalized);
  }

  function addImage(urlValue?: string, altValue?: string) {
    const url = normalizeUrl(urlValue ?? window.prompt("Paste image URL") ?? "");
    if (!url) {
      return;
    }
    const alt = altValue ?? window.prompt("Image caption or alt text") ?? "";
    insertHtml(
      `<figure class="story-media story-media-image"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy" />${
        alt ? `<figcaption>${escapeHtml(alt)}</figcaption>` : ""
      }</figure><p><br></p>`
    );
  }

  function addVideo(urlValue?: string, titleValue?: string) {
    const url = normalizeUrl(urlValue ?? window.prompt("Paste YouTube, Vimeo, or direct video URL") ?? "");
    if (!url) {
      return;
    }
    const title = titleValue ?? "Embedded video";
    const embedUrl = getVideoEmbedUrl(url);
    if (embedUrl) {
      insertHtml(
        `<figure class="story-media story-media-video"><iframe src="${escapeHtml(embedUrl)}" title="${escapeHtml(
          title
        )}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></figure><p><br></p>`
      );
      return;
    }
    if (isDirectVideo(url)) {
      insertHtml(
        `<figure class="story-media story-media-video"><video controls preload="metadata"><source src="${escapeHtml(
          url
        )}" /></video></figure><p><br></p>`
      );
      return;
    }
    window.alert("Use a YouTube, Vimeo, or direct .mp4/.webm/.ogg video link.");
  }

  function insertUploadedVideo(url: string, title: string) {
    insertHtml(
      `<figure class="story-media story-media-video"><video controls playsinline preload="metadata" title="${escapeHtml(
        title
      )}"><source src="${escapeHtml(url)}" type="video/mp4" /></video></figure><p><br></p>`
    );
  }

  function insertMediaAsset(asset: AdminMediaAsset) {
    const url = asset.optimized_url ?? asset.file ?? asset.thumbnail_url;
    if (!url) {
      return;
    }
    if (asset.asset_type === "video") {
      insertUploadedVideo(url, asset.title);
      return;
    }
    addImage(url, asset.alt_text || asset.title);
  }

  async function handleUploadSelection(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length || !onUploadMediaFiles) {
      return;
    }
    setUploading(true);
    try {
      const uploadedAssets = await onUploadMediaFiles(files);
      uploadedAssets.forEach((asset) => insertMediaAsset(asset));
    } finally {
      setUploading(false);
    }
  }

  function removeMediaAtSelection(event: { preventDefault: () => void }) {
    const selection = window.getSelection();
    const current = editorRef.current;
    if (!selection || !current || !selection.isCollapsed) {
      return false;
    }
    const node = selection.anchorNode;
    const element = node instanceof Element ? node : node?.parentElement;
    const media = element?.closest(".story-media");
    if (media && current.contains(media)) {
      event.preventDefault();
      media.remove();
      selectMedia(null);
      sync();
      return true;
    }
    return false;
  }

  function removeSelectedMedia() {
    const media = selectedMediaRef.current;
    const current = editorRef.current;
    if (!media || !current || !current.contains(media)) {
      selectMedia(null);
      return;
    }
    media.remove();
    selectMedia(null);
    sync();
    editorRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Backspace" && event.key !== "Delete") {
      return;
    }
    removeMediaAtSelection(event);
  }

  function handleBeforeInput(event: FormEvent<HTMLDivElement>) {
    const inputType = (event.nativeEvent as InputEvent).inputType;
    if (inputType !== "deleteContentBackward" && inputType !== "deleteContentForward") {
      return;
    }
    removeMediaAtSelection(event);
  }

  function handleEditorClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target instanceof Element ? event.target : null;
    const media = target?.closest(".story-media") ?? null;
    if (media && editorRef.current?.contains(media)) {
      selectMedia(media);
      return;
    }
    selectMedia(null);
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-black/10 bg-white">
      <div className="flex flex-col gap-3 border-b border-black/10 p-3">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <label className="text-xs font-black uppercase tracking-[0.18em] text-black/42">
            {label}
          </label>
          <span className="text-xs font-bold text-black/35">Rich text</span>
        </div>
        <div className="flex min-w-0 flex-wrap gap-1">
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand("undo")}
            className="grid size-9 place-items-center rounded-md text-black/62 transition hover:bg-black hover:text-white"
            aria-label="Undo"
            title="Undo"
          >
            <Undo2 className="size-4" />
          </button>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand("redo")}
            className="grid size-9 place-items-center rounded-md text-black/62 transition hover:bg-black hover:text-white"
            aria-label="Redo"
            title="Redo"
          >
            <Redo2 className="size-4" />
          </button>
          {toolbar.map(({ label: itemLabel, icon: Icon, command, value }) => (
            <button
              key={`${command}-${value ?? itemLabel}`}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => runCommand(command, value)}
              className="grid size-9 place-items-center rounded-md text-black/62 transition hover:bg-black hover:text-white"
              aria-label={itemLabel}
              title={itemLabel}
            >
              <Icon className="size-4" />
            </button>
          ))}
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={addLink}
            className="grid size-9 place-items-center rounded-md text-black/62 transition hover:bg-black hover:text-white"
            aria-label="Add link"
            title="Add link"
          >
            <Link className="size-4" />
          </button>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => addImage()}
            className="grid size-9 place-items-center rounded-md text-black/62 transition hover:bg-black hover:text-white"
            aria-label="Insert photo"
            title="Insert photo"
          >
            <Image className="size-4" />
          </button>
          {onUploadMediaFiles && (
            <>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => uploadInputRef.current?.click()}
                className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-xs font-black uppercase tracking-[0.1em] text-black/62 transition hover:bg-black hover:text-white"
                aria-label="Upload story media"
                title="Upload photos or videos"
              >
                <Image className="size-4" />
                {uploading ? "Uploading" : "Media"}
              </button>
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                multiple
                className="hidden"
                onChange={handleUploadSelection}
              />
            </>
          )}
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => addVideo()}
            className="grid size-9 place-items-center rounded-md text-black/62 transition hover:bg-black hover:text-white"
            aria-label="Insert video"
            title="Insert video"
          >
            <Video className="size-4" />
          </button>
          {selectedMediaType && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={removeSelectedMedia}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-red-50 px-3 text-xs font-black uppercase tracking-[0.1em] text-red-700 transition hover:bg-red-600 hover:text-white"
              aria-label={`Remove selected ${selectedMediaType}`}
              title={`Remove selected ${selectedMediaType}`}
            >
              <Trash2 className="size-4" />
              Remove {selectedMediaType}
            </button>
          )}
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={toggleSimpleMode}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-md px-3 text-xs font-black uppercase tracking-[0.1em] transition",
              simpleMode ? "bg-[#111] text-white" : "text-black/62 hover:bg-black hover:text-white"
            )}
            aria-label="Toggle mobile text mode"
            title="Use this on mobile if the cursor jumps while typing"
          >
            Mobile text
          </button>
        </div>
        {visibleMedia.length > 0 && (
          <div className="border-t border-black/10 pt-3">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/35">Insert from media library</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {visibleMedia.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => insertMediaAsset(asset)}
                  className="group relative h-16 w-24 shrink-0 overflow-hidden rounded-md border border-black/10 bg-black/5 text-left transition hover:border-black"
                  title={`Insert ${asset.title}`}
                >
                  {asset.asset_type === "image" && (asset.thumbnail_url || asset.optimized_url) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.thumbnail_url ?? asset.optimized_url}
                      alt={asset.alt_text || asset.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center bg-[#111] text-white">
                      <Video className="size-5" />
                    </span>
                  )}
                  <span className="absolute inset-x-1 bottom-1 truncate rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-black text-white">
                    {asset.asset_type}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative min-w-0">
        {isEmpty && !focused && !simpleMode && (
          <p className="pointer-events-none absolute left-4 top-4 text-sm font-semibold text-black/32">
            Write the story body. Use headings, lists, quotes and links where needed.
          </p>
        )}
        {simpleMode ? (
          <textarea
            ref={plainEditorRef}
            onInput={syncPlainText}
            onBlur={() => {
              setFocused(false);
              syncPlainText();
            }}
            onFocus={() => setFocused(true)}
            defaultValue={htmlToText(initialHtml)}
            placeholder="Write or edit the story body here. Paragraphs are kept when you publish."
            className="min-h-96 w-full resize-y rounded-b-lg border-0 bg-white p-4 text-base font-semibold leading-8 text-black/76 outline-none focus:ring-4 focus:ring-red-600/10"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={sync}
            onBeforeInput={handleBeforeInput}
            onKeyDown={handleKeyDown}
            onClick={handleEditorClick}
            onBlur={() => {
              setFocused(false);
              sync();
            }}
            onFocus={() => setFocused(true)}
            className={cn(
              "admin-rich-editor min-h-72 min-w-0 w-full max-w-full overflow-x-hidden break-words rounded-b-lg p-4 text-sm font-semibold leading-7 text-black/76 outline-none",
              "focus:ring-4 focus:ring-red-600/10"
            )}
          />
        )}
      </div>
      <input ref={hiddenInputRef} type="hidden" name={name} defaultValue={initialHtml} />
    </div>
  );
}

function htmlToText(value: string) {
  return value
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h1|h2|h3|h4|blockquote|li)>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function textToHtml(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}
