import { Link } from "react-router";
import type { Module, ClassAssessment } from "@/db/schema";

interface WeekCardProps {
  weekNumber: number;
  module: Module;
  assessments: ClassAssessment[];
  isCurrent?: boolean;
}

export function WeekCard({
  weekNumber,
  module,
  assessments,
  isCurrent,
}: WeekCardProps) {
  const hasExam = assessments.some((a) => a.type === "Exam");
  const hasQuiz = assessments.some((a) => a.type === "Quiz");

  return (
    <Link
      to={`/my-course/week/${weekNumber}`}
      className={`group relative flex flex-col rounded-xl border px-3 py-2.5 transition-all hover:shadow-md ${
        isCurrent
          ? "border-stone-200/80 border-l-[3px] border-l-primary bg-white/80 dark:border-white/[0.06] dark:border-l-primary dark:bg-[#201E1D]/80"
          : "border-stone-200/80 bg-white/80 dark:border-white/[0.06] dark:bg-[#201E1D]/80"
      } hover:border-stone-300 dark:hover:border-white/15`}
    >
      <span className="font-mono text-[10px] text-muted-foreground">{weekNumber}</span>
      <p className="mt-0.5 text-[11px] font-medium leading-tight text-stone-800 dark:text-stone-200 line-clamp-2">
        {module.name.replace(/^Week\s*\d+[:\s—–-]*/i, "")}
      </p>
      {(hasExam || hasQuiz) && (
        <div className="mt-auto flex gap-1 pt-1.5">
          {hasExam && (
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" title="Exam" />
          )}
          {hasQuiz && (
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400" title="Quiz" />
          )}
        </div>
      )}
    </Link>
  );
}
