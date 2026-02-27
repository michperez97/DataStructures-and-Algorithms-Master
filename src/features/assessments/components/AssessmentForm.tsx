import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  assessmentSchema,
  type AssessmentFormData,
} from "@/features/assessments/schemas/assessment-schema";
import { CoverageTagEditor } from "./CoverageTagEditor";
import type { ClassAssessment } from "@/db/schema";

interface CoverageTag {
  topicTag: string;
  weight?: number;
}

interface AssessmentFormProps {
  initialData?: ClassAssessment;
  onSubmit: (
    data: AssessmentFormData,
    coverage: CoverageTag[],
  ) => void | Promise<void>;
  submitLabel?: string;
}

export function AssessmentForm({
  initialData,
  onSubmit,
  submitLabel = "Create Assessment",
}: AssessmentFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [type, setType] = useState<string>(initialData?.type ?? "Quiz");
  const [dateWindowOpen, setDateWindowOpen] = useState(
    initialData?.dateWindow?.open ?? "",
  );
  const [dateWindowClose, setDateWindowClose] = useState(
    initialData?.dateWindow?.close ?? "",
  );
  const [coverage, setCoverage] = useState<CoverageTag[]>(
    initialData?.coverage ?? [],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const coverageTags = coverage
      .filter((c) => c.topicTag)
      .map((c) => (c.weight ? `${c.topicTag}:${c.weight}` : c.topicTag))
      .join(", ");

    const result = assessmentSchema.safeParse({
      name,
      type,
      dateWindowOpen: dateWindowOpen || undefined,
      dateWindowClose: dateWindowClose || undefined,
      coverageTags: coverageTags || undefined,
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
      await onSubmit(result.data, coverage.filter((c) => c.topicTag));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="name">Assessment Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Quiz 3 - Trees and Graphs"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Quiz">Quiz</SelectItem>
            <SelectItem value="Exam">Exam</SelectItem>
            <SelectItem value="Lab">Lab</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dateWindowOpen">Window Open</Label>
          <Input
            id="dateWindowOpen"
            type="date"
            value={dateWindowOpen}
            onChange={(e) => setDateWindowOpen(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateWindowClose">Window Close</Label>
          <Input
            id="dateWindowClose"
            type="date"
            value={dateWindowClose}
            onChange={(e) => setDateWindowClose(e.target.value)}
          />
        </div>
      </div>

      <CoverageTagEditor tags={coverage} onChange={setCoverage} />

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
