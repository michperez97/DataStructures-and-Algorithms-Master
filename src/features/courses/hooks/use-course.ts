import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

export function useCourse(courseId: string | undefined) {
  const course = useLiveQuery(
    () => (courseId ? db.courses.get(courseId) : undefined),
    [courseId],
  );

  return { course: course ?? null, isLoading: course === undefined };
}
