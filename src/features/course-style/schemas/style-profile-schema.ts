import { z } from "zod";

export const styleProfileSchema = z.object({
  notationPreference: z.enum(["BigO", "BigTheta", "Mixed"]),
  difficultyBaseline: z.number().int().min(1).max(5),
  strictnessBaseline: z.enum(["Lenient", "Standard", "Strict"]),
});

export type StyleProfileFormData = z.infer<typeof styleProfileSchema>;
