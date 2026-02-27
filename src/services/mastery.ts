import { db } from "@/db";
import type {
  Attempt,
  Difficulty,
  MasteryStatus,
  MasteryTrend,
} from "@/db/schema";

// ─── Return type for UI consumption ──────────────────────────────────

export interface MasteryDelta {
  topicTag: string;
  previousScore: number;
  previousStatus: MasteryStatus;
  newScore: number;
  newStatus: MasteryStatus;
  trend: MasteryTrend;
}

// ─── Pure scoring functions ──────────────────────────────────────────

const DIFFICULTY_WEIGHT: Record<Difficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

export function calculateTopicScore(attempts: Attempt[]): number {
  if (attempts.length === 0) return 0;

  const now = Date.now();
  let weightedCorrect = 0;
  let weightedTotal = 0;

  for (const attempt of attempts) {
    const daysAgo =
      (now - new Date(attempt.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    const diffWeight = DIFFICULTY_WEIGHT[attempt.difficulty ?? "Medium"];
    const recencyWeight = Math.pow(0.9, daysAgo);
    const weight = diffWeight * recencyWeight;

    if (attempt.correct) weightedCorrect += weight;
    weightedTotal += weight;
  }

  if (weightedTotal === 0) return 0;
  return (weightedCorrect / weightedTotal) * 100;
}

export function scoreToStatus(score: number): MasteryStatus {
  if (score < 25) return "NotStarted";
  if (score < 50) return "InProgress";
  if (score < 75) return "Weak";
  return "Mastered";
}

export function computeTrend(
  currentScore: number,
  previousScore: number | null,
): MasteryTrend {
  if (previousScore === null) return "Stable";
  const delta = currentScore - previousScore;
  if (delta > 5) return "Improving";
  if (delta < -5) return "Declining";
  return "Stable";
}

export function buildQuestionTypeBreakdown(
  attempts: Attempt[],
): Record<string, number> {
  const groups: Record<string, { correct: number; total: number }> = {};

  for (const attempt of attempts) {
    const tags = attempt.topicTags ?? [];
    for (const tag of tags) {
      if (!groups[tag]) groups[tag] = { correct: 0, total: 0 };
      groups[tag].total++;
      if (attempt.correct) groups[tag].correct++;
    }
  }

  const breakdown: Record<string, number> = {};
  for (const [tag, { correct, total }] of Object.entries(groups)) {
    breakdown[tag] = total > 0 ? Math.round((correct / total) * 100) : 0;
  }
  return breakdown;
}

// ─── DB orchestration ────────────────────────────────────────────────

export async function updateMasteryAfterQuiz(
  courseId: string,
  sessionAttempts: Attempt[],
): Promise<MasteryDelta[]> {
  // 1. Group session attempts by topicTag
  const topicAttemptMap = new Map<string, Attempt[]>();
  for (const attempt of sessionAttempts) {
    const tags = attempt.topicTags ?? [];
    for (const tag of tags) {
      if (!topicAttemptMap.has(tag)) topicAttemptMap.set(tag, []);
      topicAttemptMap.get(tag)!.push(attempt);
    }
  }

  const deltas: MasteryDelta[] = [];

  // 2. For each unique topic tag, calculate mastery
  for (const topicTag of topicAttemptMap.keys()) {
    // a. Fetch ALL past attempts for this topic in this course
    const allAttempts = await db.attempts
      .where("courseId")
      .equals(courseId)
      .filter((a) => a.topicTags?.includes(topicTag) ?? false)
      .toArray();

    // b. Calculate score
    const score = calculateTopicScore(allAttempts);
    const status = scoreToStatus(score);
    const questionTypeBreakdown = buildQuestionTypeBreakdown(allAttempts);

    // c. Get existing MasteryScore for this topic
    const existing = await db.masteryScores
      .where("[courseId+topicTag]")
      .equals([courseId, topicTag])
      .first()
      .catch(() =>
        // Compound index may not exist — fall back to filter
        db.masteryScores
          .where("courseId")
          .equals(courseId)
          .filter((m) => m.topicTag === topicTag)
          .first(),
      );

    // d. Capture previous values for delta
    const previousScore = existing?.score ?? 0;
    const previousStatus = existing?.status ?? "NotStarted";
    const trend = computeTrend(score, existing ? existing.score : null);

    const now = new Date().toISOString();

    if (existing) {
      // e. Update existing MasteryScore
      await db.masteryScores.update(existing.masteryId, {
        score,
        status,
        attemptCount: allAttempts.length,
        lastAttemptAt: now,
        updatedAt: now,
        questionTypeBreakdown,
        trend,
      });

      // f. Add MasteryHistory snapshot
      await db.masteryHistory.add({
        historyId: crypto.randomUUID(),
        masteryId: existing.masteryId,
        score,
        status,
        recordedAt: now,
      });
    } else {
      // Create new MasteryScore
      const masteryId = crypto.randomUUID();
      await db.masteryScores.add({
        masteryId,
        courseId,
        topicTag,
        score,
        status,
        attemptCount: allAttempts.length,
        lastAttemptAt: now,
        updatedAt: now,
        questionTypeBreakdown,
        trend,
      });

      // Add initial MasteryHistory snapshot
      await db.masteryHistory.add({
        historyId: crypto.randomUUID(),
        masteryId,
        score,
        status,
        recordedAt: now,
      });
    }

    deltas.push({
      topicTag,
      previousScore,
      previousStatus,
      newScore: score,
      newStatus: status,
      trend,
    });
  }

  // 3. Populate mistake bank for incorrect attempts
  for (const attempt of sessionAttempts) {
    if (attempt.correct) continue;

    const existingMistake = await db.mistakeBankItems
      .where("questionId")
      .equals(attempt.questionId)
      .first();

    if (!existingMistake) {
      await db.mistakeBankItems.add({
        mistakeId: crypto.randomUUID(),
        courseId,
        questionId: attempt.questionId,
        attemptId: attempt.attemptId,
        topicTags: attempt.topicTags ?? [],
        createdAt: new Date().toISOString(),
      });
    }
  }

  return deltas;
}
