import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import type { ClassAssessment, CourseDoc, KnowledgeNode, Question, QuizSession } from "@/db/schema";
import {
  COT4400_COURSE_ID,
  COT4400_WEEKS,
  COT4400_ASSESSMENTS,
  TOPIC_TAG_TO_SLUG,
} from "../data/cot4400-course";
import { SLUG_TO_NODE_ID } from "@/features/topic-explorer/data/dsa-taxonomy";

export function useWeekDetail(weekNumber: number) {
  const weekDef = COT4400_WEEKS.find((w) => w.weekNumber === weekNumber);
  const assessmentIds = weekDef?.assessmentRefs ?? [];
  const assessmentDefs = COT4400_ASSESSMENTS.filter((a) =>
    assessmentIds.includes(a.assessmentId),
  );

  const module = useLiveQuery(
    () =>
      weekDef
        ? db.modules.get(weekDef.moduleId)
        : undefined,
    [weekNumber],
  );

  const assessments = useLiveQuery(
    (): Promise<ClassAssessment[]> =>
      assessmentIds.length > 0
        ? db.classAssessments
            .where("assessmentId")
            .anyOf(assessmentIds)
            .toArray()
        : Promise.resolve([]),
    [weekNumber],
  );

  const sourceQuestions = useLiveQuery(
    (): Promise<Question[]> =>
      assessmentIds.length > 0
        ? db.questions
            .where("targetAssessmentId")
            .anyOf(assessmentIds)
            .filter(
              (q) =>
                q.courseId === COT4400_COURSE_ID &&
                (q.generationMeta as Record<string, unknown> | undefined)?.isSource === true,
            )
            .toArray()
        : Promise.resolve([]),
    [weekNumber],
  );

  const generatedQuestions = useLiveQuery(
    (): Promise<Question[]> =>
      assessmentIds.length > 0
        ? db.questions
            .where("targetAssessmentId")
            .anyOf(assessmentIds)
            .filter(
              (q) =>
                q.courseId === COT4400_COURSE_ID &&
                (q.generationMeta as Record<string, unknown> | undefined)?.isGenerated === true,
            )
            .toArray()
        : Promise.resolve([]),
    [weekNumber],
  );

  const pastSessions = useLiveQuery(
    (): Promise<QuizSession[]> =>
      assessmentIds.length > 0
        ? db.quizSessions
            .where("targetAssessmentId")
            .anyOf(assessmentIds)
            .filter((s) => s.courseId === COT4400_COURSE_ID)
            .reverse()
            .sortBy("createdAt")
        : Promise.resolve([]),
    [weekNumber],
  );

  // Fetch CourseDocs linked to this week via mappedAssessmentId.
  // Announcements use moduleId as mappedAssessmentId; quizzes use assessment IDs.
  const weekRefIds = weekDef
    ? [weekDef.moduleId, ...assessmentIds]
    : [];

  const weekDocs = useLiveQuery(
    (): Promise<CourseDoc[]> =>
      weekRefIds.length > 0
        ? db.courseDocs
            .where("courseId")
            .equals(COT4400_COURSE_ID)
            .filter(
              (doc) =>
                doc.mappedAssessmentId !== undefined &&
                weekRefIds.includes(doc.mappedAssessmentId),
            )
            .toArray()
        : Promise.resolve([]),
    [weekNumber],
  );

  // Resolve week topicTags → knowledge-graph node IDs for topic tiles
  const topicNodeIds = (weekDef?.topicTags ?? [])
    .map((tag) => {
      const slug = TOPIC_TAG_TO_SLUG[tag];
      return slug ? SLUG_TO_NODE_ID[slug] : undefined;
    })
    .filter((id): id is string => id !== undefined);

  const topicNodes = useLiveQuery(
    (): Promise<KnowledgeNode[]> =>
      topicNodeIds.length > 0
        ? db.knowledgeNodes
            .where("nodeId")
            .anyOf(topicNodeIds)
            .toArray()
        : Promise.resolve([]),
    [weekNumber],
  );

  return {
    weekDef,
    assessmentDefs,
    module: module ?? null,
    assessments: assessments ?? [],
    sourceQuestions: sourceQuestions ?? [],
    generatedQuestions: generatedQuestions ?? [],
    pastSessions: pastSessions ?? [],
    weekDocs: weekDocs ?? [],
    topicNodes: topicNodes ?? [],
    isLoading:
      module === undefined ||
      assessments === undefined ||
      sourceQuestions === undefined,
  };
}
