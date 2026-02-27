import { useNavigate } from "react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Check, X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Question, Attempt } from "@/db/schema";
import type { MasteryDelta } from "@/services/mastery";

interface QuizResultsSummaryProps {
  score: { correct: number; total: number };
  questions: Question[];
  attempts: Attempt[];
  assessmentName?: string;
  weekNumber?: number;
  masteryDeltas?: MasteryDelta[] | null;
}

const STATUS_LABEL: Record<string, string> = {
  NotStarted: "Not Started",
  InProgress: "In Progress",
  Weak: "Weak",
  Mastered: "Mastered",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  NotStarted: "outline",
  InProgress: "secondary",
  Weak: "destructive",
  Mastered: "default",
};

function TrendIndicator({ trend }: { trend: string }) {
  if (trend === "Improving")
    return <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
  if (trend === "Declining")
    return <TrendingDown className="h-4 w-4 text-red-500 dark:text-red-400" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

export function QuizResultsSummary({
  score,
  questions,
  attempts,
  assessmentName,
  weekNumber,
  masteryDeltas,
}: QuizResultsSummaryProps) {
  const navigate = useNavigate();
  const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
  const attemptMap = new Map(
    attempts.map((a) => [a.questionId, a]),
  );

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="font-serif text-2xl">Quiz Complete</CardTitle>
        <div className="mt-4">
          <div className="font-serif text-4xl font-semibold">
            {score.correct}/{score.total}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-2">{pct}% correct</div>
        </div>
        {assessmentName && (
          <p className="text-muted-foreground mt-2 text-sm">
            {assessmentName}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {masteryDeltas && masteryDeltas.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Topic Mastery
            </h3>
            {masteryDeltas.map((delta) => {
              const improved = delta.newScore > delta.previousScore;
              const declined = delta.newScore < delta.previousScore;
              return (
                <div
                  key={delta.topicTag}
                  className="flex items-center gap-3 rounded-xl border border-stone-200/60 dark:border-white/[0.06] p-3"
                >
                  <TrendIndicator trend={delta.trend} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{delta.topicTag}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`font-mono text-xs ${
                          improved
                            ? "text-emerald-600 dark:text-emerald-400"
                            : declined
                              ? "text-red-500 dark:text-red-400"
                              : "text-muted-foreground"
                        }`}
                      >
                        {Math.round(delta.previousScore)}% &rarr; {Math.round(delta.newScore)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {delta.previousStatus !== delta.newStatus && (
                      <Badge variant={STATUS_VARIANT[delta.previousStatus] ?? "outline"} className="text-[10px]">
                        {STATUS_LABEL[delta.previousStatus] ?? delta.previousStatus}
                      </Badge>
                    )}
                    {delta.previousStatus !== delta.newStatus && (
                      <span className="text-muted-foreground text-xs">&rarr;</span>
                    )}
                    <Badge variant={STATUS_VARIANT[delta.newStatus] ?? "outline"} className="text-[10px]">
                      {STATUS_LABEL[delta.newStatus] ?? delta.newStatus}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-2">
          {questions.map((q, i) => {
            const attempt = attemptMap.get(q.questionId);
            const correct = attempt?.correct ?? false;
            const meta = q.generationMeta as Record<string, unknown> | undefined;
            return (
              <div
                key={q.questionId}
                className="flex items-center gap-3 rounded-xl border border-stone-200/60 dark:border-white/[0.06] p-3"
              >
                {correct ? (
                  <Check className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <X className="h-5 w-5 shrink-0 text-red-500 dark:text-red-400" />
                )}
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider">Q{i + 1}</span>
                  <span className="text-muted-foreground ml-2 text-sm">
                    {(meta?.coboQuestionType as string) ?? q.type}
                  </span>
                </div>
                <Badge
                  variant={correct ? "default" : "outline"}
                  className="text-xs"
                >
                  {correct ? "Correct" : "Missed"}
                </Badge>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 pt-2">
          {weekNumber && (
            <Button
              variant="outline"
              onClick={() => navigate(`/my-course/week/${weekNumber}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Week
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate("/my-course")}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Course Map
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
