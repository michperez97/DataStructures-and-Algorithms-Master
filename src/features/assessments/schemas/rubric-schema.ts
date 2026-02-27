import { z } from "zod";

export const rubricSchema = z.object({
  strictness: z.enum(["Lenient", "Standard", "Strict"]),
  scoringNotes: z.string().max(2000).optional(),
  partialCreditRules: z.string().max(2000).optional(),
});

export type RubricFormData = z.infer<typeof rubricSchema>;
