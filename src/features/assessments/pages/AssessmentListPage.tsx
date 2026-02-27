import { useParams, Link } from "react-router";
import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { AssessmentCard } from "@/features/assessments/components/AssessmentCard";
import { useAssessments } from "@/features/assessments/hooks/use-assessments";

export function AssessmentListPage() {
  const { courseId } = useParams();
  const { assessments, isLoading } = useAssessments(courseId);

  if (isLoading) {
    return (
      <div className="text-muted-foreground p-4">Loading assessments...</div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessments"
        description="Class assessments and practice targets"
        action={
          <Button asChild>
            <Link to={`/courses/${courseId}/assessments/new`}>
              <Plus className="mr-2 h-4 w-4" />
              New Assessment
            </Link>
          </Button>
        }
      />

      {assessments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assessments yet"
          description="Define class assessments to generate targeted practice quizzes."
          actionLabel="New Assessment"
          actionHref={`/courses/${courseId}/assessments/new`}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assessment) => (
            <AssessmentCard
              key={assessment.assessmentId}
              assessment={assessment}
              courseId={courseId!}
            />
          ))}
        </div>
      )}
    </div>
  );
}
