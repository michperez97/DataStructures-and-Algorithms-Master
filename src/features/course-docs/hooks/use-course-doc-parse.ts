import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

export function useCourseDocParse(docId: string | undefined) {
  const parse = useLiveQuery(
    () =>
      docId
        ? db.courseDocParses.where("docId").equals(docId).first()
        : undefined,
    [docId],
  );

  return { parse: parse ?? null, isLoading: parse === undefined };
}
