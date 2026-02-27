import { z } from "zod";

export const courseDocSchema = z.object({
  type: z.enum(["Announcement", "QuizInfo", "StudyGuide", "Notes", "Other"]),
  rawText: z.string().min(1, "Document text is required"),
  postedAt: z.string().optional(),
  dueAt: z.string().optional(),
  links: z.string().optional(),
  mappedAssessmentId: z.string().optional(),
});

export type CourseDocFormData = z.infer<typeof courseDocSchema>;
