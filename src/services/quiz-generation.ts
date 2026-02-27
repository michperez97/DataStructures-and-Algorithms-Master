import type { z } from "zod";
import {
  generatedQuizSchema,
  type GeneratedQuiz,
} from "./quiz-generation-schema";
import type { SourceQuestion } from "@/features/course-map/data/cot4400-questions";
import type { Difficulty } from "@/db/schema";

// ─── Types ──────────────────────────────────────────────────────────

export interface CourseDocContext {
  type: "Announcement" | "QuizInfo";
  rawText: string;
}

export interface WeekTopicContext {
  tag: string;
  title: string;
  description: string;
}

export interface QuizGenerationContext {
  sourceQuestions: SourceQuestion[];
  assessmentName: string;
  difficulty: Difficulty;
  questionCount: number;
  courseDocs?: CourseDocContext[];
  weekTopics?: WeekTopicContext[];
  signal?: AbortSignal;
}

// ─── Gemini API (reuses same pattern as topic-generation.ts) ────────

interface CallGeminiOptions {
  prompt: string;
  temperature?: number;
  signal?: AbortSignal;
}

async function callGemini({
  prompt,
  temperature,
  signal,
}: CallGeminiOptions): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "VITE_GEMINI_API_KEY is not set. Add it to your .env file.",
    );
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          ...(temperature != null && { temperature }),
        },
      }),
      signal,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return text;
}

function safeJsonParse(text: string, label: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const preview = text.slice(0, 200);
    throw new Error(
      `Failed to parse ${label} JSON from Gemini. Response starts with: "${preview}..."`,
    );
  }
}

async function generateWithRetry<T>(
  buildPrompt: () => string,
  schema: z.ZodType<T>,
  label: string,
  options: { temperature?: number; signal?: AbortSignal },
  maxAttempts = 2,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const text = await callGemini({
      prompt: buildPrompt(),
      temperature: options.temperature,
      signal: options.signal,
    });

    const parsed = safeJsonParse(text, label);
    const result = schema.safeParse(parsed);

    if (result.success) {
      return result.data;
    }

    lastError = new Error(
      `${label} schema validation failed (attempt ${attempt}/${maxAttempts}): ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
    );

    if (attempt < maxAttempts) {
      console.warn(`[quiz-generation] ${lastError.message}. Retrying...`);
    }
  }

  throw lastError!;
}

// ─── Prompt Builder ─────────────────────────────────────────────────

function buildDifficultyBlock(difficulty: Difficulty): string {
  switch (difficulty) {
    case "Easy":
      return `<difficulty_level>
EASY: Same concepts as the source questions, but with simpler numbers and standard base cases (T(1)=1 or T(0)=1). Single loops, small hash tables (size ≤ 10), straightforward recurrences with no twists.
</difficulty_level>`;
    case "Medium":
      return `<difficulty_level>
MEDIUM: Comparable to the source questions. Different functions and values but same level of complexity. This is the baseline — match Professor Cobo's original difficulty.
</difficulty_level>`;
    case "Hard":
      return `<difficulty_level>
HARD (with twists): Non-standard base cases (T(4)=1, T(8)=2). Tricky loop patterns (i*i<n, i=i/3, nested dependent bounds). Combined techniques. Extra terms in recurrences (T(n) = 2T(n/2) + n² log n). Rehashing with unusual table sizes. Multiple nested complexities in one question.
</difficulty_level>`;
  }
}

function formatSourceQuestions(questions: SourceQuestion[]): string {
  return questions
    .map((q, i) => {
      let text = `Question ${i + 1} (${q.type}):\n${q.prompt}`;
      if (q.code) text += `\n\nCode:\n${q.code}`;
      text += `\n\nAnswer: ${q.answerKey}`;
      text += `\nFormat: ${q.formatRequirements}`;
      return text;
    })
    .join("\n\n---\n\n");
}

function formatCourseDocs(docs: CourseDocContext[]): string {
  if (docs.length === 0) return "";

  const sections = docs.map((doc, i) => {
    const label = doc.type === "Announcement"
      ? "Weekly Announcement"
      : "Quiz/Assessment Info";
    return `--- ${label} ${i + 1} ---\n${doc.rawText}`;
  });

  return `\n<uploaded_course_material>
The following material was uploaded by the student from their course. Use this to understand the topics, terminology, and scope the professor emphasizes. Questions you generate should align with the topics and depth described here.

${sections.join("\n\n")}
</uploaded_course_material>\n`;
}

function formatWeekTopics(topics: WeekTopicContext[]): string {
  if (topics.length === 0) return "";

  const lines = topics
    .map((t) => `- ${t.title}: ${t.description}`)
    .join("\n");

  return `\n<week_topics>
This week covers the following topics. Generate questions that span these topics — not just the source question types. Include questions that test understanding of the broader concepts described here.

${lines}
</week_topics>\n`;
}

function buildQuizPrompt(ctx: QuizGenerationContext): string {
  const courseDocBlock = ctx.courseDocs && ctx.courseDocs.length > 0
    ? formatCourseDocs(ctx.courseDocs)
    : "";

  const weekTopicsBlock = ctx.weekTopics && ctx.weekTopics.length > 0
    ? formatWeekTopics(ctx.weekTopics)
    : "";

  return `<role>
You are generating practice quiz questions for COT4400 (Design and Analysis of Algorithms).
Professor Cobo tests using paper-pencil exams. Students must show all work.
Generate code examples in Java (not C).
You are generating ${ctx.questionCount} questions for: ${ctx.assessmentName}
</role>
${courseDocBlock}${weekTopicsBlock}
<professor_format_rules>
RULE 1 — Back Substitution Format:
  Expand exactly 3 levels, show the k-th level pattern, solve when k reaches base case.
  Example: T(n) = T(n-1) + 5, T(0) = 1
  Level 1: T(n) = T(n-1) + 5
  Level 2: T(n) = T(n-2) + 5 + 5 = T(n-2) + 10
  Level 3: T(n) = T(n-3) + 15
  k-th level: T(n) = T(n-k) + 5k
  Solve: when k = n, T(0) + 5n = 1 + 5n = O(n)

RULE 2 — Master Theorem Format:
  State values of a, b, and k explicitly.
  State which case AND subcase applies.
  Write the final result.

RULE 3 — Hash Table Format:
  Given hash function + input set, show each insertion step.
  For chaining: show linked lists at each index.
  For linear probing: show the probe sequence for collisions.

RULE 4 — Loop Analysis Format:
  Count operations at each loop level.
  Show the summation.
  Derive the asymptotic complexity.

RULE 5 — Step Count Format:
  Identify operation counts per statement.
  Sum across all iterations.
  Express as T(n).
</professor_format_rules>

${buildDifficultyBlock(ctx.difficulty)}

<source_questions>
These are Professor Cobo's actual quiz questions. Generate NEW questions in the same style, format, and difficulty level. Do NOT copy these questions — create fresh variants with different numbers, functions, and code.

${formatSourceQuestions(ctx.sourceQuestions)}
</source_questions>

<output_schema>
Return a JSON object with:
{
  "questions": [
    {
      "type": string (one of: "BigO", "BackSubstitution", "MasterTheorem", "Hashing", "ShortAnswer", "StepCount", "WriteAlgorithm", "Trace"),
      "prompt": string (the question text — plain text, no markdown),
      "code": string (optional — Java code if the question involves code analysis),
      "answerKey": string (the expected answer),
      "explanation": string (detailed worked solution showing all steps),
      "difficulty": "Easy" | "Medium" | "Hard",
      "formatRequirements": string (optional — what the student must show, e.g., "Show 3 expansions, k-th level, solve when k=n")
    }
  ]
}
Generate exactly ${ctx.questionCount} questions.
</output_schema>

<constraints>
- Generate exactly ${ctx.questionCount} questions.
- Match the EXACT format rules above. Cobo grades on process, not just the final answer.
- Use Java for any code examples (the source questions use C, but generated ones should use Java).
- All math notation must use Unicode: O(n²), O(n log n), O(√n). NEVER use LaTeX.
- Every explanation must show the complete worked solution, step by step.
- Do NOT repeat the source questions. Create fresh problems with different values.${ctx.weekTopics && ctx.weekTopics.length > 0 ? "\n- Generate questions that cover the week's topics broadly. Some questions should be variants of the source questions, and some should be NEW questions testing the broader topics listed in <week_topics>." : ""}
</constraints>

Only return valid JSON. No markdown fences.`;
}

// ─── Public Function ────────────────────────────────────────────────

export async function generateQuizVariant(
  ctx: QuizGenerationContext,
): Promise<GeneratedQuiz> {
  return generateWithRetry(
    () => buildQuizPrompt(ctx),
    generatedQuizSchema,
    "Quiz",
    { temperature: 0.9, signal: ctx.signal },
  );
}
