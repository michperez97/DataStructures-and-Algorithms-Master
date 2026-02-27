import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Eye, Check, X } from "lucide-react";
import type { Question } from "@/db/schema";

interface QuizQuestionCardProps {
  question: Question;
  questionNumber: number;
  showingAnswer: boolean;
  onReveal: () => void;
  onSubmit: (answer: string, correct: boolean) => void;
}

export function QuizQuestionCard({
  question,
  questionNumber,
  showingAnswer,
  onReveal,
  onSubmit,
}: QuizQuestionCardProps) {
  const [scratchWork, setScratchWork] = useState("");
  const meta = question.generationMeta as Record<string, unknown> | undefined;
  const formatReqs = meta?.formatRequirements as string | undefined;
  const code = meta?.code as string | undefined;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">Question {questionNumber}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {(meta?.coboQuestionType as string) ?? question.type}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {question.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {question.prompt}
        </p>

        {code && (
          <pre className="bg-muted overflow-x-auto rounded-xl p-4 text-sm">
            <code>{code}</code>
          </pre>
        )}

        {formatReqs && (
          <div className="bg-primary/5 border-primary/20 rounded-xl border p-3 text-sm">
            <span className="font-mono text-[10px] font-medium uppercase tracking-wider">Format: </span>
            {formatReqs}
          </div>
        )}

        <div className="space-y-2">
          <label className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Your work / scratch space
          </label>
          <Textarea
            value={scratchWork}
            onChange={(e) => setScratchWork(e.target.value)}
            placeholder="Work through the problem here..."
            className="min-h-[120px] font-mono text-sm"
            disabled={showingAnswer}
          />
        </div>

        {!showingAnswer && (
          <Button onClick={onReveal}>
            <Eye className="mr-2 h-4 w-4" />
            Check Answer
          </Button>
        )}

        {showingAnswer && (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/30 dark:bg-emerald-900/20">
              <div className="mb-2 font-mono text-[10px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Expected Answer
              </div>
              <p className="whitespace-pre-wrap text-sm">
                {question.answerKey as string}
              </p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4">
              <div className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Explanation
              </div>
              <p className="whitespace-pre-wrap text-sm">
                {question.explanation}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="default"
                onClick={() => onSubmit(scratchWork, true)}
              >
                <Check className="mr-2 h-4 w-4" />
                Got it
              </Button>
              <Button
                variant="outline"
                onClick={() => onSubmit(scratchWork, false)}
              >
                <X className="mr-2 h-4 w-4" />
                Missed it
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
