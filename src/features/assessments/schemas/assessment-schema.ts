import { z } from "zod";

export const assessmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  type: z.enum(["Quiz", "Exam", "Lab", "Other"]),
  dateWindowOpen: z.string().optional(),
  dateWindowClose: z.string().optional(),
  coverageTags: z.string().optional(),
});

export type AssessmentFormData = z.infer<typeof assessmentSchema>;
