import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

export function useRubric(assessmentId: string | undefined) {
  const rubric = useLiveQuery(
    () =>
      assessmentId
        ? db.assessmentRubrics
            .where("assessmentId")
            .equals(assessmentId)
            .first()
        : undefined,
    [assessmentId],
  );

  return { rubric: rubric ?? null, isLoading: rubric === undefined };
}
