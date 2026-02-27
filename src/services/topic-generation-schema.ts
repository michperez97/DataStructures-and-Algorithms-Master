import { z } from "zod";

// ─── Lesson Step Schema ──────────────────────────────────────────────

export const generatedLessonStepSchema = z.object({
  type: z.enum(["Explain", "Prompt", "Check", "Hint", "Transition", "Summary"]),
  content: z.string(),
  expectedAnswer: z.string().optional(),
  postAnswer: z.string().optional(),
});

export const generatedLessonSchema = z.object({
  title: z.string(),
  steps: z.array(generatedLessonStepSchema).min(6).max(12),
});

export type GeneratedLesson = z.infer<typeof generatedLessonSchema>;
export type GeneratedLessonStep = z.infer<typeof generatedLessonStepSchema>;

// ─── Question Schema ─────────────────────────────────────────────────

export const mcqAnswerKeySchema = z.object({
  correct: z.string(),
  options: z.array(z.string()).min(3).max(6),
});

export type MCQAnswerKey = z.infer<typeof mcqAnswerKeySchema>;

export const generatedQuestionSchema = z.object({
  type: z.enum(["MCQ", "ShortAnswer", "Trace", "BigO"]),
  prompt: z.string(),
  answerKey: z.union([
    mcqAnswerKeySchema,
    z.string(),
  ]),
  explanation: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
});

export const generatedQuestionsSchema = z.object({
  questions: z.array(generatedQuestionSchema).min(4).max(6),
});

export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;
export type GeneratedQuestions = z.infer<typeof generatedQuestionsSchema>;

// ─── Prerequisite Schema ────────────────────────────────────────────

export const generatedPrerequisiteSchema = z.object({
  title: z.string(),
  description: z.string(),
  isNew: z.boolean(),
});

export const generatedPrerequisitesSchema = z.object({
  prerequisites: z.array(generatedPrerequisiteSchema).max(6),
});

export type GeneratedPrerequisite = z.infer<typeof generatedPrerequisiteSchema>;
export type GeneratedPrerequisites = z.infer<typeof generatedPrerequisitesSchema>;
