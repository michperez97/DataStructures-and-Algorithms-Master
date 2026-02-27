import { z } from "zod";

// ─── Generated Quiz Question Schema ─────────────────────────────────

export const generatedQuizQuestionSchema = z.object({
  type: z.string(),
  prompt: z.string(),
  code: z.string().optional(),
  answerKey: z.string(),
  explanation: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  formatRequirements: z.string().optional(),
});

export const generatedQuizSchema = z.object({
  questions: z.array(generatedQuizQuestionSchema).min(1).max(11),
});

export type GeneratedQuizQuestion = z.infer<typeof generatedQuizQuestionSchema>;
export type GeneratedQuiz = z.infer<typeof generatedQuizSchema>;
