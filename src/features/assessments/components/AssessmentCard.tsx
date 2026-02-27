import { Link } from "react-router";
import { ClipboardList } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ClassAssessment } from "@/db/schema";

interface AssessmentCardProps {
  assessment: ClassAssessment;
  courseId: string;
}

export function AssessmentCard({ assessment, courseId }: AssessmentCardProps) {
  return (
    <Link to={`/courses/${courseId}/assessments/${assessment.assessmentId}`}>
      <Card className="transition-colors hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="bg-primary/10 rounded-md p-2">
              <ClipboardList className="text-primary h-5 w-5" />
            </div>
            <Badge variant="secondary">{assessment.type}</Badge>
          </div>
          <CardTitle className="mt-3 text-lg">{assessment.name}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {assessment.dateWindow && (
              <div className="text-xs text-muted-foreground">
                {assessment.dateWindow.open && (
                  <span>Opens: {assessment.dateWindow.open}</span>
                )}
                {assessment.dateWindow.open && assessment.dateWindow.close && (
                  <span> — </span>
                )}
                {assessment.dateWindow.close && (
                  <span>Closes: {assessment.dateWindow.close}</span>
                )}
              </div>
            )}
            {assessment.coverage && assessment.coverage.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {assessment.coverage.slice(0, 4).map((c, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {c.topicTag}
                    {c.weight ? ` (${c.weight}%)` : ""}
                  </Badge>
                ))}
                {assessment.coverage.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{assessment.coverage.length - 4}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
