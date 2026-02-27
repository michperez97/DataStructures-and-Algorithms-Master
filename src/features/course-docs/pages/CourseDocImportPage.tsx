import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { db } from "@/db";
import { PageHeader } from "@/components/shared/PageHeader";
import { CourseDocForm } from "@/features/course-docs/components/CourseDocForm";
import type { CourseDocFormData } from "@/features/course-docs/schemas/course-doc-schema";
import type { CourseStyleProfile } from "@/db/schema";
import { extractFromDocument } from "@/services/extraction";
import { inferStyle } from "@/services/style-inference";
import { useLiveQuery } from "dexie-react-hooks";

export function CourseDocImportPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const assessments = useLiveQuery(
    () =>
      courseId
        ? db.classAssessments.where("courseId").equals(courseId).toArray()
        : [],
    [courseId],
  );

  const handleSubmit = async (data: CourseDocFormData) => {
    const now = new Date().toISOString();
    const docId = crypto.randomUUID();

    // Save the document
    await db.courseDocs.add({
      docId,
      courseId: courseId!,
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
      createdAt: now,
      updatedAt: now,
    });

    // Create initial version
    await db.courseDocVersions.add({
      versionId: crypto.randomUUID(),
      docId,
      versionNo: 1,
      rawText: data.rawText,
      changeNote: "Initial import",
      createdAt: now,
    });

    // Trigger Gemini extraction (non-blocking for navigation)
    const parseId = crypto.randomUUID();
    try {
      const result = await extractFromDocument(data.rawText);
      await db.courseDocParses.add({
        parseId,
        docId,
        detectedTopics: result.topics,
        detectedTasks: result.tasks,
        detectedDueDates: result.dueDates,
        detectedCoverageStatements: result.coverageStatements,
        status: "Pending",
        createdAt: now,
        updatedAt: now,
      });
      toast.success("Document imported and parsed");
    } catch (err) {
      // Doc is still saved even if extraction fails
      toast.error(
        `Document saved but extraction failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }

    // Run style inference on existing profile
    try {
      const profile = await db.courseStyleProfiles
        .where("courseId")
        .equals(courseId!)
        .first();
      if (profile) {
        const inferred = inferStyle(data.rawText);
        const lockedFields = profile.lockedFields ?? [];
        const updates: Partial<CourseStyleProfile> = {};

        if (
          inferred.notationPreference &&
          !lockedFields.includes("notationPreference")
        ) {
          updates.notationPreference = inferred.notationPreference;
        }
        if (
          inferred.difficultyBaseline &&
          !lockedFields.includes("difficultyBaseline")
        ) {
          updates.difficultyBaseline = inferred.difficultyBaseline;
        }
        if (
          inferred.strictnessBaseline &&
          !lockedFields.includes("strictnessBaseline")
        ) {
          updates.strictnessBaseline = inferred.strictnessBaseline;
        }
        if (
          inferred.terminologyMap &&
          !lockedFields.includes("terminologyMap")
        ) {
          updates.terminologyMap = {
            ...profile.terminologyMap,
            ...inferred.terminologyMap,
          };
        }
        if (
          inferred.questionTypeWeights &&
          !lockedFields.includes("questionTypeWeights")
        ) {
          updates.questionTypeWeights = inferred.questionTypeWeights;
        }

        if (Object.keys(updates).length > 0) {
          updates.updatedAt = new Date().toISOString();
          await db.courseStyleProfiles.update(profile.profileId, updates);
        }
      }
    } catch {
      // Style inference is best-effort
    }

    navigate(`/courses/${courseId}/docs/${docId}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import Document"
        description="Paste course material to extract topics, tasks, and due dates"
      />
      <CourseDocForm
        onSubmit={handleSubmit}
        assessments={assessments ?? []}
      />
    </div>
  );
}
