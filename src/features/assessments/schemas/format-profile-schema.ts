import { z } from "zod";

export const formatProfileSchema = z.object({
  typicalQuestionCount: z.number().int().min(1).max(200),
  timeLimitSeconds: z.number().int().min(0).optional(),
  questionTypeMix: z.record(z.string(), z.number()),
  notes: z.string().max(2000).optional(),
});

export type FormatProfileFormData = z.infer<typeof formatProfileSchema>;
