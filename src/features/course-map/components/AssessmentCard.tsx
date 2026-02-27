import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import type { Question } from "@/db/schema";
import type { AssessmentDefinition } from "../data/cot4400-course";

interface AssessmentCardProps {
  assessmentDef: AssessmentDefinition;
  sourceQuestions: Question[];
  children?: React.ReactNode;
}

export function AssessmentCard({
  assessmentDef,
  sourceQuestions,
  children,
}: AssessmentCardProps) {
  const [showQuestions, setShowQuestions] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{assessmentDef.name}</CardTitle>
            <CardDescription className="mt-1">
              {assessmentDef.format.questionCount} questions
              {assessmentDef.format.pointsEach &&
                ` · ${assessmentDef.format.pointsEach} pts each`}
              {assessmentDef.format.totalPoints &&
                ` · ${assessmentDef.format.totalPoints} pts total`}
              {` · ${assessmentDef.format.timeMinutes} min`}
            </CardDescription>
          </div>
          <Badge variant={assessmentDef.type === "Exam" ? "default" : "secondary"}>
            {assessmentDef.type}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-2 text-sm italic leading-relaxed">
          {assessmentDef.format.instructions}
        </p>
      </CardHeader>

      {sourceQuestions.length > 0 && (
        <CardContent className="pt-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQuestions(!showQuestions)}
            className="mb-3 -ml-2"
          >
            <FileText className="mr-2 h-4 w-4" />
            {showQuestions ? "Hide" : "Show"} Source Questions (
            {sourceQuestions.length})
            {showQuestions ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-1 h-4 w-4" />
            )}
          </Button>

          {showQuestions && (
            <div className="space-y-3">
              {sourceQuestions.map((q, i) => (
                <div
                  key={q.questionId}
                  className="bg-muted/50 rounded-xl p-3 text-sm"
                >
                  <div className="text-muted-foreground mb-1 font-mono text-[10px] font-medium uppercase tracking-wider">
                    Q{i + 1}
                    {(() => {
                      const meta = q.generationMeta as Record<string, unknown> | undefined;
                      const type = meta?.coboQuestionType;
                      return type ? ` (${String(type)})` : null;
                    })()}
                  </div>
                  <p className="whitespace-pre-wrap">{q.prompt}</p>
                </div>
              ))}
            </div>
          )}

          {children && <div className="mt-4">{children}</div>}
        </CardContent>
      )}

      {sourceQuestions.length === 0 && children && (
        <CardContent className="pt-0">{children}</CardContent>
      )}
    </Card>
  );
}
