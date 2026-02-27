import { z } from "zod";

export const courseSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  type: z.enum(["Canonical", "UserAuthored", "Imported"]),
  description: z.string().max(2000).optional(),
  topicTags: z.string().optional(),
  difficultyDefault: z.enum(["Easy", "Medium", "Hard"]).optional(),
});

export type CourseFormData = z.infer<typeof courseSchema>;
