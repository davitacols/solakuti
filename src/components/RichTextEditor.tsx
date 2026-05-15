"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  RemoveFormatting
} from "lucide-react";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  name: string;
  label: string;
  resetKey?: number;
  initialHtml?: string;
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

export default function RichTextEditor({ name, label, resetKey = 0, initialHtml = "" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState("");
  const [focused, setFocused] = useState(false);

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

  function addLink() {
    const url = window.prompt("Paste the link URL");
    if (!url) {
      return;
    }
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    runCommand("createLink", normalized);
  }

  return (
    <div className="rounded-lg border border-black/10 bg-white">
      <div className="flex flex-col gap-3 border-b border-black/10 p-3">
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs font-black uppercase tracking-[0.18em] text-black/42">
            {label}
          </label>
          <span className="text-xs font-bold text-black/35">Rich text</span>
        </div>
        <div className="flex flex-wrap gap-1">
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
        </div>
      </div>

      <div className="relative">
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
            "admin-rich-editor min-h-72 w-full rounded-b-lg p-4 text-sm font-semibold leading-7 text-black/76 outline-none",
            "focus:ring-4 focus:ring-red-600/10"
          )}
        />
      </div>
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
