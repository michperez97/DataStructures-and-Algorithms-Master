import { useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
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
import { db } from "@/db";
import type { AssessmentFormatProfile } from "@/db/schema";

const QUESTION_TYPES = ["MCQ", "ShortAnswer", "Trace", "BigO"];

interface FormatProfileEditorProps {
  assessmentId: string;
  profile: AssessmentFormatProfile | null;
}

export function FormatProfileEditor({
  assessmentId,
  profile,
}: FormatProfileEditorProps) {
  const [questionCount, setQuestionCount] = useState(
    profile?.typicalQuestionCount ?? 20,
  );
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(
    profile?.timeLimitSeconds ? Math.round(profile.timeLimitSeconds / 60) : 0,
  );
  const [notes, setNotes] = useState(profile?.notes ?? "");
  const [mixRows, setMixRows] = useState<Array<{ type: string; pct: number }>>(
    () => {
      if (profile?.questionTypeMix) {
        return Object.entries(profile.questionTypeMix).map(([type, pct]) => ({
          type,
          pct,
        }));
      }
      return [{ type: "MCQ", pct: 100 }];
    },
  );
  const [saving, setSaving] = useState(false);

  const totalPct = mixRows.reduce((sum, r) => sum + r.pct, 0);

  const addRow = () => {
    const unused = QUESTION_TYPES.find(
      (t) => !mixRows.some((r) => r.type === t),
    );
    if (unused) {
      setMixRows([...mixRows, { type: unused, pct: 0 }]);
    }
  };

  const removeRow = (index: number) => {
    setMixRows(mixRows.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: "type" | "pct", value: string) => {
    const updated = [...mixRows];
    if (field === "pct") {
      updated[index] = { ...updated[index], pct: Number(value) || 0 };
    } else {
      updated[index] = { ...updated[index], type: value };
    }
    setMixRows(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const questionTypeMix: Record<string, number> = {};
      for (const row of mixRows) {
        if (row.type) questionTypeMix[row.type] = row.pct;
      }

      const data = {
        assessmentId,
        typicalQuestionCount: questionCount,
        timeLimitSeconds: timeLimitMinutes > 0 ? timeLimitMinutes * 60 : undefined,
        questionTypeMix,
        notes: notes || undefined,
      };

      if (profile) {
        await db.assessmentFormatProfiles.update(profile.formatProfileId, data);
      } else {
        await db.assessmentFormatProfiles.add({
          formatProfileId: crypto.randomUUID(),
          ...data,
        });
      }
      toast.success("Format profile saved");
    } catch {
      toast.error("Failed to save format profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <Label>Typical Question Count</Label>
        <Input
          type="number"
          value={questionCount}
          onChange={(e) => setQuestionCount(Number(e.target.value) || 0)}
          min={1}
          max={200}
        />
      </div>

      <div className="space-y-2">
        <Label>Time Limit (minutes, 0 = no limit)</Label>
        <Input
          type="number"
          value={timeLimitMinutes}
          onChange={(e) => setTimeLimitMinutes(Number(e.target.value) || 0)}
          min={0}
        />
      </div>

      <div className="space-y-3">
        <Label>
          Question Type Mix{" "}
          <span
            className={
              totalPct === 100
                ? "text-green-600"
                : "text-destructive"
            }
          >
            (Total: {totalPct}%)
          </span>
        </Label>
        {mixRows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <Select
              value={row.type}
              onValueChange={(v) => updateRow(i, "type", v)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={row.pct}
              onChange={(e) => updateRow(i, "pct", e.target.value)}
              className="w-24"
              min={0}
              max={100}
            />
            <span className="text-sm text-muted-foreground">%</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeRow(i)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {mixRows.length < QUESTION_TYPES.length && (
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="mr-1 h-3 w-3" />
            Add Type
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes about the format..."
          rows={3}
        />
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Format Profile"}
      </Button>
    </div>
  );
}
