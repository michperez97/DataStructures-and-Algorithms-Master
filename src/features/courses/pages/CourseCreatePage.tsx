import { useNavigate } from "react-router";
import { toast } from "sonner";
import { db } from "@/db";
import { PageHeader } from "@/components/shared/PageHeader";
import { CourseForm } from "@/features/courses/components/CourseForm";
import type { CourseFormData } from "@/features/courses/schemas/course-schema";

export function CourseCreatePage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: CourseFormData) => {
    const now = new Date().toISOString();
    const courseId = crypto.randomUUID();

    await db.courses.add({
      courseId,
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
      privacyMode: "LocalOnly",
      createdAt: now,
      updatedAt: now,
    });

    toast.success("Course created");
    navigate(`/courses/${courseId}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="New Course" description="Create a new learning course" />
      <CourseForm onSubmit={handleSubmit} />
    </div>
  );
}
