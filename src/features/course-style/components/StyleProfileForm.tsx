import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TerminologyMapEditor } from "./TerminologyMapEditor";
import { QuestionTypeWeightsEditor } from "./QuestionTypeWeightsEditor";
import { db } from "@/db";
import type { CourseStyleProfile } from "@/db/schema";

interface StyleProfileFormProps {
  profile: CourseStyleProfile;
}

export function StyleProfileForm({ profile }: StyleProfileFormProps) {
  const [notation, setNotation] = useState(profile.notationPreference);
  const [difficulty, setDifficulty] = useState(profile.difficultyBaseline);
  const [strictness, setStrictness] = useState(profile.strictnessBaseline);
  const [terminologyMap, setTerminologyMap] = useState(profile.terminologyMap);
  const [questionTypeWeights, setQuestionTypeWeights] = useState(
    profile.questionTypeWeights,
  );
  const [lockedFields, setLockedFields] = useState<string[]>(
    profile.lockedFields ?? [],
  );
  const [saving, setSaving] = useState(false);

  const isLocked = (field: string) => lockedFields.includes(field);

  const toggleLock = (field: string) => {
    setLockedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await db.courseStyleProfiles.update(profile.profileId, {
        notationPreference: notation,
        difficultyBaseline: difficulty,
        strictnessBaseline: strictness,
        terminologyMap,
        questionTypeWeights,
        lockedFields,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Style profile saved");
    } catch {
      toast.error("Failed to save style profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-lg">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Notation Preference</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Lock</span>
            <Switch
              checked={isLocked("notationPreference")}
              onCheckedChange={() => toggleLock("notationPreference")}
            />
          </div>
        </div>
        <Select
          value={notation}
          onValueChange={(v) => setNotation(v as typeof notation)}
          disabled={isLocked("notationPreference")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BigO">Big-O</SelectItem>
            <SelectItem value="BigTheta">Big-Theta</SelectItem>
            <SelectItem value="Mixed">Mixed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Difficulty Baseline (1–5)</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Lock</span>
            <Switch
              checked={isLocked("difficultyBaseline")}
              onCheckedChange={() => toggleLock("difficultyBaseline")}
            />
          </div>
        </div>
        <Input
          type="number"
          value={difficulty}
          onChange={(e) => setDifficulty(Number(e.target.value) || 1)}
          min={1}
          max={5}
          disabled={isLocked("difficultyBaseline")}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Strictness Baseline</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Lock</span>
            <Switch
              checked={isLocked("strictnessBaseline")}
              onCheckedChange={() => toggleLock("strictnessBaseline")}
            />
          </div>
        </div>
        <Select
          value={strictness}
          onValueChange={(v) => setStrictness(v as typeof strictness)}
          disabled={isLocked("strictnessBaseline")}
        >
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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Terminology Map</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Lock</span>
            <Switch
              checked={isLocked("terminologyMap")}
              onCheckedChange={() => toggleLock("terminologyMap")}
            />
          </div>
        </div>
        <TerminologyMapEditor
          map={terminologyMap}
          onChange={setTerminologyMap}
          disabled={isLocked("terminologyMap")}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Question Type Weights</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Lock</span>
            <Switch
              checked={isLocked("questionTypeWeights")}
              onCheckedChange={() => toggleLock("questionTypeWeights")}
            />
          </div>
        </div>
        <QuestionTypeWeightsEditor
          weights={questionTypeWeights}
          onChange={setQuestionTypeWeights}
          disabled={isLocked("questionTypeWeights")}
        />
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Style Profile"}
      </Button>
    </div>
  );
}
