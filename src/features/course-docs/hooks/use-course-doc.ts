import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

export function useCourseDoc(docId: string | undefined) {
  const doc = useLiveQuery(
    () => (docId ? db.courseDocs.get(docId) : undefined),
    [docId],
  );

  return { doc: doc ?? null, isLoading: doc === undefined };
}
