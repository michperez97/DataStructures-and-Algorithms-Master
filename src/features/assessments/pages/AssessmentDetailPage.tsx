import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormatProfileEditor } from "@/features/assessments/components/FormatProfileEditor";
import { RubricEditor } from "@/features/assessments/components/RubricEditor";
import { AssessmentDeleteDialog } from "@/features/assessments/components/AssessmentDeleteDialog";
import { useAssessment } from "@/features/assessments/hooks/use-assessment";
import { useFormatProfile } from "@/features/assessments/hooks/use-format-profile";
import { useRubric } from "@/features/assessments/hooks/use-rubric";
import { db } from "@/db";

export function AssessmentDetailPage() {
  const { courseId, assessmentId } = useParams();
  const navigate = useNavigate();
  const { assessment, isLoading } = useAssessment(assessmentId);
  const { profile } = useFormatProfile(assessmentId);
  const { rubric } = useRubric(assessmentId);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return <div className="text-muted-foreground p-4">Loading...</div>;
  }

  if (!assessment) {
    return (
      <div className="text-muted-foreground p-4">Assessment not found.</div>
    );
  }

  const handleDelete = async () => {
    await db.classAssessments.delete(assessment.assessmentId);
    // Clean up related data
    await db.assessmentFormatProfiles
      .where("assessmentId")
      .equals(assessment.assessmentId)
      .delete();
    await db.assessmentRubrics
      .where("assessmentId")
      .equals(assessment.assessmentId)
      .delete();
    toast.success("Assessment deleted");
    navigate(`/courses/${courseId}/assessments`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={assessment.name}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link
                to={`/courses/${courseId}/assessments/${assessment.assessmentId}/edit`}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="format">Format Profile</TabsTrigger>
          <TabsTrigger value="rubric">Rubric</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="flex flex-wrap gap-2">
            <Badge>{assessment.type}</Badge>
            {assessment.dateWindow?.open && (
              <Badge variant="outline">
                Opens: {assessment.dateWindow.open}
              </Badge>
            )}
            {assessment.dateWindow?.close && (
              <Badge variant="outline">
                Closes: {assessment.dateWindow.close}
              </Badge>
            )}
          </div>

          {assessment.coverage && assessment.coverage.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Coverage</h3>
              <div className="flex flex-wrap gap-2">
                {assessment.coverage.map((c, i) => (
                  <Badge key={i} variant="outline">
                    {c.topicTag}
                    {c.weight ? ` (${c.weight}%)` : ""}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="format" className="pt-4">
          <FormatProfileEditor
            assessmentId={assessment.assessmentId}
            profile={profile}
          />
        </TabsContent>

        <TabsContent value="rubric" className="pt-4">
          <RubricEditor
            assessmentId={assessment.assessmentId}
            rubric={rubric}
          />
        </TabsContent>
      </Tabs>

      <AssessmentDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        assessmentName={assessment.name}
        onConfirm={handleDelete}
      />
    </div>
  );
}
