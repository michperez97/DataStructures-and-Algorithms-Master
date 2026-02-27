import type { Question } from "@/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MCQAnswerKey } from "@/services/topic-generation-schema";

function isMCQAnswerKey(val: unknown): val is MCQAnswerKey {
  return (
    typeof val === "object" &&
    val !== null &&
    "correct" in val &&
    "options" in val &&
    Array.isArray((val as MCQAnswerKey).options)
  );
}

function MCQOptions({ answerKey }: { answerKey: MCQAnswerKey }) {
  return (
    <div className="mt-3 space-y-1.5">
      {answerKey.options.map((opt, i) => {
        const letter = opt.match(/^([A-Z]):/)?.[1];
        const isCorrect = letter === answerKey.correct;
        return (
          <div key={i}>
            <details>
              <summary className="cursor-pointer py-1 text-[0.9375rem] leading-6">
                {opt}
              </summary>
              {isCorrect ? (
                <span className="ml-6 text-sm font-medium text-green-600">
                  Correct
                </span>
              ) : (
                <span className="text-muted-foreground ml-6 text-sm">
                  Incorrect
                </span>
              )}
            </details>
          </div>
        );
      })}
    </div>
  );
}

interface QuestionRendererProps {
  questions: Question[];
}

export function QuestionRenderer({ questions }: QuestionRendererProps) {
  if (questions.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">
        Practice Questions ({questions.length})
      </h3>
      {questions.map((q, i) => {
        const mcq = isMCQAnswerKey(q.answerKey);
        return (
          <Card key={q.questionId}>
            <CardContent className="pt-5 pb-5">
              <div className="mb-3 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {q.type}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {q.difficulty}
                </Badge>
                <span className="text-muted-foreground text-sm">
                  Q{i + 1}
                </span>
              </div>
              <p className="text-base leading-7 whitespace-pre-wrap">
                {q.prompt}
              </p>
              {mcq && (
                <MCQOptions answerKey={q.answerKey as MCQAnswerKey} />
              )}
              {!mcq && (
                <details className="mt-3">
                  <summary className="text-muted-foreground cursor-pointer text-sm">
                    Show answer
                  </summary>
                  <p className="mt-2 text-[0.9375rem] font-medium leading-7">
                    {String(q.answerKey)}
                  </p>
                </details>
              )}
              <details className="mt-3">
                <summary className="text-muted-foreground cursor-pointer text-sm">
                  Show explanation
                </summary>
                <p className="mt-2 text-base leading-7 whitespace-pre-wrap">
                  {q.explanation}
                </p>
              </details>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
