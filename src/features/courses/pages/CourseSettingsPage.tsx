import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { db } from "@/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/PageHeader";
import { CourseForm } from "@/features/courses/components/CourseForm";
import { CourseDeleteDialog } from "@/features/courses/components/CourseDeleteDialog";
import { useCourse } from "@/features/courses/hooks/use-course";
import type { CourseFormData } from "@/features/courses/schemas/course-schema";

export function CourseSettingsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { course, isLoading } = useCourse(courseId);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return <div className="text-muted-foreground p-4">Loading...</div>;
  }

  if (!course) {
    return <div className="text-muted-foreground p-4">Course not found.</div>;
  }

  const handleUpdate = async (data: CourseFormData) => {
    await db.courses.update(course.courseId, {
      name: data.name,
      type: data.type,
      description: data.description,
      topicTags: data.topicTags
        ? data.topicTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      difficultyDefault: data.difficultyDefault,
      updatedAt: new Date().toISOString(),
    });

    toast.success("Course updated");
  };

  const handleDelete = async () => {
    await db.courses.delete(course.courseId);
    toast.success("Course deleted");
    navigate("/courses");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Course Settings" description={course.name} />

      <CourseForm
        initialData={course}
        onSubmit={handleUpdate}
        submitLabel="Save Changes"
      />

      <Separator />

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 text-sm">
            Deleting this course will permanently remove all associated data
            including documents, assessments, and practice history.
          </p>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            Delete Course
          </Button>
        </CardContent>
      </Card>

      <CourseDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        courseName={course.name}
        onConfirm={handleDelete}
      />
    </div>
  );
}
