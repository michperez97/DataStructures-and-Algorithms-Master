import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

export function useAssessments(courseId: string | undefined) {
  const assessments = useLiveQuery(
    () =>
      courseId
        ? db.classAssessments.where("courseId").equals(courseId).toArray()
        : [],
    [courseId],
  );

  return { assessments: assessments ?? [], isLoading: assessments === undefined };
}
