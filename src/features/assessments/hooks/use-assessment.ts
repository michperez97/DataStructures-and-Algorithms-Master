import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

export function useAssessment(assessmentId: string | undefined) {
  const assessment = useLiveQuery(
    () =>
      assessmentId
        ? db.classAssessments.get(assessmentId)
        : undefined,
    [assessmentId],
  );

  return { assessment: assessment ?? null, isLoading: assessment === undefined };
}
