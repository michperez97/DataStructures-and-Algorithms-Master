import { useState } from "react";
import { Link } from "react-router";
import { Search, ArrowUpRight, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { KnowledgeNode, KnowledgeNodeStatus } from "@/db/schema";

interface SyllabusPanelProps {
  siblings: KnowledgeNode[];
  activeNodeId: string;
  category: string;
  coveredCount: number;
  totalCount: number;
  progressPercent: number;
  prerequisites: KnowledgeNode[];
}

// ─── Status node on the timeline ─────────────────────────────────────

const NODE_STYLES: Record<KnowledgeNodeStatus, { ring: string; fill: string }> = {
  NotCovered: {
    ring: "border-stone-300 dark:border-stone-600",
    fill: "",
  },
  InProgress: {
    ring: "border-amber-400 dark:border-amber-500",
    fill: "bg-amber-400/40 dark:bg-amber-500/40",
  },
  Covered: {
    ring: "border-emerald-500 dark:border-emerald-400",
    fill: "bg-emerald-500 dark:bg-emerald-400",
  },
  Weak: {
    ring: "border-red-400 dark:border-red-400",
    fill: "bg-red-400/40 dark:bg-red-400/40",
  },
  Mastered: {
    ring: "border-emerald-500 dark:border-emerald-400",
    fill: "bg-emerald-500 dark:bg-emerald-400",
  },
};

function StatusNode({
  status,
  isActive,
}: {
  status: KnowledgeNodeStatus | undefined;
  isActive: boolean;
}) {
  const resolved = status ?? "NotCovered";
  const style = NODE_STYLES[resolved];
  return (
    <div
      className={`relative z-10 flex size-3 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all ${
        isActive
          ? "border-white/60 dark:border-stone-900/60"
          : style.ring
      }`}
    >
      {(resolved !== "NotCovered") && (
        <div
          className={`size-1.5 rounded-full ${
            isActive ? "bg-white/80 dark:bg-stone-900/80" : style.fill
          }`}
        />
      )}
    </div>
  );
}

// ─── Segmented progress blocks ───────────────────────────────────────

function SegmentedProgress({
  siblings,
}: {
  siblings: KnowledgeNode[];
}) {
  return (
    <div className="flex gap-[3px]">
      {siblings.map((node) => {
        const s = node.status ?? "NotCovered";
        let bg = "bg-stone-200 dark:bg-stone-700/50";
        if (s === "Covered" || s === "Mastered")
          bg = "bg-emerald-500 dark:bg-emerald-400";
        else if (s === "InProgress")
          bg = "bg-amber-400 dark:bg-amber-500";
        else if (s === "Weak")
          bg = "bg-red-400";
        return (
          <div
            key={node.nodeId}
            className={`h-1 flex-1 rounded-full ${bg} transition-colors`}
          />
        );
      })}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export function SyllabusPanel({
  siblings,
  activeNodeId,
  category,
  coveredCount,
  totalCount,
  progressPercent,
  prerequisites,
}: SyllabusPanelProps) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? siblings.filter((n) =>
        n.title.toLowerCase().includes(search.toLowerCase()),
      )
    : siblings;

  return (
    <div className="flex h-full w-72 shrink-0 flex-col overflow-hidden rounded-[24px] bg-white/80 backdrop-blur-2xl dark:bg-[#201E1D]/80">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="space-y-3 p-4 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[0.625rem] font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500">
              Syllabus
            </p>
            <h2 className="mt-1 text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-100">
              {category}
            </h2>
          </div>
          <div className="flex items-baseline gap-1 rounded-lg bg-stone-100 px-2 py-1 dark:bg-white/5">
            <span className="font-mono text-xs font-semibold tabular-nums text-stone-900 dark:text-stone-100">
              {progressPercent}
            </span>
            <span className="font-mono text-[0.5625rem] text-stone-400">%</span>
          </div>
        </div>

        {/* Segmented progress */}
        <div className="space-y-1.5">
          <SegmentedProgress siblings={siblings} />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[0.625rem] tabular-nums text-stone-400">
              {coveredCount}/{totalCount} completed
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Filter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 rounded-lg border-stone-200/60 bg-stone-50 pl-7 font-mono text-[0.6875rem] dark:border-white/5 dark:bg-white/5"
          />
        </div>
      </div>

      {/* ── Scrollable content ─────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pb-2">
        {/* ── Prerequisites section ──────────────────────── */}
        {prerequisites.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 font-mono text-[0.625rem] font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500">
              Prerequisites
            </p>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[5px] top-2 bottom-2 w-px bg-stone-300/50 dark:bg-white/[0.04]" />

              {prerequisites.map((prereq) => {
                const isGenerated = prereq.category === "Generated";
                return (
                  <Link
                    key={prereq.nodeId}
                    to={`/explorer/${prereq.nodeId}`}
                    className="group relative flex items-center gap-3 rounded-xl py-1.5 pl-0 pr-2 text-stone-500 transition-all hover:bg-stone-50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/[0.03] dark:hover:text-stone-200"
                  >
                    {/* Timeline node */}
                    <div className="flex w-[11px] shrink-0 items-center justify-center">
                      <ArrowUpRight className="relative z-10 size-3 shrink-0 opacity-40 transition-opacity group-hover:opacity-80" />
                    </div>

                    <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-medium leading-tight">
                      {prereq.title}
                    </span>

                    {isGenerated && (
                      <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 font-mono text-[0.5rem] font-medium uppercase tracking-wider text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        new
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Subtopics section ──────────────────────────── */}
        <div>
          <p className="mb-2 font-mono text-[0.625rem] font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500">
            Subtopics
          </p>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[5px] top-2 bottom-2 w-px bg-stone-200 dark:bg-white/[0.06]" />

            {filtered.map((node, i) => {
              const isActive = node.nodeId === activeNodeId;
              return (
                <Link
                  key={node.nodeId}
                  to={`/explorer/${node.nodeId}`}
                  className={`group relative flex items-center gap-3 rounded-xl py-2 pl-0 pr-2 transition-all ${
                    isActive
                      ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/[0.03] dark:hover:text-stone-200"
                  }`}
                >
                  {/* Timeline node */}
                  <div className="flex w-[11px] shrink-0 items-center justify-center">
                    <StatusNode status={node.status} isActive={isActive} />
                  </div>

                  {/* Index + title */}
                  <span
                    className={`font-mono text-[0.5625rem] tabular-nums ${
                      isActive
                        ? "text-white/40 dark:text-stone-900/40"
                        : "text-stone-300 dark:text-stone-600"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-medium leading-tight">
                    {node.title}
                  </span>

                  {/* Active arrow */}
                  {isActive && (
                    <ChevronRight className="size-3 shrink-0 opacity-50" />
                  )}
                </Link>
              );
            })}

            {filtered.length === 0 && (
              <p className="py-6 text-center font-mono text-[0.625rem] text-stone-400">
                No matches
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
