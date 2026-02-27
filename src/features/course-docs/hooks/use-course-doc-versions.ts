import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

export function useCourseDocVersions(docId: string | undefined) {
  const versions = useLiveQuery(
    () =>
      docId
        ? db.courseDocVersions
            .where("docId")
            .equals(docId)
            .reverse()
            .sortBy("versionNo")
        : [],
    [docId],
  );

  return { versions: versions ?? [], isLoading: versions === undefined };
}
