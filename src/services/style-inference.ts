import type { NotationPreference, Strictness } from "@/db/schema";

export interface InferredStyle {
  terminologyMap?: Record<string, string>;
  notationPreference?: NotationPreference;
  questionTypeWeights?: Record<string, number>;
  difficultyBaseline?: number;
  strictnessBaseline?: Strictness;
}

const NOTATION_PATTERNS: Array<{
  pattern: RegExp;
  value: NotationPreference;
}> = [
  { pattern: /\bBig[\s-]?Theta\b/i, value: "BigTheta" },
  { pattern: /\bΘ\s*\(/i, value: "BigTheta" },
  { pattern: /\bBig[\s-]?O\b/i, value: "BigO" },
  { pattern: /\bO\s*\(\s*[n\dlog]/i, value: "BigO" },
];

const TERMINOLOGY_PAIRS: Array<[RegExp, string, string]> = [
  [/\bvertex\b/i, "node", "vertex"],
  [/\bvertices\b/i, "node", "vertex"],
  [/\bnode\b/i, "node", "node"],
  [/\bedge\b/i, "edge", "edge"],
  [/\barc\b/i, "edge", "arc"],
  [/\barray\b/i, "list", "array"],
  [/\blinked\s*list\b/i, "list", "linked list"],
  [/\benqueue\b/i, "add_to_queue", "enqueue"],
  [/\bdequeue\b/i, "remove_from_queue", "dequeue"],
  [/\bpush\b/i, "add_to_stack", "push"],
  [/\bpop\b/i, "remove_from_stack", "pop"],
];

const QUESTION_TYPE_KEYWORDS: Record<string, RegExp[]> = {
  MCQ: [/\bmultiple\s*choice\b/i, /\bMCQ\b/, /\bchoose\s+(the\s+)?(best|correct)\b/i],
  ShortAnswer: [/\bshort\s*answer\b/i, /\bfree\s*response\b/i, /\bexplain\b/i],
  Trace: [/\btrace\b/i, /\bstep[\s-]?by[\s-]?step\b/i, /\bwalk\s*through\b/i],
  BigO: [/\bcomplexity\b/i, /\bruntime\b/i, /\btime\s*complexity\b/i, /\bspace\s*complexity\b/i],
};

const STRICTNESS_CUES: Array<{ pattern: RegExp; value: Strictness }> = [
  { pattern: /\bpartial\s*credit\b/i, value: "Lenient" },
  { pattern: /\bno\s*partial\s*credit\b/i, value: "Strict" },
  { pattern: /\ball[\s-]or[\s-]nothing\b/i, value: "Strict" },
  { pattern: /\bexact\s*(answer|match)\b/i, value: "Strict" },
  { pattern: /\bshow\s*(your\s*)?work\b/i, value: "Standard" },
];

const DIFFICULTY_CUES: Array<{ pattern: RegExp; score: number }> = [
  { pattern: /\bintroductory\b/i, score: 1 },
  { pattern: /\bbeginner\b/i, score: 1 },
  { pattern: /\bbasic\b/i, score: 2 },
  { pattern: /\bintermediate\b/i, score: 3 },
  { pattern: /\badvanced\b/i, score: 4 },
  { pattern: /\bchallenging\b/i, score: 5 },
  { pattern: /\bproof\b/i, score: 4 },
  { pattern: /\bderive\b/i, score: 4 },
];

export function inferStyle(text: string): InferredStyle {
  const result: InferredStyle = {};

  // Notation preference
  const notationHits: Record<NotationPreference, number> = {
    BigO: 0,
    BigTheta: 0,
    Mixed: 0,
  };
  for (const { pattern, value } of NOTATION_PATTERNS) {
    const matches = text.match(new RegExp(pattern, "gi"));
    if (matches) notationHits[value] += matches.length;
  }
  if (notationHits.BigO > 0 && notationHits.BigTheta > 0) {
    result.notationPreference = "Mixed";
  } else if (notationHits.BigTheta > 0) {
    result.notationPreference = "BigTheta";
  } else if (notationHits.BigO > 0) {
    result.notationPreference = "BigO";
  }

  // Terminology
  const termMap: Record<string, string> = {};
  for (const [pattern, key, value] of TERMINOLOGY_PAIRS) {
    if (pattern.test(text)) {
      termMap[key] = value;
    }
  }
  if (Object.keys(termMap).length > 0) {
    result.terminologyMap = termMap;
  }

  // Question type weights
  const typeCounts: Record<string, number> = {};
  let totalHits = 0;
  for (const [type, patterns] of Object.entries(QUESTION_TYPE_KEYWORDS)) {
    let count = 0;
    for (const p of patterns) {
      const matches = text.match(new RegExp(p, "gi"));
      if (matches) count += matches.length;
    }
    if (count > 0) {
      typeCounts[type] = count;
      totalHits += count;
    }
  }
  if (totalHits > 0) {
    const weights: Record<string, number> = {};
    for (const [type, count] of Object.entries(typeCounts)) {
      weights[type] = Math.round((count / totalHits) * 100);
    }
    result.questionTypeWeights = weights;
  }

  // Strictness
  for (const { pattern, value } of STRICTNESS_CUES) {
    if (pattern.test(text)) {
      result.strictnessBaseline = value;
      break;
    }
  }

  // Difficulty baseline
  const diffScores: number[] = [];
  for (const { pattern, score } of DIFFICULTY_CUES) {
    if (pattern.test(text)) {
      diffScores.push(score);
    }
  }
  if (diffScores.length > 0) {
    const avg = diffScores.reduce((a, b) => a + b, 0) / diffScores.length;
    result.difficultyBaseline = Math.round(avg);
  }

  return result;
}
