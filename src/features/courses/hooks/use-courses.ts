import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

export function useCourses() {
  const courses = useLiveQuery(() =>
    db.courses.orderBy("updatedAt").reverse().toArray(),
  );

  return { courses: courses ?? [], isLoading: courses === undefined };
}
