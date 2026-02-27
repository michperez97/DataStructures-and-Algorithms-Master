import { useState, useCallback, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import type { Question, Attempt } from "@/db/schema";
import {
  updateMasteryAfterQuiz,
  type MasteryDelta,
} from "@/services/mastery";

interface QuizSessionState {
  currentIndex: number;
  answers: Map<string, { answer: string; correct: boolean }>;
  isComplete: boolean;
  showingAnswer: boolean;
}

export function useQuizSession(sessionId: string | undefined) {
  const [state, setState] = useState<QuizSessionState>({
    currentIndex: 0,
    answers: new Map(),
    isComplete: false,
    showingAnswer: false,
  });
  const [masteryDeltas, setMasteryDeltas] = useState<MasteryDelta[] | null>(
    null,
  );
  const masteryUpdateFired = useRef(false);

  const session = useLiveQuery(
    () => (sessionId ? db.quizSessions.get(sessionId) : undefined),
    [sessionId],
  );

  const questions = useLiveQuery(
    (): Promise<Question[]> =>
      session?.questionIds && session.questionIds.length > 0
        ? db.questions
            .where("questionId")
            .anyOf(session.questionIds)
            .toArray()
            .then((qs) => {
              const map = new Map(qs.map((q) => [q.questionId, q]));
              return session.questionIds
                .map((id) => map.get(id))
                .filter((q): q is Question => q !== undefined);
            })
        : Promise.resolve([]),
    [session?.questionIds],
  );

  const attempts = useLiveQuery(
    (): Promise<Attempt[]> =>
      sessionId
        ? db.attempts
            .where("sessionId")
            .equals(sessionId)
            .toArray()
        : Promise.resolve([]),
    [sessionId],
  );

  const currentQuestion =
    questions && questions.length > 0
      ? questions[state.currentIndex] ?? null
      : null;

  const revealAnswer = useCallback(() => {
    setState((prev) => ({ ...prev, showingAnswer: true }));
  }, []);

  const submitAnswer = useCallback(
    async (answer: string, correct: boolean) => {
      if (!sessionId || !currentQuestion) return;

      await db.attempts.add({
        attemptId: crypto.randomUUID(),
        sessionId,
        questionId: currentQuestion.questionId,
        courseId: currentQuestion.courseId,
        answer,
        correct,
        timestamp: new Date().toISOString(),
        topicTags: currentQuestion.topicTags,
        difficulty: currentQuestion.difficulty,
      });

      setState((prev) => {
        const newAnswers = new Map(prev.answers);
        newAnswers.set(currentQuestion.questionId, { answer, correct });
        const nextIndex = prev.currentIndex + 1;
        const isComplete =
          questions !== undefined && nextIndex >= questions.length;
        return {
          currentIndex: isComplete ? prev.currentIndex : nextIndex,
          answers: newAnswers,
          isComplete,
          showingAnswer: false,
        };
      });

      if (questions && state.currentIndex + 1 >= questions.length) {
        await db.quizSessions.update(sessionId, {
          completedAt: new Date().toISOString(),
        });

        // Fire-and-forget mastery update — don't block quiz completion
        if (!masteryUpdateFired.current && session) {
          masteryUpdateFired.current = true;
          const sessionAttempts = await db.attempts
            .where("sessionId")
            .equals(sessionId)
            .toArray();
          updateMasteryAfterQuiz(session.courseId, sessionAttempts)
            .then(setMasteryDeltas)
            .catch(console.error);
        }
      }
    },
    [sessionId, currentQuestion, questions, state.currentIndex, session],
  );

  const score = state.isComplete
    ? {
        correct: Array.from(state.answers.values()).filter((a) => a.correct)
          .length,
        total: state.answers.size,
      }
    : null;

  return {
    session: session ?? null,
    questions: questions ?? [],
    attempts: attempts ?? [],
    currentQuestion,
    currentIndex: state.currentIndex,
    totalQuestions: questions?.length ?? 0,
    showingAnswer: state.showingAnswer,
    isComplete: state.isComplete,
    score,
    masteryDeltas,
    revealAnswer,
    submitAnswer,
    isLoading: session === undefined || questions === undefined,
  };
}
