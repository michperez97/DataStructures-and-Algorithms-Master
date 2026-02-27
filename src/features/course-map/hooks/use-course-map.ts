import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { COT4400_COURSE_ID } from "../data/cot4400-course";

export function useCourseMap() {
  const course = useLiveQuery(
    () => db.courses.get(COT4400_COURSE_ID),
    [],
  );

  const modules = useLiveQuery(
    () =>
      db.modules
        .where("courseId")
        .equals(COT4400_COURSE_ID)
        .sortBy("sortOrder"),
    [],
  );

  const assessments = useLiveQuery(
    () =>
      db.classAssessments
        .where("courseId")
        .equals(COT4400_COURSE_ID)
        .toArray(),
    [],
  );

  return {
    course: course ?? null,
    modules: modules ?? [],
    assessments: assessments ?? [],
    isLoading:
      course === undefined ||
      modules === undefined ||
      assessments === undefined,
  };
}
