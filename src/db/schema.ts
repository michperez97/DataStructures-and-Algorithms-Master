// ─── Enums / Literal Unions ────────────────────────────────────────

export type CourseType = "Canonical" | "UserAuthored" | "Imported";
export type CourseDocType =
  | "Announcement"
  | "QuizInfo"
  | "StudyGuide"
  | "Notes"
  | "Other";
export type ClassAssessmentType = "Quiz" | "Exam" | "Lab" | "Other";
export type QuestionType = "MCQ" | "ShortAnswer" | "Trace" | "BigO";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type QuizSessionMode =
  | "Practice"
  | "Timed"
  | "RedoMissed"
  | "TopicDrill"
  | "Exam";
export type FeedbackPolicy = "Instant" | "EndOnly";
export type StyleMode = "Normal" | "StylePlusTwist";
export type MasteryStatus = "NotStarted" | "InProgress" | "Weak" | "Mastered";
export type MasteryTrend = "Improving" | "Stable" | "Declining";
export type DerivedArtifactType =
  | "Quiz"
  | "InteractiveLesson"
  | "CommonTraps"
  | "DiagnosticQuiz";
export type ArtifactStatus =
  | "Active"
  | "Outdated"
  | "Superseded"
  | "Archived";
export type CourseDocParseStatus = "Pending" | "Reviewed" | "Accepted";
export type KnowledgeMapScope = "GlobalDSA" | "Course";
export type PrivacyMode = "LocalOnly" | "SyncEnabled";
export type KnowledgeEdgeType = "Prerequisite" | "Related";
export type LessonStepType =
  | "Explain"
  | "Prompt"
  | "Check"
  | "Hint"
  | "Transition"
  | "Remediation"
  | "Summary";
export type NotationPreference = "BigO" | "BigTheta" | "Mixed";
export type Strictness = "Lenient" | "Standard" | "Strict";
export type GenerationJobRequestType =
  | "BaselinePack"
  | "OnDemand"
  | "Regeneration";
export type GenerationJobStatus =
  | "Pending"
  | "InProgress"
  | "Completed"
  | "Failed";
export type KnowledgeNodeStatus =
  | "NotCovered"
  | "Covered"
  | "InProgress"
  | "Mastered"
  | "Weak";
export type AuditAction =
  | "GenerationRequested"
  | "GenerationCompleted"
  | "GenerationFailed"
  | "ContentEdited"
  | "ContentReported"
  | "SyncConflictResolved"
  | "PrivacyModeChanged"
  | "DataDeleted";

// ─── Entity Interfaces ─────────────────────────────────────────────

export interface User {
  userId: string;
  displayName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  courseId: string;
  name: string;
  type: CourseType;
  description?: string;
  topicTags?: string[];
  difficultyDefault?: Difficulty;
  cadence?: string;
  notationPreference?: NotationPreference;
  privacyMode: PrivacyMode;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  moduleId: string;
  courseId: string;
  name: string;
  sortOrder: number;
  description?: string;
  topicTags?: string[];
}

export interface Lesson {
  lessonId: string;
  moduleId: string;
  courseId: string;
  title: string;
  content: string;
  sortOrder: number;
  topicTags?: string[];
  estimatedMinutes?: number;
}

export interface CourseDoc {
  docId: string;
  courseId: string;
  type: CourseDocType;
  rawText: string;
  postedAt?: string;
  dueAt?: string;
  links?: string[];
  mappedAssessmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseDocVersion {
  versionId: string;
  docId: string;
  versionNo: number;
  rawText: string;
  changeNote?: string;
  createdAt: string;
}

export interface CourseDocParse {
  parseId: string;
  docId: string;
  detectedTopics: Array<{
    label: string;
    confidence: number;
    sourceSpan?: string;
  }>;
  detectedTasks: Array<{ description: string; confidence: number }>;
  detectedDueDates: Array<{
    date: string;
    label: string;
    confidence: number;
  }>;
  detectedCoverageStatements: Array<{
    text: string;
    mappedTopics: string[];
    confidence: number;
  }>;
  status: CourseDocParseStatus;
  reviewerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassAssessment {
  assessmentId: string;
  courseId: string;
  name: string;
  type: ClassAssessmentType;
  dateWindow?: { open?: string; close?: string };
  coverage?: Array<{ topicTag: string; weight?: number }>;
  formatProfileId?: string;
  sourceDocIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentFormatProfile {
  formatProfileId: string;
  assessmentId: string;
  questionTypeMix: Record<string, number>;
  typicalQuestionCount: number;
  timeLimitSeconds?: number;
  notes?: string;
}

export interface AssessmentRubric {
  rubricId: string;
  assessmentId: string;
  strictness: Strictness;
  partialCreditRules?: Record<string, unknown>;
  scoringNotes?: string;
}

export interface CourseStyleProfile {
  profileId: string;
  courseId: string;
  terminologyMap: Record<string, string>;
  notationPreference: NotationPreference;
  questionTypeWeights: Record<string, number>;
  difficultyBaseline: number;
  strictnessBaseline: Strictness;
  lockedFields?: string[];
  inferenceSource?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  questionId: string;
  courseId: string;
  type: QuestionType;
  prompt: string;
  answerKey: unknown;
  explanation: string;
  topicTags: string[];
  difficulty: Difficulty;
  sourceDocId?: string;
  sourceSnippet?: { start: number; end: number };
  targetAssessmentId?: string;
  generationMeta?: Record<string, unknown>;
}

export interface InteractiveLesson {
  lessonId: string;
  courseId: string;
  title: string;
  topicTags: string[];
  steps: string[];
  targetAssessmentId?: string;
  difficulty?: Difficulty;
  sourceDocId?: string;
  sourceSnippet?: { start: number; end: number };
  generationMeta?: Record<string, unknown>;
}

export interface LessonStep {
  stepId: string;
  lessonId: string;
  type: LessonStepType;
  content: string;
  expectedAnswer?: string;
  answerSet?: string[];
  rubric?: string;
  maxAttemptsBeforeHint?: number;
  branchOnIncorrect?: string;
}

export interface QuizSession {
  sessionId: string;
  courseId: string;
  questionIds: string[];
  mode: QuizSessionMode;
  targetAssessmentId?: string;
  difficulty?: Difficulty;
  styleMode?: StyleMode;
  timeLimitSeconds?: number;
  feedbackPolicy?: FeedbackPolicy;
  createdAt: string;
  completedAt?: string;
}

export interface Attempt {
  attemptId: string;
  sessionId: string;
  questionId: string;
  courseId: string;
  answer: unknown;
  correct: boolean;
  timestamp: string;
  durationMs?: number;
  topicTags?: string[];
  difficulty?: Difficulty;
  confidence?: number;
}

export interface MistakeBankItem {
  mistakeId: string;
  courseId: string;
  questionId: string;
  attemptId: string;
  topicTags: string[];
  createdAt: string;
  resolvedAt?: string;
  reviewCount?: number;
}

export interface ReviewScheduleItem {
  reviewId: string;
  courseId: string;
  topicTag: string;
  nextReviewAt: string;
  interval: number;
  box: number;
  createdAt: string;
  questionIds?: string[];
  lastReviewedAt?: string;
  consecutiveCorrect?: number;
}

export interface MasteryScore {
  masteryId: string;
  courseId: string;
  topicTag: string;
  score: number;
  status: MasteryStatus;
  attemptCount: number;
  lastAttemptAt: string;
  updatedAt: string;
  questionTypeBreakdown?: Record<string, number>;
  trend?: MasteryTrend;
}

export interface MasteryHistory {
  historyId: string;
  masteryId: string;
  score: number;
  status: MasteryStatus;
  recordedAt: string;
}

export interface KnowledgeMap {
  mapId: string;
  scope: KnowledgeMapScope;
  courseId?: string;
  name: string;
  version?: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeNode {
  nodeId: string;
  mapId: string;
  title: string;
  topicTags: string[];
  description?: string;
  category?: string;
  resources?: string[];
  status?: KnowledgeNodeStatus;
}

export interface KnowledgeEdge {
  edgeId: string;
  mapId: string;
  fromNodeId: string;
  toNodeId: string;
  type: KnowledgeEdgeType;
}

export interface DerivedArtifact {
  artifactId: string;
  courseId: string;
  artifactType: DerivedArtifactType;
  status: ArtifactStatus;
  version: number;
  targetAssessmentId?: string;
  parentArtifactId?: string;
  generationMeta?: Record<string, unknown>;
  label?: string;
  createdAt: string;
}

export interface ArtifactDependency {
  dependencyId: string;
  artifactId: string;
  sourceDocId: string;
  sourceSnippet?: { start: number; end: number };
}

export interface GenerationJob {
  jobId: string;
  courseId: string;
  requestType: GenerationJobRequestType;
  status: GenerationJobStatus;
  targetAssessmentId?: string;
  parameters?: Record<string, unknown>;
  resultArtifactIds?: string[];
  errorMessage?: string;
  provider?: string;
  createdAt: string;
  completedAt?: string;
}

export interface SyncQueueItem {
  queueId: string;
  courseId: string;
  entityType: string;
  entityId: string;
  operation: "create" | "update" | "delete";
  payload: unknown;
  createdAt: string;
  syncedAt?: string;
}

export interface AuditLogEntry {
  entryId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  timestamp: string;
  previousValue?: unknown;
  newValue?: unknown;
  metadata?: Record<string, unknown>;
}
