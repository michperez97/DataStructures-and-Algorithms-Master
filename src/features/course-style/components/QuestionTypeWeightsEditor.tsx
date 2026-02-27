import { Plus, X } from "lucide-react";
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

const QUESTION_TYPES = ["MCQ", "ShortAnswer", "Trace", "BigO"];

interface QuestionTypeWeightsEditorProps {
  weights: Record<string, number>;
  onChange: (weights: Record<string, number>) => void;
  disabled?: boolean;
}

export function QuestionTypeWeightsEditor({
  weights,
  onChange,
  disabled = false,
}: QuestionTypeWeightsEditorProps) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  const addEntry = () => {
    const unused = QUESTION_TYPES.find((t) => !(t in weights));
    if (unused) {
      onChange({ ...weights, [unused]: 0 });
    }
  };

  const removeEntry = (key: string) => {
    const updated = { ...weights };
    delete updated[key];
    onChange(updated);
  };

  const updateEntry = (oldKey: string, newKey: string, value: number) => {
    const updated = { ...weights };
    if (oldKey !== newKey) {
      delete updated[oldKey];
    }
    updated[newKey] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <Label>
        Question Type Weights{" "}
        <span
          className={
            total === 100 ? "text-green-600" : "text-destructive"
          }
        >
          (Total: {total}%)
        </span>
      </Label>
      {entries.map(([type, value], i) => (
        <div key={i} className="flex items-center gap-2">
          <Select
            value={type}
            onValueChange={(v) => updateEntry(type, v, value)}
            disabled={disabled}
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
            value={value}
            onChange={(e) =>
              updateEntry(type, type, Number(e.target.value) || 0)
            }
            className="w-24"
            min={0}
            max={100}
            disabled={disabled}
          />
          <span className="text-sm text-muted-foreground">%</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeEntry(type)}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {entries.length < QUESTION_TYPES.length && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addEntry}
          disabled={disabled}
        >
          <Plus className="mr-1 h-3 w-3" />
          Add Type
        </Button>
      )}
    </div>
  );
}
