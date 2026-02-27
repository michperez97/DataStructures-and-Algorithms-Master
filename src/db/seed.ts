import { db } from "./index";
import type { Course, KnowledgeMap } from "./schema";
import {
  CANONICAL_DSA_COURSE_ID,
  GLOBAL_DSA_MAP_ID,
} from "@/features/topic-explorer/data/seed-ids";
import {
  DSA_NODES,
  DSA_EDGES,
} from "@/features/topic-explorer/data/dsa-taxonomy";
import {
  COT4400_COURSE_ID,
  COT4400_WEEKS,
  COT4400_ASSESSMENTS,
} from "@/features/course-map/data/cot4400-course";
import { COT4400_SOURCE_QUESTIONS } from "@/features/course-map/data/cot4400-questions";

const sampleCourses: Course[] = [
  {
    courseId: CANONICAL_DSA_COURSE_ID,
    name: "DSA Fundamentals",
    type: "Canonical",
    description:
      "A comprehensive self-study course covering fundamental data structures and algorithms.",
    topicTags: [
      "BigO",
      "Arrays",
      "Stacks",
      "Queues",
      "Trees",
      "Graphs",
      "DynamicProgramming",
    ],
    difficultyDefault: "Easy",
    privacyMode: "LocalOnly",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const globalDSAMap: KnowledgeMap = {
  mapId: GLOBAL_DSA_MAP_ID,
  scope: "GlobalDSA",
  name: "Global DSA Taxonomy",
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export async function seedDatabase() {
  const courseCount = await db.courses.count();
  if (courseCount === 0) {
    await db.courses.bulkAdd(sampleCourses);
    console.log("[seed] Added sample courses");
  }

  // Seed GlobalDSA knowledge map + nodes + edges (idempotent)
  const existingMap = await db.knowledgeMaps.get(GLOBAL_DSA_MAP_ID);
  if (!existingMap) {
    await db.knowledgeMaps.add(globalDSAMap);
    await db.knowledgeNodes.bulkAdd(DSA_NODES);
    await db.knowledgeEdges.bulkAdd(DSA_EDGES);
    console.log(
      `[seed] Added GlobalDSA map with ${DSA_NODES.length} nodes and ${DSA_EDGES.length} edges`,
    );
  }

  // Seed COT4400 course (idempotent — guard on fixed course ID)
  const existingCot4400 = await db.courses.get(COT4400_COURSE_ID);
  if (!existingCot4400) {
    const now = new Date().toISOString();

    await db.courses.add({
      courseId: COT4400_COURSE_ID,
      name: "COT4400 — Design and Analysis of Algorithms",
      type: "Imported",
      description:
        "Professor Cobo — MDC Spring 2026. Covers asymptotic complexity, recurrences, Master Theorem, hashing, sorting, trees, and graphs.",
      topicTags: [
        "BigO",
        "MasterTheorem",
        "HashTableFundamentals",
        "Sorting",
        "Trees",
        "Graphs",
      ],
      difficultyDefault: "Medium",
      privacyMode: "LocalOnly",
      createdAt: now,
      updatedAt: now,
    });

    await db.modules.bulkAdd(
      COT4400_WEEKS.map((week) => ({
        moduleId: week.moduleId,
        courseId: COT4400_COURSE_ID,
        name: `Week ${week.weekNumber}: ${week.name}`,
        sortOrder: week.weekNumber,
        description: week.topics,
        topicTags: week.topicTags,
      })),
    );

    await db.classAssessments.bulkAdd(
      COT4400_ASSESSMENTS.map((a) => ({
        assessmentId: a.assessmentId,
        courseId: COT4400_COURSE_ID,
        name: a.name,
        type: a.type,
        coverage: a.topicTags.map((tag) => ({ topicTag: tag })),
        createdAt: now,
        updatedAt: now,
      })),
    );

    await db.questions.bulkAdd(
      COT4400_SOURCE_QUESTIONS.map((q) => ({
        questionId: q.questionId,
        courseId: COT4400_COURSE_ID,
        type: q.type as "MCQ" | "ShortAnswer" | "Trace" | "BigO",
        prompt: q.code ? `${q.prompt}\n\n${q.code}` : q.prompt,
        answerKey: q.answerKey,
        explanation: q.explanation,
        topicTags: q.topicTags,
        difficulty: q.difficulty,
        targetAssessmentId: q.assessmentRef,
        generationMeta: {
          isSource: true,
          assessmentRef: q.assessmentRef,
          coboQuestionType: q.type,
          formatRequirements: q.formatRequirements,
          ...(q.code && { code: q.code }),
        },
      })),
    );

    console.log(
      `[seed] Added COT4400 course with ${COT4400_WEEKS.length} modules, ${COT4400_ASSESSMENTS.length} assessments, and ${COT4400_SOURCE_QUESTIONS.length} questions`,
    );
  }
}
