import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/db";
import type { AssessmentRubric } from "@/db/schema";

interface RubricEditorProps {
  assessmentId: string;
  rubric: AssessmentRubric | null;
}

export function RubricEditor({ assessmentId, rubric }: RubricEditorProps) {
  const [strictness, setStrictness] = useState<string>(
    rubric?.strictness ?? "Standard",
  );
  const [scoringNotes, setScoringNotes] = useState(
    rubric?.scoringNotes ?? "",
  );
  const [partialCreditRules, setPartialCreditRules] = useState(
    rubric?.partialCreditRules
      ? JSON.stringify(rubric.partialCreditRules, null, 2)
      : "",
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        assessmentId,
        strictness: strictness as "Lenient" | "Standard" | "Strict",
        scoringNotes: scoringNotes || undefined,
        partialCreditRules: partialCreditRules
          ? JSON.parse(partialCreditRules)
          : undefined,
      };

      if (rubric) {
        await db.assessmentRubrics.update(rubric.rubricId, data);
      } else {
        await db.assessmentRubrics.add({
          rubricId: crypto.randomUUID(),
          ...data,
        });
      }
      toast.success("Rubric saved");
    } catch {
      toast.error("Failed to save rubric");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <Label>Strictness</Label>
        <Select value={strictness} onValueChange={setStrictness}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Lenient">Lenient</SelectItem>
            <SelectItem value="Standard">Standard</SelectItem>
            <SelectItem value="Strict">Strict</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Scoring Notes</Label>
        <Textarea
          value={scoringNotes}
          onChange={(e) => setScoringNotes(e.target.value)}
          placeholder="How are answers scored? e.g., 2 points per correct answer..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Partial Credit Rules (JSON)</Label>
        <Textarea
          value={partialCreditRules}
          onChange={(e) => setPartialCreditRules(e.target.value)}
          placeholder='e.g., {"showWork": "+1 point", "partialAnswer": "50% credit"}'
          rows={4}
          className="font-mono text-sm"
        />
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Rubric"}
      </Button>
    </div>
  );
}
