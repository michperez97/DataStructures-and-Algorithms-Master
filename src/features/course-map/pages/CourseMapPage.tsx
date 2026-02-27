import { PageHeader } from "@/components/shared/PageHeader";
import { WeekTimeline } from "../components/WeekTimeline";
import { useCourseMap } from "../hooks/use-course-map";

// Spring 2026 semester starts Monday Jan 5, 2026
const SEMESTER_START = new Date("2026-01-05");

function getCurrentWeek(): number {
  const now = new Date();
  const diffMs = now.getTime() - SEMESTER_START.getTime();
  const week = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
  return Math.max(1, Math.min(16, week));
}

export function CourseMapPage() {
  const { modules, assessments, isLoading } = useCourseMap();
  const currentWeek = getCurrentWeek();

  if (isLoading) {
    return <div className="text-muted-foreground p-4">Loading course map...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="COT4400 — Design and Analysis of Algorithms"
        description="Prof. Cobo — Spring 2026"
      />
      <WeekTimeline
        modules={modules}
        assessments={assessments}
        currentWeek={currentWeek}
      />
    </div>
  );
}
