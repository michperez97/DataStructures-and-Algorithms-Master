import Dexie, { type EntityTable } from "dexie";
import type {
  User,
  Course,
  Module,
  Lesson,
  CourseDoc,
  CourseDocVersion,
  CourseDocParse,
  ClassAssessment,
  AssessmentFormatProfile,
  AssessmentRubric,
  CourseStyleProfile,
  Question,
  InteractiveLesson,
  LessonStep,
  QuizSession,
  Attempt,
  MistakeBankItem,
  ReviewScheduleItem,
  MasteryScore,
  MasteryHistory,
  KnowledgeMap,
  KnowledgeNode,
  KnowledgeEdge,
  DerivedArtifact,
  ArtifactDependency,
  GenerationJob,
  SyncQueueItem,
  AuditLogEntry,
} from "./schema";

export class AppDatabase extends Dexie {
  users!: EntityTable<User, "userId">;
  courses!: EntityTable<Course, "courseId">;
  modules!: EntityTable<Module, "moduleId">;
  lessons!: EntityTable<Lesson, "lessonId">;
  courseDocs!: EntityTable<CourseDoc, "docId">;
  courseDocVersions!: EntityTable<CourseDocVersion, "versionId">;
  courseDocParses!: EntityTable<CourseDocParse, "parseId">;
  classAssessments!: EntityTable<ClassAssessment, "assessmentId">;
  assessmentFormatProfiles!: EntityTable<
    AssessmentFormatProfile,
    "formatProfileId"
  >;
  assessmentRubrics!: EntityTable<AssessmentRubric, "rubricId">;
  courseStyleProfiles!: EntityTable<CourseStyleProfile, "profileId">;
  questions!: EntityTable<Question, "questionId">;
  interactiveLessons!: EntityTable<InteractiveLesson, "lessonId">;
  lessonSteps!: EntityTable<LessonStep, "stepId">;
  quizSessions!: EntityTable<QuizSession, "sessionId">;
  attempts!: EntityTable<Attempt, "attemptId">;
  mistakeBankItems!: EntityTable<MistakeBankItem, "mistakeId">;
  reviewScheduleItems!: EntityTable<ReviewScheduleItem, "reviewId">;
  masteryScores!: EntityTable<MasteryScore, "masteryId">;
  masteryHistory!: EntityTable<MasteryHistory, "historyId">;
  knowledgeMaps!: EntityTable<KnowledgeMap, "mapId">;
  knowledgeNodes!: EntityTable<KnowledgeNode, "nodeId">;
  knowledgeEdges!: EntityTable<KnowledgeEdge, "edgeId">;
  derivedArtifacts!: EntityTable<DerivedArtifact, "artifactId">;
  artifactDependencies!: EntityTable<ArtifactDependency, "dependencyId">;
  generationJobs!: EntityTable<GenerationJob, "jobId">;
  syncQueue!: EntityTable<SyncQueueItem, "queueId">;
  auditLog!: EntityTable<AuditLogEntry, "entryId">;

  constructor() {
    super("DSAMasterDB");

    this.version(1).stores({
      users: "userId",
      courses: "courseId, type, updatedAt",
      modules: "moduleId, courseId, sortOrder",
      lessons: "lessonId, moduleId, courseId, sortOrder",
      courseDocs: "docId, courseId, type, mappedAssessmentId, updatedAt",
      courseDocVersions: "versionId, docId, versionNo",
      courseDocParses: "parseId, docId, status",
      classAssessments: "assessmentId, courseId, type",
      assessmentFormatProfiles: "formatProfileId, assessmentId",
      assessmentRubrics: "rubricId, assessmentId",
      courseStyleProfiles: "profileId, courseId",
      questions:
        "questionId, courseId, targetAssessmentId, difficulty, *topicTags, type, sourceDocId",
      interactiveLessons: "lessonId, courseId, *topicTags",
      lessonSteps: "stepId, lessonId",
      quizSessions: "sessionId, courseId, targetAssessmentId, mode, createdAt",
      attempts:
        "attemptId, sessionId, questionId, courseId, *topicTags, timestamp",
      mistakeBankItems: "mistakeId, courseId, questionId, *topicTags",
      reviewScheduleItems: "reviewId, courseId, topicTag, nextReviewAt",
      masteryScores: "masteryId, courseId, topicTag, status",
      masteryHistory: "historyId, masteryId, recordedAt",
      knowledgeMaps: "mapId, scope, courseId",
      knowledgeNodes: "nodeId, mapId, *topicTags, category, status",
      knowledgeEdges: "edgeId, mapId, fromNodeId, toNodeId",
      derivedArtifacts:
        "artifactId, courseId, artifactType, targetAssessmentId, status, version, createdAt",
      artifactDependencies: "dependencyId, sourceDocId, artifactId",
      generationJobs: "jobId, courseId, status, createdAt",
      syncQueue: "queueId, courseId, entityType, createdAt",
      auditLog: "entryId, action, entityType, entityId, timestamp",
    });
  }
}

export const db = new AppDatabase();
