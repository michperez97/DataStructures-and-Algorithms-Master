import { useState } from "react";
import { Bot, Send, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuestionRenderer } from "../content/QuestionRenderer";
import { useTopicDetailStore } from "@/stores/topic-detail-store";
import type { Question } from "@/db/schema";

interface CompanionPanelProps {
  questions: Question[];
  topicTitle: string;
}

// ─── Tutor Tab (Placeholder) ─────────────────────────────────────────

function TutorTab({ topicTitle }: { topicTitle: string }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-4 p-4">
        {/* AI avatar + static message */}
        <div className="flex gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
            <Bot className="size-4 text-stone-500" />
          </div>
          <div className="rounded-2xl rounded-tl-sm bg-stone-100 px-4 py-3 text-sm leading-relaxed dark:bg-stone-800">
            Hi! I'm your tutor for <strong>{topicTitle}</strong>. Ask me
            anything about this topic and I'll help you understand it better.
          </div>
        </div>
      </div>
      {/* Disabled input */}
      <div className="border-t border-stone-200/60 p-3 dark:border-white/5">
        <div className="flex gap-2">
          <Input
            placeholder="Ask a question..."
            disabled
            className="h-9 border-stone-200/60 bg-white/50 text-sm dark:border-white/5 dark:bg-white/5"
          />
          <Button size="icon" variant="ghost" disabled className="size-9 shrink-0">
            <Send className="size-3.5" />
          </Button>
        </div>
        <p className="mt-1.5 text-center text-[0.6875rem] text-stone-400">
          Coming soon
        </p>
      </div>
    </div>
  );
}

// ─── Assess Tab ──────────────────────────────────────────────────────

function AssessTab({ questions }: { questions: Question[] }) {
  if (questions.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-center text-sm text-stone-400">
          No practice questions yet. Generate content first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <QuestionRenderer questions={questions} />
    </div>
  );
}

// ─── Recall Tab (Placeholder) ────────────────────────────────────────

function RecallTab({ topicTitle }: { topicTitle: string }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
      <Badge
        variant="secondary"
        className="text-[0.6875rem] font-normal"
      >
        Coming soon
      </Badge>

      {/* Sample flashcard */}
      <button
        onClick={() => setFlipped(!flipped)}
        className="w-full rounded-2xl border border-stone-200/60 bg-white p-6 text-center shadow-sm transition-transform hover:scale-[1.02] dark:border-white/5 dark:bg-stone-800"
        style={{ perspective: "600px" }}
      >
        <div
          className="transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {!flipped ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                Flashcard
              </p>
              <p className="mt-3 text-sm font-medium text-stone-700 dark:text-stone-200">
                What is the key concept of {topicTitle}?
              </p>
              <p className="mt-3 text-[0.6875rem] text-stone-400">
                Tap to flip
              </p>
            </div>
          ) : (
            <div style={{ transform: "rotateY(180deg)" }}>
              <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                Answer
              </p>
              <p className="mt-3 text-sm text-stone-600 dark:text-stone-300">
                Spaced repetition flashcards will be available soon for this
                topic.
              </p>
            </div>
          )}
        </div>
      </button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setFlipped(false)}
        className="text-xs"
      >
        <RotateCcw className="mr-1.5 size-3" />
        Reset
      </Button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export function CompanionPanel({ questions, topicTitle }: CompanionPanelProps) {
  const { rightPanelTab, openRightPanelTo } = useTopicDetailStore();

  const tabs = [
    { key: "tutor" as const, label: "Tutor" },
    { key: "assess" as const, label: "Assess" },
    { key: "recall" as const, label: "Recall" },
  ];

  return (
    <div className="flex h-full w-80 shrink-0 flex-col overflow-hidden rounded-[24px] bg-white/80 backdrop-blur-2xl dark:bg-[#201E1D]/80">
      {/* Tab bar */}
      <div className="p-3 pb-0">
        <div className="flex rounded-xl bg-stone-100 p-1 dark:bg-stone-900/50">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => openRightPanelTo(tab.key)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                rightPanelTab === tab.key
                  ? "bg-white text-stone-900 shadow-sm dark:bg-stone-800 dark:text-stone-100"
                  : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {rightPanelTab === "tutor" && <TutorTab topicTitle={topicTitle} />}
        {rightPanelTab === "assess" && <AssessTab questions={questions} />}
        {rightPanelTab === "recall" && <RecallTab topicTitle={topicTitle} />}
      </div>
    </div>
  );
}
