import React from "react";

/**
 * Lightweight markdown renderer (headers, bold, unordered lists) — not a
 * full CommonMark parser, just enough to render project README content
 * without pulling in a markdown library.
 */
export function renderMarkdown(text: string | null | undefined): React.ReactNode {
  if (!text) return null;

  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string | number) => {
    if (listBuffer.length === 0) return;
    blocks.push(
      <ul key={`ul-${key}`} className="list-disc pl-5 my-0.5 text-theme-neutral-300">
        {listBuffer.map((item, i) => (
          <li key={i}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  lines.forEach((line: string, idx: number) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
      listBuffer.push(trimmed.replace(/^[-*]\s*/, ""));
      return;
    }
    flushList(idx);

    if (!trimmed) {
      blocks.push(<div key={idx} className="h-1.5" />);
      return;
    }

    if (trimmed.startsWith("###")) {
      blocks.push(
        <h4 key={idx} className="text-[0.9em] font-mono font-bold uppercase tracking-widest text-theme-accent-teal mt-3 mb-1">
          {trimmed.replace(/^###\s*/, "")}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith("##") || trimmed.startsWith("#")) {
      blocks.push(
        <h3 key={idx} className="text-[1.05em] font-mono font-extrabold uppercase tracking-widest text-theme-neutral-200 mt-4 mb-2 border-b border-theme-border pb-1">
          {trimmed.replace(/^#+\s*/, "")}
        </h3>
      );
      return;
    }

    blocks.push(<p key={idx} className="text-theme-neutral-300 leading-relaxed my-0.5">{renderInlineMarkdown(trimmed)}</p>);
  });

  flushList("end");
  return blocks;
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part: string, i: number) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-extrabold text-theme-accent-teal">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

/**
 * Strips markdown syntax and returns a short plain-text preview, for card
 * grids / list views / the PDF export where a full README would be unreadable.
 */
export function getMarkdownExcerpt(text: string | null | undefined, maxLength = 160): string {
  if (!text) return "";

  const plain = text
    .replace(/^#+\s*/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}
