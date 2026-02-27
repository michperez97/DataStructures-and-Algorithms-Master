import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

export function useCourseDocs(courseId: string | undefined) {
  const docs = useLiveQuery(
    () =>
      courseId
        ? db.courseDocs
            .where("courseId")
            .equals(courseId)
            .reverse()
            .sortBy("updatedAt")
        : [],
    [courseId],
  );

  return { docs: docs ?? [], isLoading: docs === undefined };
}
