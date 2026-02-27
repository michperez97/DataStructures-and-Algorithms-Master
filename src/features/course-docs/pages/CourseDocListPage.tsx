import { useParams, Link } from "react-router";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { CourseDocCard } from "@/features/course-docs/components/CourseDocCard";
import { useCourseDocs } from "@/features/course-docs/hooks/use-course-docs";

export function CourseDocListPage() {
  const { courseId } = useParams();
  const { docs, isLoading } = useCourseDocs(courseId);

  if (isLoading) {
    return <div className="text-muted-foreground p-4">Loading documents...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Imported course materials"
        action={
          <Button asChild>
            <Link to={`/courses/${courseId}/docs/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Import Document
            </Link>
          </Button>
        }
      />

      {docs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Import course documents to extract topics, tasks, and due dates for practice generation."
          actionLabel="Import Document"
          actionHref={`/courses/${courseId}/docs/new`}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => (
            <CourseDocCard key={doc.docId} doc={doc} courseId={courseId!} />
          ))}
        </div>
      )}
    </div>
  );
}
