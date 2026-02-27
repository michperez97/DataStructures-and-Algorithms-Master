import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { db } from "@/db";
import { PageHeader } from "@/components/shared/PageHeader";
import { CourseDocForm } from "@/features/course-docs/components/CourseDocForm";
import { useCourseDoc } from "@/features/course-docs/hooks/use-course-doc";
import { useCourseDocVersions } from "@/features/course-docs/hooks/use-course-doc-versions";
import type { CourseDocFormData } from "@/features/course-docs/schemas/course-doc-schema";
import { extractFromDocument } from "@/services/extraction";
import { useLiveQuery } from "dexie-react-hooks";

export function CourseDocEditPage() {
  const { courseId, docId } = useParams();
  const navigate = useNavigate();
  const { doc, isLoading } = useCourseDoc(docId);
  const { versions } = useCourseDocVersions(docId);

  const assessments = useLiveQuery(
    () =>
      courseId
        ? db.classAssessments.where("courseId").equals(courseId).toArray()
        : [],
    [courseId],
  );

  if (isLoading) {
    return <div className="text-muted-foreground p-4">Loading...</div>;
  }

  if (!doc) {
    return <div className="text-muted-foreground p-4">Document not found.</div>;
  }

  const handleSubmit = async (data: CourseDocFormData) => {
    const now = new Date().toISOString();
    const textChanged = data.rawText !== doc.rawText;

    // Snapshot current text as new version if text changed
    if (textChanged) {
      const nextVersionNo = (versions.length > 0 ? versions.length : 0) + 1;
      await db.courseDocVersions.add({
        versionId: crypto.randomUUID(),
        docId: doc.docId,
        versionNo: nextVersionNo,
        rawText: data.rawText,
        changeNote: "Edit update",
        createdAt: now,
      });
    }

    // Update the doc
    await db.courseDocs.update(doc.docId, {
      type: data.type,
      rawText: data.rawText,
      postedAt: data.postedAt,
      dueAt: data.dueAt,
      links: data.links
        ? data.links
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean)
        : [],
      mappedAssessmentId: data.mappedAssessmentId,
      updatedAt: now,
    });

    // Re-trigger extraction if text changed
    if (textChanged) {
      try {
        const result = await extractFromDocument(data.rawText);
        // Remove old parses and create new one
        await db.courseDocParses.where("docId").equals(doc.docId).delete();
        await db.courseDocParses.add({
          parseId: crypto.randomUUID(),
          docId: doc.docId,
          detectedTopics: result.topics,
          detectedTasks: result.tasks,
          detectedDueDates: result.dueDates,
          detectedCoverageStatements: result.coverageStatements,
          status: "Pending",
          createdAt: now,
          updatedAt: now,
        });
        toast.success("Document updated and re-extracted");
      } catch (err) {
        toast.error(
          `Document saved but re-extraction failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    } else {
      toast.success("Document updated");
    }

    navigate(`/courses/${courseId}/docs/${doc.docId}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Document"
        description={`Editing ${doc.type} document`}
      />
      <CourseDocForm
        initialData={doc}
        assessments={assessments ?? []}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </div>
  );
}
