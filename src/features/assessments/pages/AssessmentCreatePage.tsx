import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { db } from "@/db";
import { PageHeader } from "@/components/shared/PageHeader";
import { AssessmentForm } from "@/features/assessments/components/AssessmentForm";
import type { AssessmentFormData } from "@/features/assessments/schemas/assessment-schema";

export function AssessmentCreatePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (
    data: AssessmentFormData,
    coverage: Array<{ topicTag: string; weight?: number }>,
  ) => {
    const now = new Date().toISOString();
    const assessmentId = crypto.randomUUID();

    await db.classAssessments.add({
      assessmentId,
      courseId: courseId!,
      name: data.name,
      type: data.type,
      dateWindow:
        data.dateWindowOpen || data.dateWindowClose
          ? { open: data.dateWindowOpen, close: data.dateWindowClose }
          : undefined,
      coverage: coverage.length > 0 ? coverage : undefined,
      createdAt: now,
      updatedAt: now,
    });

    toast.success("Assessment created");
    navigate(`/courses/${courseId}/assessments/${assessmentId}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Assessment"
        description="Define a class assessment for targeted practice"
      />
      <AssessmentForm onSubmit={handleSubmit} />
    </div>
  );
}
