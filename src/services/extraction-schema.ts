import { z } from "zod";

export const extractedTopicSchema = z.object({
  label: z.string(),
  confidence: z.number().min(0).max(1),
  sourceSpan: z.string().optional(),
});

export const extractedTaskSchema = z.object({
  description: z.string(),
  confidence: z.number().min(0).max(1),
});

export const extractedDueDateSchema = z.object({
  date: z.string(),
  label: z.string(),
  confidence: z.number().min(0).max(1),
});

export const extractedCoverageStatementSchema = z.object({
  text: z.string(),
  mappedTopics: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export const extractionResultSchema = z.object({
  topics: z.array(extractedTopicSchema),
  tasks: z.array(extractedTaskSchema),
  dueDates: z.array(extractedDueDateSchema),
  coverageStatements: z.array(extractedCoverageStatementSchema),
});

export type ExtractionResult = z.infer<typeof extractionResultSchema>;
