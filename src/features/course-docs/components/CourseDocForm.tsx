import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  courseDocSchema,
  type CourseDocFormData,
} from "@/features/course-docs/schemas/course-doc-schema";
import type { CourseDoc, ClassAssessment } from "@/db/schema";

interface CourseDocFormProps {
  initialData?: CourseDoc;
  assessments?: ClassAssessment[];
  onSubmit: (data: CourseDocFormData) => void | Promise<void>;
  submitLabel?: string;
}

export function CourseDocForm({
  initialData,
  assessments = [],
  onSubmit,
  submitLabel = "Import Document",
}: CourseDocFormProps) {
  const [type, setType] = useState<string>(initialData?.type ?? "Notes");
  const [rawText, setRawText] = useState(initialData?.rawText ?? "");
  const [postedAt, setPostedAt] = useState(initialData?.postedAt ?? "");
  const [dueAt, setDueAt] = useState(initialData?.dueAt ?? "");
  const [links, setLinks] = useState(initialData?.links?.join(", ") ?? "");
  const [mappedAssessmentId, setMappedAssessmentId] = useState(
    initialData?.mappedAssessmentId ?? "",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = courseDocSchema.safeParse({
      type,
      rawText,
      postedAt: postedAt || undefined,
      dueAt: dueAt || undefined,
      links: links || undefined,
      mappedAssessmentId: mappedAssessmentId || undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field) fieldErrors[String(field)] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(result.data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="type">Document Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Announcement">Announcement</SelectItem>
            <SelectItem value="QuizInfo">Quiz Info</SelectItem>
            <SelectItem value="StudyGuide">Study Guide</SelectItem>
            <SelectItem value="Notes">Notes</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="rawText">Document Text</Label>
        <Textarea
          id="rawText"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste the full document text here..."
          rows={12}
        />
        {errors.rawText && (
          <p className="text-sm text-destructive">{errors.rawText}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="postedAt">Posted Date</Label>
          <Input
            id="postedAt"
            type="date"
            value={postedAt}
            onChange={(e) => setPostedAt(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueAt">Due Date</Label>
          <Input
            id="dueAt"
            type="date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="links">Links (comma-separated)</Label>
        <Input
          id="links"
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          placeholder="e.g., https://example.com/slides, https://example.com/notes"
        />
      </div>

      {type === "QuizInfo" && assessments.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="mappedAssessmentId">Mapped Assessment</Label>
          <Select
            value={mappedAssessmentId}
            onValueChange={setMappedAssessmentId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select assessment..." />
            </SelectTrigger>
            <SelectContent>
              {assessments.map((a) => (
                <SelectItem key={a.assessmentId} value={a.assessmentId}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
