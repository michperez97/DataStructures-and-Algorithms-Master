import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Megaphone } from "lucide-react";
import { db } from "@/db";
import { COT4400_COURSE_ID } from "../data/cot4400-course";
import { extractFromDocument } from "@/services/extraction";
import type { CourseDoc } from "@/db/schema";

interface WeekUploadSectionProps {
  weekNumber: number;
  moduleId: string;
  assessmentRefs: string[];
}

type UploadMode = "idle" | "announcement" | "quiz";

function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

export function WeekUploadSection({
  weekNumber,
  moduleId,
  assessmentRefs,
}: WeekUploadSectionProps) {
  const [mode, setMode] = useState<UploadMode>("idle");
  const [rawText, setRawText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await readTextFile(file);
      setRawText(text);
      toast.success(`Loaded text from ${file.name}`);
    } catch (err) {
      toast.error(
        `Failed to read file: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const handleSubmitAnnouncement = async () => {
    if (!rawText.trim()) {
      toast.error("Please enter or upload text first");
      return;
    }

    setIsSubmitting(true);
    const now = new Date().toISOString();
    const docId = crypto.randomUUID();

    try {
      // 1. Save CourseDoc (link to module via mappedAssessmentId)
      await db.courseDocs.add({
        docId,
        courseId: COT4400_COURSE_ID,
        type: "Announcement",
        rawText,
        mappedAssessmentId: moduleId,
        createdAt: now,
        updatedAt: now,
      } satisfies CourseDoc);

      // 2. Save CourseDocVersion (v1)
      await db.courseDocVersions.add({
        versionId: crypto.randomUUID(),
        docId,
        versionNo: 1,
        rawText,
        changeNote: `Week ${weekNumber} announcement`,
        createdAt: now,
      });

      // 3. Extract topics via AI
      let detectedTopicLabels: string[] = [];
      try {
        const result = await extractFromDocument(rawText);

        // 4. Save CourseDocParse
        await db.courseDocParses.add({
          parseId: crypto.randomUUID(),
          docId,
          detectedTopics: result.topics,
          detectedTasks: result.tasks,
          detectedDueDates: result.dueDates,
          detectedCoverageStatements: result.coverageStatements,
          status: "Pending",
          createdAt: now,
          updatedAt: now,
        });

        detectedTopicLabels = result.topics.map((t) => t.label);
      } catch (err) {
        toast.error(
          `Extraction failed (doc still saved): ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }

      // 5. Update Module record with description + topicTags
      await db.modules.update(moduleId, {
        description: rawText.slice(0, 500),
        topicTags:
          detectedTopicLabels.length > 0 ? detectedTopicLabels : undefined,
      });

      toast.success("Announcement uploaded — week updated");
      setRawText("");
      setMode("idle");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      toast.error(
        `Failed to save announcement: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!rawText.trim()) {
      toast.error("Please enter or upload quiz text first");
      return;
    }

    setIsSubmitting(true);
    const now = new Date().toISOString();
    const docId = crypto.randomUUID();
    const mappedAssessmentId = assessmentRefs[0] ?? undefined;

    try {
      // 1. Save CourseDoc
      await db.courseDocs.add({
        docId,
        courseId: COT4400_COURSE_ID,
        type: "QuizInfo",
        rawText,
        mappedAssessmentId,
        createdAt: now,
        updatedAt: now,
      } satisfies CourseDoc);

      // 2. Save CourseDocVersion (v1)
      await db.courseDocVersions.add({
        versionId: crypto.randomUUID(),
        docId,
        versionNo: 1,
        rawText,
        changeNote: `Week ${weekNumber} quiz info`,
        createdAt: now,
      });

      // 3. Extract via AI
      try {
        const result = await extractFromDocument(rawText);

        // 4. Save CourseDocParse
        await db.courseDocParses.add({
          parseId: crypto.randomUUID(),
          docId,
          detectedTopics: result.topics,
          detectedTasks: result.tasks,
          detectedDueDates: result.dueDates,
          detectedCoverageStatements: result.coverageStatements,
          status: "Pending",
          createdAt: now,
          updatedAt: now,
        });
      } catch (err) {
        toast.error(
          `Extraction failed (doc still saved): ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }

      toast.success("Quiz content uploaded");
      setRawText("");
      setMode("idle");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      toast.error(
        `Failed to save quiz: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === "idle") {
    return (
      <div className="space-y-3">
        <h3 className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Upload Content
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode("announcement")}
          >
            <Megaphone className="mr-2 h-4 w-4" />
            Upload Announcement
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode("quiz")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Upload Quiz
          </Button>
        </div>
      </div>
    );
  }

  const isAnnouncement = mode === "announcement";

  return (
    <div className="space-y-4 rounded-xl border border-stone-200/60 p-4 dark:border-white/[0.06]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          {isAnnouncement ? "Upload Announcement" : "Upload Quiz"}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setMode("idle");
            setRawText("");
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        >
          Cancel
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="week-upload-text">
          {isAnnouncement
            ? "Paste announcement text"
            : "Paste quiz content"}
        </Label>
        <Textarea
          id="week-upload-text"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={
            isAnnouncement
              ? "Paste the professor's weekly announcement here..."
              : "Paste quiz questions or info here..."
          }
          rows={8}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="week-upload-file">Or upload a file</Label>
        <Input
          id="week-upload-file"
          ref={fileInputRef}
          type="file"
          accept=".txt,.md"
          onChange={handleFileChange}
        />
      </div>

      <Button
        onClick={isAnnouncement ? handleSubmitAnnouncement : handleSubmitQuiz}
        disabled={isSubmitting || !rawText.trim()}
      >
        <Upload className="mr-2 h-4 w-4" />
        {isSubmitting
          ? "Processing..."
          : isAnnouncement
            ? "Save Announcement"
            : "Save Quiz"}
      </Button>
    </div>
  );
}
