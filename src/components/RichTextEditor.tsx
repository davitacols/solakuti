"use client";

import { useEffect, useRef, useState } from "react";
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
  RemoveFormatting,
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

export default function RichTextEditor({ name, label, resetKey = 0, initialHtml = "", mediaAssets = [] }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState("");
  const [focused, setFocused] = useState(false);
  const visibleMedia = mediaAssets.slice(0, 8);

  useEffect(() => {
    setHtml(initialHtml);
    if (editorRef.current) {
      editorRef.current.innerHTML = initialHtml;
    }
  }, [initialHtml, resetKey]);

  function sync() {
    setHtml(editorRef.current?.innerHTML ?? "");
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

  function insertMediaAsset(asset: AdminMediaAsset) {
    const url = asset.optimized_url ?? asset.file ?? asset.thumbnail_url;
    if (!url) {
      return;
    }
    if (asset.asset_type === "video") {
      addVideo(url, asset.title);
      return;
    }
    addImage(url, asset.alt_text || asset.title);
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
        {!html && !focused && (
          <p className="pointer-events-none absolute left-4 top-4 text-sm font-semibold text-black/32">
            Write the story body. Use headings, lists, quotes and links where needed.
          </p>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={sync}
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
      </div>
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
