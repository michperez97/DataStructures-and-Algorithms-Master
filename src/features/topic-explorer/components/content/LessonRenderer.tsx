import type { InteractiveLesson } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { parseStep, STEP_STYLE } from "./content-utils";
import { ContentRenderer } from "./ContentRenderer";

interface LessonRendererProps {
  lessons: InteractiveLesson[];
}

export function LessonRenderer({ lessons }: LessonRendererProps) {
  return (
    <div className="space-y-8">
      {lessons.map((lesson) => (
        <Card key={lesson.lessonId}>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{lesson.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {lesson.steps.map((rawStep, i) => {
              const step = parseStep(rawStep);
              const borderColor =
                STEP_STYLE[step.type] ?? "border-l-gray-300";
              const isCheckWithoutExplanation =
                step.type === "Check" && !step.postAnswer;
              return (
                <div
                  key={i}
                  className={`space-y-3 border-l-4 pl-5 ${borderColor}`}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {step.type}
                    </Badge>
                    <span className="text-muted-foreground text-sm">
                      Step {i + 1}
                    </span>
                  </div>
                  <ContentRenderer content={step.content} />
                  {step.expectedAnswer && (
                    <details className="mt-2">
                      <summary className="text-muted-foreground cursor-pointer text-sm">
                        Show expected answer
                      </summary>
                      <p className="mt-2 text-[0.9375rem] leading-7 italic">
                        {step.expectedAnswer}
                      </p>
                    </details>
                  )}
                  {step.postAnswer && (
                    <details className="mt-2">
                      <summary className="text-muted-foreground cursor-pointer text-sm">
                        Show explanation
                      </summary>
                      <div className="mt-2 text-base leading-7">
                        <ContentRenderer content={step.postAnswer} />
                      </div>
                    </details>
                  )}
                  {isCheckWithoutExplanation && (
                    <p className="text-muted-foreground mt-2 text-sm italic">
                      Explanation not available for this step.
                    </p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
