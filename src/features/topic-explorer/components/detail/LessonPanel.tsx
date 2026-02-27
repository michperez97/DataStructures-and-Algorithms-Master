import type { InteractiveLesson, KnowledgeNode } from "@/db/schema";
import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { LessonRenderer } from "../content/LessonRenderer";
import { GenerateContentButton } from "../GenerateContentButton";
import { GenerationProgressCard } from "../GenerationProgressCard";
import { BottomActionPill } from "./BottomActionPill";

interface LessonPanelProps {
  node: KnowledgeNode;
  lessons: InteractiveLesson[];
  hasContent: boolean;
  contentLoading: boolean;
  isGenerating: boolean;
  phase: string;
  elapsedMs: number;
  onGenerate: () => void;
  onCancel: () => void;
  onMarkRead: () => void;
  onPractice: () => void;
}

export function LessonPanel({
  node,
  lessons,
  hasContent,
  contentLoading,
  isGenerating,
  phase,
  elapsedMs,
  onGenerate,
  onCancel,
  onMarkRead,
  onPractice,
}: LessonPanelProps) {
  const showProgress =
    phase === "prerequisites" || phase === "lesson" || phase === "questions" || phase === "saving";

  return (
    <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[24px] bg-[#FCFBF8] dark:bg-[#151413]">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-8 pt-8 pb-28">
        {/* Title + description */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900 dark:text-stone-100">
            {node.title}
          </h1>
          {node.description && (
            <p className="mt-2 text-base leading-7 text-stone-500 dark:text-stone-400">
              {node.description}
            </p>
          )}
        </div>

        {/* Generate button when no content */}
        {!hasContent && !showProgress && !contentLoading && (
          <div className="space-y-4">
            <EmptyState
              icon={BookOpen}
              title="No content yet"
              description="Generate a lesson and practice questions for this topic using Gemini."
            />
            <div className="flex justify-center">
              <GenerateContentButton
                hasContent={false}
                isGenerating={isGenerating}
                onClick={onGenerate}
              />
            </div>
          </div>
        )}

        {/* Progress card */}
        {showProgress && (
          <GenerationProgressCard
            phase={phase as "prerequisites" | "lesson" | "questions" | "saving"}
            elapsedMs={elapsedMs}
            onCancel={onCancel}
          />
        )}

        {/* Loading */}
        {contentLoading && (
          <p className="text-sm text-stone-400">Loading content...</p>
        )}

        {/* Lesson content */}
        {hasContent && !contentLoading && (
          <div className="space-y-6">
            {/* Regenerate button */}
            <div className="flex justify-end">
              <GenerateContentButton
                hasContent={true}
                isGenerating={isGenerating}
                onClick={onGenerate}
              />
            </div>
            <LessonRenderer lessons={lessons} />
          </div>
        )}
      </div>

      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#FCFBF8] dark:from-[#151413]" />

      {/* Bottom action pill */}
      {hasContent && !contentLoading && (
        <BottomActionPill
          status={node.status}
          onMarkRead={onMarkRead}
          onPractice={onPractice}
        />
      )}
    </div>
  );
}
