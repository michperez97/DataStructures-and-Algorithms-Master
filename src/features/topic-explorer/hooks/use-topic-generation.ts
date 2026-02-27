import { useState, useCallback, useRef, useEffect } from "react";
import { db } from "@/db";
import type { KnowledgeNode, KnowledgeEdge, Difficulty } from "@/db/schema";
import {
  generateTopicLesson,
  generateTopicQuestions,
  generateTopicPrerequisites,
  extractLessonSummary,
} from "@/services/topic-generation";
import { toast } from "sonner";

type GenerationPhase = "idle" | "prerequisites" | "lesson" | "questions" | "saving" | "done" | "error";

// ─── Prerequisite Depth → Difficulty ─────────────────────────────────

async function computeDifficulty(
  mapId: string,
  nodeId: string,
): Promise<Difficulty> {
  // BFS backwards through prerequisite edges to find depth
  const visited = new Set<string>();
  const queue = [nodeId];
  let depth = 0;

  while (queue.length > 0) {
    const size = queue.length;
    for (let i = 0; i < size; i++) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      const incomingEdges = await db.knowledgeEdges
        .where("mapId")
        .equals(mapId)
        .filter((e) => e.toNodeId === current && e.type === "Prerequisite")
        .toArray();

      for (const edge of incomingEdges) {
        if (!visited.has(edge.fromNodeId)) {
          queue.push(edge.fromNodeId);
        }
      }
    }
    if (queue.length > 0) depth++;
  }

  if (depth <= 1) return "Easy";
  if (depth <= 3) return "Medium";
  return "Hard";
}

// ─── Hook ────────────────────────────────────────────────────────────

export function useTopicGeneration() {
  const [phase, setPhase] = useState<GenerationPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Elapsed time ticker
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

  const generate = useCallback(async (node: KnowledgeNode) => {
    const topicTag = node.topicTags[0];
    if (!topicTag) return;

    // Cancel any in-flight generation
    if (abortRef.current) abortRef.current.abort();
    const abortController = new AbortController();
    abortRef.current = abortController;

    setPhase("prerequisites");
    setError(null);
    setStartedAt(Date.now());
    setElapsedMs(0);

    try {
      // Resolve canonical course at runtime
      const canonicalCourse = await db.courses
        .where("type")
        .equals("Canonical")
        .first();

      if (!canonicalCourse) {
        throw new Error("No Canonical course found. Please ensure the database is seeded.");
      }

      const courseId = canonicalCourse.courseId;
      const mapId = node.mapId;

      // ── Prerequisites phase ───────────────────────────────────────
      // Fetch all existing node titles for the LLM to match against
      const allNodes = await db.knowledgeNodes
        .where("mapId")
        .equals(mapId)
        .toArray();
      const existingTopics = allNodes.map((n) => n.title);

      const { prerequisites: generatedPrereqs } = await generateTopicPrerequisites({
        title: node.title,
        category: node.category ?? "General",
        existingTopics,
        signal: abortController.signal,
      });

      // Resolve prerequisites: match existing nodes or prepare new ones
      interface ResolvedPrerequisite {
        nodeId: string;
        isNew: boolean;
        node?: KnowledgeNode;
      }

      const resolvedPrereqs: ResolvedPrerequisite[] = [];
      const newNodes: KnowledgeNode[] = [];

      for (const prereq of generatedPrereqs) {
        if (!prereq.isNew) {
          // Find existing node by exact title match
          const existing = allNodes.find(
            (n) => n.title === prereq.title,
          );
          if (existing) {
            resolvedPrereqs.push({ nodeId: existing.nodeId, isNew: false });
          }
          // If LLM said isNew:false but title doesn't match, skip silently
        } else {
          // Create a new KnowledgeNode
          const newNodeId = crypto.randomUUID();
          const newNode: KnowledgeNode = {
            nodeId: newNodeId,
            mapId,
            title: prereq.title,
            description: prereq.description,
            topicTags: [prereq.title],
            category: "Generated",
            status: "NotCovered",
          };
          newNodes.push(newNode);
          resolvedPrereqs.push({ nodeId: newNodeId, isNew: true, node: newNode });
        }
      }

      // Collect resolved prerequisite titles for lesson/question generation
      const prerequisiteTitles = resolvedPrereqs.map((rp) => {
        if (rp.isNew && rp.node) return rp.node.title;
        const existing = allNodes.find((n) => n.nodeId === rp.nodeId);
        return existing?.title ?? "";
      }).filter(Boolean);

      // Compute difficulty based on current edges (before we add new ones)
      const difficulty = await computeDifficulty(mapId, node.nodeId);

      // ── Lesson phase ──────────────────────────────────────────────
      setPhase("lesson");

      const lesson = await generateTopicLesson({
        title: node.title,
        category: node.category ?? "General",
        prerequisites: prerequisiteTitles,
        difficulty,
        signal: abortController.signal,
      });

      // ── Questions phase ───────────────────────────────────────────
      setPhase("questions");

      const lessonSummary = extractLessonSummary(lesson);
      const { questions } = await generateTopicQuestions({
        title: node.title,
        category: node.category ?? "General",
        prerequisites: prerequisiteTitles,
        difficulty,
        lessonSummary,
        signal: abortController.signal,
      });

      // ── Saving phase ──────────────────────────────────────────────
      setPhase("saving");

      // Delete old content AFTER successful generation (not before)
      const existingLessons = await db.interactiveLessons
        .where("courseId")
        .equals(courseId)
        .filter((l) => l.topicTags.includes(topicTag))
        .toArray();
      const existingQuestions = await db.questions
        .where("courseId")
        .equals(courseId)
        .filter((q) => q.topicTags.includes(topicTag))
        .toArray();

      // Find old generated edges to clean up (prefixed with "gen-")
      const oldGeneratedEdges = await db.knowledgeEdges
        .where("mapId")
        .equals(mapId)
        .filter((e) => e.toNodeId === node.nodeId && e.edgeId.startsWith("gen-"))
        .toArray();

      // Build new prerequisite edges
      const newEdges: KnowledgeEdge[] = resolvedPrereqs.map((rp) => ({
        edgeId: `gen-${crypto.randomUUID()}`,
        mapId,
        fromNodeId: rp.nodeId,
        toNodeId: node.nodeId,
        type: "Prerequisite" as const,
      }));

      // Atomic save: delete old + insert new in one transaction
      await db.transaction(
        "rw",
        [db.interactiveLessons, db.questions, db.knowledgeNodes, db.knowledgeEdges],
        async () => {
          if (existingLessons.length > 0) {
            await db.interactiveLessons.bulkDelete(
              existingLessons.map((l) => l.lessonId),
            );
          }
          if (existingQuestions.length > 0) {
            await db.questions.bulkDelete(
              existingQuestions.map((q) => q.questionId),
            );
          }

          // Clean up old generated edges
          if (oldGeneratedEdges.length > 0) {
            await db.knowledgeEdges.bulkDelete(
              oldGeneratedEdges.map((e) => e.edgeId),
            );
          }

          // Add new prerequisite nodes (the isNew ones)
          if (newNodes.length > 0) {
            await db.knowledgeNodes.bulkAdd(newNodes);
          }

          // Add new prerequisite edges
          if (newEdges.length > 0) {
            await db.knowledgeEdges.bulkAdd(newEdges);
          }

          const lessonId = crypto.randomUUID();
          await db.interactiveLessons.add({
            lessonId,
            courseId,
            title: lesson.title,
            topicTags: [topicTag],
            steps: lesson.steps.map((s) => JSON.stringify(s)),
            difficulty,
          });

          await db.questions.bulkAdd(
            questions.map((q) => ({
              questionId: crypto.randomUUID(),
              courseId,
              type: q.type,
              prompt: q.prompt,
              answerKey: q.answerKey,
              explanation: q.explanation,
              topicTags: [topicTag],
              difficulty: q.difficulty,
            })),
          );

          await db.knowledgeNodes.update(node.nodeId, { status: "Covered" });
        },
      );

      setPhase("done");
      setStartedAt(null);
      toast.success(`Content generated for "${node.title}"`);
    } catch (err) {
      if (abortController.signal.aborted) {
        setPhase("idle");
        setStartedAt(null);
        return;
      }
      setPhase("error");
      setStartedAt(null);
      const message = err instanceof Error ? err.message : "Generation failed";
      setError(message);
      toast.error(message);
    }
  }, []);

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
  }, []);

  return {
    phase,
    error,
    elapsedMs,
    isGenerating: phase !== "idle" && phase !== "done" && phase !== "error",
    generate,
    cancel,
    reset,
  };
}
