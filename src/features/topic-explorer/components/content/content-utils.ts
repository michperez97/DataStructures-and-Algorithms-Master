import type { ReactNode } from "react";
import { createElement } from "react";

// ─── Types ───────────────────────────────────────────────────────────

export interface ParsedStep {
  type: string;
  content: string;
  expectedAnswer?: string;
  postAnswer?: string;
}

export interface ContentBlock {
  type: "text" | "code" | "callout";
  content: string;
  calloutKind?: string;
}

// ─── Constants ───────────────────────────────────────────────────────

export const STEP_STYLE: Record<string, string> = {
  Explain: "border-l-blue-500",
  Prompt: "border-l-amber-500",
  Check: "border-l-green-500",
  Hint: "border-l-purple-500",
  Transition: "border-l-cyan-500",
  Summary: "border-l-rose-500",
};

export const CALLOUT_STYLES: Record<
  string,
  { bg: string; border: string; label: string; labelColor: string }
> = {
  DEFINITION: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800/30",
    label: "Definition",
    labelColor: "text-blue-700 dark:text-blue-400",
  },
  EXAMPLE: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800/30",
    label: "Example",
    labelColor: "text-emerald-700 dark:text-emerald-400",
  },
  "KEY INSIGHT": {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-700/30",
    label: "Key Insight",
    labelColor: "text-amber-700 dark:text-amber-400",
  },
  "SIMPLY PUT": {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-800/30",
    label: "Simply Put",
    labelColor: "text-purple-700 dark:text-purple-400",
  },
  "TRY IT": {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800/30",
    label: "Try It Yourself",
    labelColor: "text-orange-700 dark:text-orange-400",
  },
};

export const CODE_LINE_PATTERNS = [
  /^\s*(function|for|if|else|let|const|var|return|while|class|import|export|def|int |void |public |private )\b/,
  /^\s*[{}()[\]];?\s*$/,
  /\/\/\s/,
  /=>/,
  /[+\-*]=\s/,
  /^\s{2,}\S.*[;{}()]/,
  /^\s*\w+\(.*\)\s*[{;]?\s*$/,
];

export const CALLOUT_OPEN =
  /^\[(DEFINITION|EXAMPLE|KEY INSIGHT|SIMPLY PUT|TRY IT)\]\s*$/;
export const CALLOUT_CLOSE =
  /^\[\/(DEFINITION|EXAMPLE|KEY INSIGHT|SIMPLY PUT|TRY IT)\]\s*$/;

// ─── Pure Functions ──────────────────────────────────────────────────

export function parseStep(raw: string): ParsedStep {
  try {
    return JSON.parse(raw) as ParsedStep;
  } catch {
    return { type: "Explain", content: raw };
  }
}

export function renderInlineBold(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return createElement(
        "strong",
        { key: i, className: "font-semibold" },
        part.slice(2, -2),
      );
    }
    return createElement("span", { key: i }, part);
  });
}

export function isCodeLine(line: string): boolean {
  return CODE_LINE_PATTERNS.some((p) => p.test(line));
}

export function parseContentBlocks(content: string): ContentBlock[] {
  const lines = content.split("\n");
  const blocks: ContentBlock[] = [];

  let i = 0;
  while (i < lines.length) {
    const openMatch = lines[i].match(CALLOUT_OPEN);
    if (openMatch) {
      const kind = openMatch[1];
      const calloutLines: string[] = [];
      i++;
      while (i < lines.length && !CALLOUT_CLOSE.test(lines[i])) {
        calloutLines.push(lines[i]);
        i++;
      }
      blocks.push({
        type: "callout",
        content: calloutLines.join("\n").trim(),
        calloutKind: kind,
      });
      i++;
      continue;
    }

    const buffer: string[] = [];
    const lineIsCode = isCodeLine(lines[i]);
    const blockType = lineIsCode ? ("code" as const) : ("text" as const);

    while (
      i < lines.length &&
      !CALLOUT_OPEN.test(lines[i]) &&
      isCodeLine(lines[i]) === lineIsCode
    ) {
      buffer.push(lines[i]);
      i++;
    }

    if (buffer.length > 0) {
      const joined = buffer.join("\n");
      if (joined.trim()) {
        blocks.push({ type: blockType, content: joined });
      }
    }
  }

  return blocks;
}
