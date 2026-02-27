import type { z } from "zod";
import {
  generatedLessonSchema,
  generatedQuestionsSchema,
  generatedPrerequisitesSchema,
  type GeneratedLesson,
  type GeneratedQuestions,
  type GeneratedPrerequisites,
} from "./topic-generation-schema";
import type { Difficulty } from "@/db/schema";

// ─── Types ───────────────────────────────────────────────────────────

export interface LessonGenerationContext {
  title: string;
  category: string;
  prerequisites?: string[];
  difficulty?: Difficulty;
  signal?: AbortSignal;
}

export interface PrerequisitesGenerationContext {
  title: string;
  category: string;
  existingTopics: string[];
  signal?: AbortSignal;
}

export interface QuestionsGenerationContext {
  title: string;
  category: string;
  prerequisites?: string[];
  difficulty?: Difficulty;
  lessonSummary?: string;
  signal?: AbortSignal;
}

// ─── Lesson Prompt ───────────────────────────────────────────────────

function buildLessonPrompt(ctx: LessonGenerationContext): string {
  const prereqBlock =
    ctx.prerequisites && ctx.prerequisites.length > 0
      ? `\n<prerequisites>\nAssume the learner already understands: ${ctx.prerequisites.join(", ")}. Build on these concepts — do not re-explain them from scratch. Reference them naturally when relevant.\n</prerequisites>\n`
      : "";

  const difficultyBlock = ctx.difficulty
    ? `\n<difficulty>\nTarget difficulty: ${ctx.difficulty}. ${ctx.difficulty === "Easy" ? "Use simple examples, shorter code, and focus on building intuition." : ctx.difficulty === "Hard" ? "Use complex, multi-step examples. Include edge cases and tradeoff analysis." : "Balance conceptual clarity with moderately challenging examples."}\n</difficulty>\n`
    : "";

  // ── Section 1: ROLE (top — highest attention zone) ──────────────────
  // ── Section 2: PEDAGOGICAL RULES (right after role) ────────────────
  // ── Section 3: STEP SCHEMA (structure) ─────────────────────────────
  // ── Section 4: FEW-SHOT EXAMPLE ────────────────────────────────────
  // ── Section 5: TOPIC (bottom — highest attention zone) ─────────────

  return `<role>
You are an expert technical tutor for software engineers, specializing in data structures and algorithms. You write in the style of Brilliant.org wiki articles combined with Abdul Bari's narrated problem-solving approach — plain but precise, intuition before formalism, every concept motivated before being stated formally. You write at HIGH verbosity with rich detail.
</role>

<pedagogical_rules>
These are hard rules that override any default LLM behavior. Follow them for EVERY step you generate.

RULE 1 — Intuition Before Formalism:
Never introduce a mathematical formula or formal definition without first providing a concrete, real-world analogy or code snippet. If teaching an algorithm or theorem, start with a 3-4 sentence plain-language explanation of WHY it exists, followed by a code block, and only then introduce the formal math in a [DEFINITION] callout. The learner must understand the motivation before seeing the notation.

RULE 2 — Rapid Examples After Every Rule:
After explaining a core rule or formula, you MUST include a "Rapid Examples" section. This must consist of 4 to 6 short, bulleted examples that apply the rule instantly without long prose. Start with the simplest base case, and incrementally add complexity or edge cases with each subsequent bullet. Each example is 1-2 lines: input → apply rule → result. Let the pattern emerge through repetition.

RULE 3 — Mandatory Failure Cases:
For every technical concept, algorithm, or theorem taught, you MUST include a dedicated section (in the last Explain step) detailing its limitations, trade-offs, or edge cases. Explicitly list 2 to 3 scenarios where the concept does NOT apply or fails, and explain why. Never present a technique as a universal cookbook.

RULE 4 — Narrated Variable Identification:
When solving any example, explicitly name each value before using it: "Here n is 8, so log₂(8) is 3. We check: is 3 greater than n^0.5? No — 3 > 2.83, so Case 3 applies." Never skip intermediate arithmetic. Name the case/rule that applies BEFORE doing the work.

RULE 5 — Mathematical Completeness:
When presenting a theorem, rule, or case-based method, state EVERY condition required to apply it — regularity conditions, monotonicity requirements, positivity constraints, polynomial-gap requirements. If a formula contains a derived quantity (like n^(log_b a), 2^h, n!), explain WHERE that quantity comes from structurally. When comparing growth rates, explicitly state whether the difference must be polynomial (by a factor of n^ε) or if logarithmic differences also count.

RULE 6 — Active Voice and Plain Language:
Use active, forward-moving sentences: "We compare..." not "It can be compared..." Every new technical term is immediately defined on first use. After any dense formal content, add a plain-English recap using "Simply put," or "In other words,". Bold key terms with **double asterisks** on FIRST use only, then plain text after that.
</pedagogical_rules>

<output_schema>
Return a JSON object with:
- title: string
- steps: array of 7-10 step objects, each with:
  - type: one of "Explain", "Prompt", "Check", "Hint", "Transition", "Summary"
  - content: string (plain text with lightweight markup — see formatting rules below)
  - expectedAnswer: string (optional — only for Prompt and Check steps)
  - postAnswer: string (optional — only for Check steps: the post-answer explanation shown after the learner submits)
</output_schema>

<formatting_rules>
The content string supports these lightweight markers that the app will render with special styling:

1. Bold key terms: **term** (double asterisks) — used ONCE per term, on first mention only
2. Callout blocks — use these labeled block markers on their own lines:

   [DEFINITION]
   The formal definition or theorem statement goes here.
   [/DEFINITION]

   [EXAMPLE]
   A worked example goes here.
   [/EXAMPLE]

   [KEY INSIGHT]
   An important takeaway or intuition goes here.
   [/KEY INSIGHT]

   [SIMPLY PUT]
   A plain-English recap of the preceding formal content.
   [/SIMPLY PUT]

   [TRY IT]
   A pause signal — poses a mini-challenge for the learner to attempt before reading on. Keep it to 1-2 sentences.
   [/TRY IT]

3. Code blocks are written as plain indented code (the app detects and styles them automatically).
4. All math notation uses Unicode: O(n²), O(n log n), O(log n), O(1). NEVER use LaTeX.
</formatting_rules>

<step_schema>
ExplainStep (target: 6-8 sentences of prose + code + rapid examples):
  1. A 3-4 sentence conceptual paragraph explaining WHY this concept exists, with a real-world analogy or code motivation. Bold **key terms** on first use.
  2. An annotated code block with inline comments on every non-trivial line.
  3. A 2-3 sentence narrated walkthrough of the code with concrete values: "Here arr.length is 5, so the loop runs 5 times. Each iteration does 1 comparison, giving us 5 comparisons total."
  4. A [DEFINITION] or [KEY INSIGHT] callout with the formal definition — this comes AFTER the code, not before (Rule 1).
  5. A [SIMPLY PUT] callout with a 1-2 sentence plain-English recap.
  6. A rapid example series (Rule 2): 4-6 bulleted examples using the complexity ladder — simplest case first, each subsequent bullet adds one complication.

PromptStep:
  1. A 1-2 sentence context setup that frames the problem domain.
  2. A [TRY IT] callout with the challenge — phrase as a direct instruction: "Determine the time complexity of..." or "Trace through the following code with input [5, 3, 8]..."
  3. A 1-sentence scaffolding hint below the [TRY IT] that guides reasoning without revealing the answer.
  Put the answer in the expectedAnswer field, NOT in the content.

CheckStep:
  1. A clean code block with no explanation.
  2. A [TRY IT] callout posing the question: "What does this function return when called with [specific input]?" or "What is the time complexity of this code?"
  Put the expected answer in the expectedAnswer field.
  Put a 3-5 sentence post-answer breakdown in the postAnswer field. The postAnswer MUST:
  - Name the case/rule that applies FIRST ("This is O(n²) because we have nested loops...")
  - Narrate variable identification explicitly (Rule 4)
  - State why the other plausible answers are wrong if applicable

HintStep:
  1. Two numbered hints, each 2 sentences long.
  2. A "Think about it this way:" analogy at the end.

TransitionStep:
  1. A 2-3 sentence bridge connecting the concept just learned to the next concept.
  2. One analogy that makes the connection concrete.

SummaryStep (do NOT write a generic summary paragraph — use this structure instead):
  1. A ranked comparison table (if applicable) with columns: Rank | Notation | Name | Real-World Example | Pattern Recognition Tip
  2. An [EXAMPLE] callout with a fully narrated worked example (Rule 4) — name each value, state which rule applies, show every intermediate calculation.
  3. A rapid example series: 4-6 additional compact examples (input → result) without full narration, to reinforce pattern recognition (Rule 2).
  4. Exactly one reflection question with a specific numerical scenario that tests deep conceptual understanding.
</step_schema>

<constraints>
- All math notation MUST use Unicode: O(n²), O(n log n), O(log n), O(1). NEVER use LaTeX.
- When covering complexity topics, always include O(n log n) alongside O(n) and O(n²).
- Do NOT reveal the answer in the same step as the question.
- Target a MINIMUM of 10 sentences of instructional content per Explain step (not counting rapid examples).
- Progress from fundamentals to deeper understanding across steps using the complexity ladder.
</constraints>
${prereqBlock}${difficultyBlock}
<example>
This is one ExplainStep showing the expected depth, narrated reasoning, and rapid example series:

{
  "type": "Explain",
  "content": "**Time complexity** describes how the number of operations an algorithm performs grows as the input size increases. This is not about measuring wall-clock seconds — it is about understanding the fundamental scaling behavior of your code. A function that processes 10 items in 1 millisecond might take 1 full second for 10,000 items if it scales quadratically, but only 10 milliseconds if it scales linearly. Understanding this distinction is what separates choosing the right algorithm from guessing.\\n\\nfunction sumArray(arr) {\\n  let total = 0;          // 1 operation — runs once\\n  for (let i = 0; i < arr.length; i++) {  // loop runs n times\\n    total += arr[i];     // 1 operation per iteration — runs n times\\n  }\\n  return total;           // 1 operation — runs once\\n}\\n\\nLet us walk through this with a concrete input. Say arr = [10, 20, 30], so n is 3. The variable total is initialized to 0 — that is 1 operation. The for loop checks i < 3 and runs 3 times. Inside each iteration, total += arr[i] is 1 operation, so that contributes 3 operations. The return statement is 1 operation. Total: 1 + 3 + 1 = 5 operations. For a general array of size n, this becomes 1 + n + 1 = n + 2.\\n\\n[DEFINITION]\\nThe time complexity of an algorithm is the function T(n) that describes the number of primitive operations performed as a function of input size n, expressed using asymptotic notation such as O(n), O(n²), or O(log n). We drop constants and lower-order terms because asymptotic analysis cares only about the dominant growth rate.\\n[/DEFINITION]\\n\\n[SIMPLY PUT]\\nThis function visits every element exactly once, so it scales linearly — O(n). Double the input, double the work.\\n[/SIMPLY PUT]\\n\\nRapid examples — count the operations and name the complexity:\\n• arr has 1 element → 1 + 1 + 1 = 3 ops → O(n). Even for n = 1, the function is O(n) — the growth rate matters, not the specific count.\\n• arr has 100 elements → 1 + 100 + 1 = 102 ops → O(n)\\n• arr has 1,000,000 elements → 1 + 1,000,000 + 1 = 1,000,002 ops → O(n)\\n• Two consecutive loops over arr (sum then max) → n + n = 2n → still O(n), because we drop the constant 2\\n• A loop that skips every other element (i += 2) → n/2 iterations → still O(n), because we drop the 1/2 constant"
}

This is one CheckStep showing the narrated postAnswer style:

{
  "type": "Check",
  "content": "function mystery(arr) {\\n  for (let i = 0; i < arr.length; i++) {\\n    for (let j = i + 1; j < arr.length; j++) {\\n      if (arr[i] + arr[j] === 0) return true;\\n    }\\n  }\\n  return false;\\n}\\n\\n[TRY IT]\\nWhat is the time complexity of mystery()? Identify how many times the inner loop runs relative to n.\\n[/TRY IT]",
  "expectedAnswer": "O(n²)",
  "postAnswer": "This is the nested loop case — whenever you see a loop inside a loop that both depend on n, think O(n²). Let us count explicitly: when i = 0, the inner loop runs n − 1 times. When i = 1, it runs n − 2 times. When i = 2, it runs n − 3 times. The total is (n − 1) + (n − 2) + ... + 1 + 0 = n(n − 1)/2. For n = 100, that is 100 × 99 / 2 = 4,950 comparisons. We drop the 1/2 constant and the −n term, leaving O(n²). A common mistake is to say O(n) because the inner loop starts at i + 1 instead of 0 — but halving the iterations does not change the growth rate."
}
</example>

<lesson_structure>
1. Explain — introduce the core concept (code first, then formal definition — Rule 1)
2. Prompt — active retrieval on the basics
3. Hint — for the preceding prompt
4. Explain — second concept or deeper layer (explain where key formulas come from, state all preconditions — Rule 5)
5. Transition — bridge from concept to application
6. Check — code-based verification with narrated postAnswer
7. Explain — limitations and failure cases: list 2-3 concrete scenarios where the technique FAILS or does not apply, and explain why (Rule 3). This is NOT optional.
8. Prompt — harder retrieval question (may test the failure cases from step 7)
9. Summary — comparison table + narrated worked example + rapid examples + reflection question (no generic paragraphs)
</lesson_structure>

<topic>
Generate a lesson for: "${ctx.title}" (category: ${ctx.category})
</topic>

Only return valid JSON. No markdown fences.`;
}

// ─── Questions Prompt ────────────────────────────────────────────────

function buildQuestionsPrompt(ctx: QuestionsGenerationContext): string {
  const prereqBlock =
    ctx.prerequisites && ctx.prerequisites.length > 0
      ? `\n<prerequisites>\nThe learner already understands: ${ctx.prerequisites.join(", ")}. You may reference these concepts in questions.\n</prerequisites>\n`
      : "";

  const difficultyBlock = ctx.difficulty
    ? `\n<difficulty>\nTarget overall difficulty: ${ctx.difficulty}.\n</difficulty>\n`
    : "";

  const lessonBlock = ctx.lessonSummary
    ? `\n<lesson_context>\nThe learner just completed this lesson. Base your questions on the specific code examples, terminology, and concepts used:\n\n${ctx.lessonSummary}\n</lesson_context>\n`
    : "";

  return `<role>
You are an expert DSA instructor creating practice questions. Your questions are precise, force genuine reasoning, and have thorough explanations.
</role>

<output_schema>
Return a JSON object with:
- questions: array of exactly 5 question objects, each with:
  - type: one of "MCQ", "ShortAnswer", "Trace", "BigO"
  - prompt: string (plain text, no markdown, no LaTeX)
  - answerKey: for MCQ: { "correct": "A", "options": ["A: ...", "B: ...", "C: ...", "D: ..."] }. For ShortAnswer/Trace/BigO: a string with the answer.
  - explanation: string — detailed explanation of WHY the answer is correct (3-5 sentences)
  - difficulty: one of "Easy", "Medium", "Hard"
</output_schema>

<constraints>
- Mix question types: at least 1 MCQ, 1 ShortAnswer, and 1 of Trace or BigO.
- Mix difficulties: at least 1 Easy, 2 Medium, 1 Hard.
- All math notation must use Unicode: O(n²), O(n log n), O(log n), etc. NEVER use LaTeX.
- The prompt must NOT contain the answer or telegraph it. Force the learner to reason.
- Explanations must be 3-5 sentences and use narrated reasoning: name each value explicitly, state which rule/case applies, show intermediate calculations, then give the final answer. Never just restate the answer.
- For Trace questions, provide concrete input values and ask for the exact output or state after execution. The explanation should walk through each iteration/call with explicit variable values.
- For BigO questions, ask the learner to derive the complexity from code, not just recall a name. The explanation should count operations explicitly for a concrete n (e.g., n = 5) before generalizing.
</constraints>
${prereqBlock}${difficultyBlock}${lessonBlock}
<topic>
Generate questions for: "${ctx.title}" (category: ${ctx.category})
</topic>

Only return valid JSON. No markdown fences.`;
}

// ─── API Calls ───────────────────────────────────────────────────────

interface CallGeminiOptions {
  prompt: string;
  temperature?: number;
  signal?: AbortSignal;
}

async function callGemini({ prompt, temperature, signal }: CallGeminiOptions): Promise<string> {
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

// ─── Parse + Validate with Retry ─────────────────────────────────────

function safeJsonParse(text: string, label: string): unknown {
  try {
    return JSON.parse(text);
  } catch (err) {
    const preview = text.slice(0, 200);
    throw new Error(
      `Failed to parse ${label} JSON from Gemini. Response starts with: "${preview}..."`,
    );
  }
}

export async function generateWithRetry<T>(
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

    // Don't retry on last attempt
    if (attempt < maxAttempts) {
      console.warn(`[generation] ${lastError.message}. Retrying...`);
    }
  }

  throw lastError!;
}

// ─── Lesson Summary Extraction ───────────────────────────────────────

export function extractLessonSummary(lesson: GeneratedLesson): string {
  const parts: string[] = [`Lesson: ${lesson.title}`];
  for (const step of lesson.steps) {
    if (step.type === "Explain" || step.type === "Summary") {
      // Take first 300 chars of each Explain/Summary step for context
      parts.push(`[${step.type}] ${step.content.slice(0, 300)}`);
    }
  }
  // Cap at ~2000 chars to stay within token budget
  return parts.join("\n\n").slice(0, 2000);
}

// ─── Public Functions ────────────────────────────────────────────────

export async function generateTopicLesson(
  ctx: LessonGenerationContext,
): Promise<GeneratedLesson> {
  return generateWithRetry(
    () => buildLessonPrompt(ctx),
    generatedLessonSchema,
    "Lesson",
    { temperature: 0.7, signal: ctx.signal },
  );
}

export async function generateTopicQuestions(
  ctx: QuestionsGenerationContext,
): Promise<GeneratedQuestions> {
  return generateWithRetry(
    () => buildQuestionsPrompt(ctx),
    generatedQuestionsSchema,
    "Questions",
    { temperature: 0.9, signal: ctx.signal },
  );
}

// ─── Prerequisites Prompt ───────────────────────────────────────────

function buildPrerequisitesPrompt(ctx: PrerequisitesGenerationContext): string {
  const existingList = ctx.existingTopics.length > 0
    ? ctx.existingTopics.map((t) => `- ${t}`).join("\n")
    : "(none)";

  return `You are a computer science curriculum designer. Given a topic, identify its 2-5 prerequisite topics — concepts a learner MUST understand before studying this topic.

<existing_topics>
These topics already exist in the curriculum:
${existingList}
</existing_topics>

<rules>
1. For each prerequisite, determine if it matches an existing topic from the list above.
2. If it matches an existing topic, set isNew to false and use the EXACT title from the list (character-for-character match).
3. If it does not match any existing topic and needs to be created, set isNew to true and provide a new title and a 1-sentence description.
4. Return 2-5 prerequisites. Focus on direct, immediate prerequisites — not transitive ones.
5. Do NOT include the topic itself as a prerequisite.
</rules>

<output_schema>
Return a JSON object with:
- prerequisites: array of objects, each with:
  - title: string (exact existing title OR new title)
  - description: string (1-sentence description)
  - isNew: boolean
</output_schema>

<topic>
Topic: "${ctx.title}" (category: ${ctx.category})
</topic>

Only return valid JSON. No markdown fences.`;
}

export async function generateTopicPrerequisites(
  ctx: PrerequisitesGenerationContext,
): Promise<GeneratedPrerequisites> {
  return generateWithRetry(
    () => buildPrerequisitesPrompt(ctx),
    generatedPrerequisitesSchema,
    "Prerequisites",
    { temperature: 0.3, signal: ctx.signal },
  );
}
