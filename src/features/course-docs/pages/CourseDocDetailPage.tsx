import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { Pencil, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfidenceBadge } from "@/features/course-docs/components/ConfidenceBadge";
import { ParseReviewPanel } from "@/features/course-docs/components/ParseReviewPanel";
import { CourseDocDeleteDialog } from "@/features/course-docs/components/CourseDocDeleteDialog";
import { useCourseDoc } from "@/features/course-docs/hooks/use-course-doc";
import { useCourseDocParse } from "@/features/course-docs/hooks/use-course-doc-parse";
import { useCourseDocVersions } from "@/features/course-docs/hooks/use-course-doc-versions";
import { extractFromDocument } from "@/services/extraction";
import { db } from "@/db";

export function CourseDocDetailPage() {
  const { courseId, docId } = useParams();
  const navigate = useNavigate();
  const { doc, isLoading: docLoading } = useCourseDoc(docId);
  const { parse, isLoading: parseLoading } = useCourseDocParse(docId);
  const { versions } = useCourseDocVersions(docId);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [extracting, setExtracting] = useState(false);

  if (docLoading || parseLoading) {
    return <div className="text-muted-foreground p-4">Loading...</div>;
  }

  if (!doc) {
    return <div className="text-muted-foreground p-4">Document not found.</div>;
  }

  const handleDelete = async () => {
    await db.courseDocs.delete(doc.docId);
    // Clean up related data
    await db.courseDocVersions.where("docId").equals(doc.docId).delete();
    await db.courseDocParses.where("docId").equals(doc.docId).delete();
    toast.success("Document deleted");
    navigate(`/courses/${courseId}/docs`);
  };

  const handleExtractNow = async () => {
    setExtracting(true);
    try {
      const result = await extractFromDocument(doc.rawText);
      const now = new Date().toISOString();
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
      toast.success("Extraction complete");
    } catch (err) {
      toast.error(
        `Extraction failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${doc.type} Document`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/courses/${courseId}/docs/${doc.docId}/edit`}>
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

      <div className="flex flex-wrap gap-2">
        <Badge>{doc.type}</Badge>
        {doc.postedAt && <Badge variant="outline">Posted: {doc.postedAt}</Badge>}
        {doc.dueAt && <Badge variant="outline">Due: {doc.dueAt}</Badge>}
        {versions.length > 0 && (
          <Badge variant="secondary">
            {versions.length} version{versions.length !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {!parse && (
        <Card>
          <CardContent className="py-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                No extraction data yet. Extract topics, tasks, and dates from
                this document.
              </p>
              <Button onClick={handleExtractNow} disabled={extracting}>
                <Sparkles className="mr-2 h-4 w-4" />
                {extracting ? "Extracting..." : "Extract Now"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {parse && parse.status === "Pending" && (
        <ParseReviewPanel parse={parse} rawText={doc.rawText} />
      )}

      {parse && parse.status === "Accepted" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Extracted Topics ({parse.detectedTopics.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {parse.detectedTopics.map((t, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <Badge variant="outline">{t.label}</Badge>
                    <ConfidenceBadge confidence={t.confidence} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Tasks ({parse.detectedTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {parse.detectedTasks.map((t, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <span className="text-sm flex-1">{t.description}</span>
                  <ConfidenceBadge confidence={t.confidence} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Due Dates ({parse.detectedDueDates.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {parse.detectedDueDates.map((d, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <span className="text-sm flex-1">
                    {d.label} — {d.date}
                  </span>
                  <ConfidenceBadge confidence={d.confidence} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <CourseDocDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
}
