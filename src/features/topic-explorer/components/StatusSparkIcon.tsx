import type { KnowledgeNodeStatus } from "@/db/schema";

const STATUS_FILL: Record<KnowledgeNodeStatus, number> = {
  NotCovered: 0,
  InProgress: 33,
  Covered: 66,
  Weak: 33,
  Mastered: 100,
};

const STATUS_COLOR: Record<KnowledgeNodeStatus, string> = {
  NotCovered: "text-stone-300 dark:text-stone-600",
  InProgress: "text-amber-500",
  Covered: "text-blue-500",
  Weak: "text-red-400",
  Mastered: "text-emerald-500",
};

interface StatusSparkIconProps {
  status: KnowledgeNodeStatus | undefined;
  className?: string;
}

export function StatusSparkIcon({ status, className = "" }: StatusSparkIconProps) {
  const resolved = status ?? "NotCovered";
  const pct = STATUS_FILL[resolved];
  const color = STATUS_COLOR[resolved];
  const clipTop = 100 - pct;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`size-4 shrink-0 ${color} ${className}`}
      aria-label={`${resolved} status`}
    >
      {/* Outline layer */}
      <path
        d="M12 2L14.5 9L22 9.5L16.5 14L18.5 22L12 17.5L5.5 22L7.5 14L2 9.5L9.5 9L12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Filled layer clipped from top */}
      <path
        d="M12 2L14.5 9L22 9.5L16.5 14L18.5 22L12 17.5L5.5 22L7.5 14L2 9.5L9.5 9L12 2Z"
        fill="currentColor"
        style={{ clipPath: `inset(${clipTop}% 0 0 0)` }}
      />
    </svg>
  );
}
