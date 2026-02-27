import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

export function useFormatProfile(assessmentId: string | undefined) {
  const profile = useLiveQuery(
    () =>
      assessmentId
        ? db.assessmentFormatProfiles
            .where("assessmentId")
            .equals(assessmentId)
            .first()
        : undefined,
    [assessmentId],
  );

  return { profile: profile ?? null, isLoading: profile === undefined };
}
