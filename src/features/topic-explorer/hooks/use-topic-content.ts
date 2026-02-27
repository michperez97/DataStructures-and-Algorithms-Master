import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

export function useTopicContent(topicTag: string | undefined, courseId: string | undefined) {
  const lessons = useLiveQuery(
    () => {
      if (!topicTag || !courseId) return [];
      return db.interactiveLessons
        .where("courseId")
        .equals(courseId)
        .filter((l) => l.topicTags.includes(topicTag))
        .toArray();
    },
    [topicTag, courseId],
  );

  const questions = useLiveQuery(
    () => {
      if (!topicTag || !courseId) return [];
      return db.questions
        .where("courseId")
        .equals(courseId)
        .filter((q) => q.topicTags.includes(topicTag))
        .toArray();
    },
    [topicTag, courseId],
  );

  return {
    lessons: lessons ?? [],
    questions: questions ?? [],
    isLoading: lessons === undefined || questions === undefined,
    hasContent: (lessons?.length ?? 0) > 0 || (questions?.length ?? 0) > 0,
  };
}
