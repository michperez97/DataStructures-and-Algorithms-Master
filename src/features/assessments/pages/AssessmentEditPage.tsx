import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { db } from "@/db";
import { PageHeader } from "@/components/shared/PageHeader";
import { AssessmentForm } from "@/features/assessments/components/AssessmentForm";
import { useAssessment } from "@/features/assessments/hooks/use-assessment";
import type { AssessmentFormData } from "@/features/assessments/schemas/assessment-schema";

export function AssessmentEditPage() {
  const { courseId, assessmentId } = useParams();
  const navigate = useNavigate();
  const { assessment, isLoading } = useAssessment(assessmentId);

  if (isLoading) {
    return <div className="text-muted-foreground p-4">Loading...</div>;
  }

  if (!assessment) {
    return (
      <div className="text-muted-foreground p-4">Assessment not found.</div>
    );
  }

  const handleSubmit = async (
    data: AssessmentFormData,
    coverage: Array<{ topicTag: string; weight?: number }>,
  ) => {
    await db.classAssessments.update(assessment.assessmentId, {
      name: data.name,
      type: data.type,
      dateWindow:
        data.dateWindowOpen || data.dateWindowClose
          ? { open: data.dateWindowOpen, close: data.dateWindowClose }
          : undefined,
      coverage: coverage.length > 0 ? coverage : undefined,
      updatedAt: new Date().toISOString(),
    });

    toast.success("Assessment updated");
    navigate(`/courses/${courseId}/assessments/${assessment.assessmentId}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Assessment"
        description={assessment.name}
      />
      <AssessmentForm
        initialData={assessment}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </div>
  );
}
