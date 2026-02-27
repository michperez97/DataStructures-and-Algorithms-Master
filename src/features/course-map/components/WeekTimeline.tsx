import { WeekCard } from "./WeekCard";
import { COT4400_WEEKS } from "../data/cot4400-course";
import type { Module, ClassAssessment } from "@/db/schema";

interface WeekTimelineProps {
  modules: Module[];
  assessments: ClassAssessment[];
  currentWeek?: number;
}

// Spring 2026: weeks 1–4 = Jan, 5–8 = Feb, 9–12 = Mar, 13–16 = Apr
const MONTH_GROUPS: { label: string; weeks: number[] }[] = [
  { label: "January", weeks: [1, 2, 3, 4] },
  { label: "February", weeks: [5, 6, 7, 8] },
  { label: "March", weeks: [9, 10, 11, 12] },
  { label: "April", weeks: [13, 14, 15, 16] },
];

export function WeekTimeline({
  modules,
  assessments,
  currentWeek,
}: WeekTimelineProps) {
  const moduleMap = new Map(modules.map((m) => [m.moduleId, m]));
  const assessmentMap = new Map(
    assessments.map((a) => [a.assessmentId, a]),
  );
  const weekMap = new Map(COT4400_WEEKS.map((w) => [w.weekNumber, w]));

  return (
    <div className="space-y-5">
      {MONTH_GROUPS.map((group) => (
        <div key={group.label}>
          <h3 className="mb-2 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {group.label}
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {group.weeks.map((weekNum) => {
              const week = weekMap.get(weekNum);
              if (!week) return null;
              const module = moduleMap.get(week.moduleId);
              if (!module) return null;

              const weekAssessments = week.assessmentRefs
                .map((id) => assessmentMap.get(id))
                .filter((a): a is ClassAssessment => a !== undefined);

              return (
                <WeekCard
                  key={week.weekNumber}
                  weekNumber={week.weekNumber}
                  module={module}
                  assessments={weekAssessments}
                  isCurrent={currentWeek === week.weekNumber}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
