import { useState, useCallback, useRef, useEffect } from "react";
import { db } from "@/db";
import { COT4400_COURSE_ID, COT4400_WEEKS, TOPIC_TAG_TO_SLUG } from "../data/cot4400-course";
import { COT4400_SOURCE_QUESTIONS } from "../data/cot4400-questions";
import { generateQuizVariant } from "@/services/quiz-generation";
import type { CourseDocContext, WeekTopicContext } from "@/services/quiz-generation";
import { DSA_NODES } from "@/features/topic-explorer/data/dsa-taxonomy";
import type { Difficulty } from "@/db/schema";
import { toast } from "sonner";

type GenerationPhase = "idle" | "generating" | "saving" | "done" | "error";

export function useQuizGeneration() {
  const [phase, setPhase] = useState<GenerationPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (startedAt) {
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startedAt);
      }, 200);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startedAt]);

  const generate = useCallback(
    async (assessmentId: string, assessmentName: string, difficulty: Difficulty, questionCount: number) => {
      if (abortRef.current) abortRef.current.abort();
      const abortController = new AbortController();
      abortRef.current = abortController;

      setPhase("generating");
      setError(null);
      setStartedAt(Date.now());
      setElapsedMs(0);
      setLastSessionId(null);

      try {
        const sourceQuestions = COT4400_SOURCE_QUESTIONS.filter(
          (q) => q.assessmentRef === assessmentId,
        );

        if (sourceQuestions.length === 0) {
          throw new Error("No source questions found for this assessment.");
        }

        // Find the week's moduleId for this assessment so we can pull
        // both quiz docs (linked by assessmentId) and announcements (linked by moduleId)
        const parentWeek = COT4400_WEEKS.find((w) =>
          w.assessmentRefs.includes(assessmentId),
        );
        const refIds = [assessmentId];
        if (parentWeek) refIds.push(parentWeek.moduleId);

        const uploadedDocs = await db.courseDocs
          .where("courseId")
          .equals(COT4400_COURSE_ID)
          .filter(
            (doc) =>
              doc.mappedAssessmentId !== undefined &&
              refIds.includes(doc.mappedAssessmentId),
          )
          .toArray();

        const courseDocs: CourseDocContext[] = uploadedDocs.map((doc) => ({
          type: doc.type as "Announcement" | "QuizInfo",
          rawText: doc.rawText,
        }));

        // Resolve week topic tags → topic descriptions for broader question generation
        const weekTopics: WeekTopicContext[] = (parentWeek?.topicTags ?? [])
          .map((tag) => {
            const slug = TOPIC_TAG_TO_SLUG[tag];
            if (!slug) return null;
            const node = DSA_NODES.find((n) => n.topicTags[0] === slug);
            if (!node) return null;
            return { tag, title: node.title, description: node.description };
          })
          .filter((t): t is WeekTopicContext => t !== null);

        const { questions } = await generateQuizVariant({
          sourceQuestions,
          assessmentName,
          difficulty,
          questionCount,
          courseDocs,
          weekTopics,
          signal: abortController.signal,
        });

        setPhase("saving");

        const sessionId = crypto.randomUUID();
        const questionIds: string[] = [];

        await db.transaction(
          "rw",
          [db.questions, db.quizSessions],
          async () => {
            const questionRecords = questions.map((q) => {
              const qId = crypto.randomUUID();
              questionIds.push(qId);
              return {
                questionId: qId,
                courseId: COT4400_COURSE_ID,
                type: q.type as "MCQ" | "ShortAnswer" | "Trace" | "BigO",
                prompt: q.code ? `${q.prompt}\n\n${q.code}` : q.prompt,
                answerKey: q.answerKey,
                explanation: q.explanation,
                topicTags: sourceQuestions[0].topicTags,
                difficulty: q.difficulty,
                targetAssessmentId: assessmentId,
                generationMeta: {
                  isGenerated: true,
                  sourceAssessmentId: assessmentId,
                  difficulty,
                  coboQuestionType: q.type,
                  formatRequirements: q.formatRequirements,
                  ...(q.code && { code: q.code }),
                },
              };
            });

            await db.questions.bulkAdd(questionRecords);

            await db.quizSessions.add({
              sessionId,
              courseId: COT4400_COURSE_ID,
              questionIds,
              mode: "Practice",
              targetAssessmentId: assessmentId,
              difficulty,
              feedbackPolicy: "Instant",
              createdAt: new Date().toISOString(),
            });
          },
        );

        setLastSessionId(sessionId);
        setPhase("done");
        setStartedAt(null);
        toast.success(`Generated ${questions.length} practice questions`);
      } catch (err) {
        if (abortController.signal.aborted) {
          setPhase("idle");
          setStartedAt(null);
          return;
        }
        setPhase("error");
        setStartedAt(null);
        const message =
          err instanceof Error ? err.message : "Generation failed";
        setError(message);
        toast.error(message);
      }
    },
    [],
  );

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setPhase("idle");
    setStartedAt(null);
    setElapsedMs(0);
  }, []);

  const reset = useCallback(() => {
    setPhase("idle");
    setError(null);
    setStartedAt(null);
    setElapsedMs(0);
    setLastSessionId(null);
  }, []);

  return {
    phase,
    error,
    elapsedMs,
    lastSessionId,
    isGenerating: phase === "generating" || phase === "saving",
    generate,
    cancel,
    reset,
  };
}
