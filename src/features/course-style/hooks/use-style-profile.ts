import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

export function useStyleProfile(courseId: string | undefined) {
  const profile = useLiveQuery(
    () =>
      courseId
        ? db.courseStyleProfiles.where("courseId").equals(courseId).first()
        : undefined,
    [courseId],
  );

  return { profile: profile ?? null, isLoading: profile === undefined };
}
