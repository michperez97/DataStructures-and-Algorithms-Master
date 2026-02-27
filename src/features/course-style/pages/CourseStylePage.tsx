import { useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { StyleProfileForm } from "@/features/course-style/components/StyleProfileForm";
import { useStyleProfile } from "@/features/course-style/hooks/use-style-profile";
import { inferStyle } from "@/services/style-inference";
import { db } from "@/db";
import type { CourseStyleProfile } from "@/db/schema";

export function CourseStylePage() {
  const { courseId } = useParams();
  const { profile, isLoading } = useStyleProfile(courseId);
  const [inferring, setInferring] = useState(false);

  if (isLoading) {
    return <div className="text-muted-foreground p-4">Loading...</div>;
  }

  const handleCreateProfile = async () => {
    const now = new Date().toISOString();
    await db.courseStyleProfiles.add({
      profileId: crypto.randomUUID(),
      courseId: courseId!,
      terminologyMap: {},
      notationPreference: "BigO",
      questionTypeWeights: { MCQ: 40, ShortAnswer: 30, Trace: 20, BigO: 10 },
      difficultyBaseline: 3,
      strictnessBaseline: "Standard",
      lockedFields: [],
      inferenceSource: [],
      createdAt: now,
      updatedAt: now,
    });
    toast.success("Style profile created");
  };

  const handleReInfer = async () => {
    if (!profile) return;
    setInferring(true);

    try {
      // Fetch all course docs
      const docs = await db.courseDocs
        .where("courseId")
        .equals(courseId!)
        .toArray();

      if (docs.length === 0) {
        toast.info("No documents to infer from");
        setInferring(false);
        return;
      }

      // Combine all doc text and infer
      const combinedText = docs.map((d) => d.rawText).join("\n\n");
      const inferred = inferStyle(combinedText);
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
        updates.inferenceSource = docs.map((d) => d.docId);
        await db.courseStyleProfiles.update(profile.profileId, updates);
        toast.success("Style profile updated from documents");
      } else {
        toast.info("All fields are locked — no changes made");
      }
    } catch {
      toast.error("Failed to re-infer style");
    } finally {
      setInferring(false);
    }
  };

  if (!profile) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Course Style"
          description="Configure how content matches your course's conventions"
        />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h3 className="text-lg font-semibold">No style profile yet</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            Create a style profile to configure terminology, notation, and
            difficulty preferences for this course.
          </p>
          <Button className="mt-4" onClick={handleCreateProfile}>
            Create Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Style"
        description="Configure how content matches your course's conventions"
        action={
          <Button
            variant="outline"
            onClick={handleReInfer}
            disabled={inferring}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${inferring ? "animate-spin" : ""}`}
            />
            {inferring ? "Inferring..." : "Re-infer from Documents"}
          </Button>
        }
      />
      <StyleProfileForm profile={profile} />
    </div>
  );
}
