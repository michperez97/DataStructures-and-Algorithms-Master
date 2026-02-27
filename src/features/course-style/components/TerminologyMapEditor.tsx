import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TerminologyMapEditorProps {
  map: Record<string, string>;
  onChange: (map: Record<string, string>) => void;
  disabled?: boolean;
}

export function TerminologyMapEditor({
  map,
  onChange,
  disabled = false,
}: TerminologyMapEditorProps) {
  const entries = Object.entries(map);

  const addEntry = () => {
    onChange({ ...map, "": "" });
  };

  const removeEntry = (key: string) => {
    const updated = { ...map };
    delete updated[key];
    onChange(updated);
  };

  const updateEntry = (
    oldKey: string,
    newKey: string,
    newValue: string,
  ) => {
    const updated = { ...map };
    if (oldKey !== newKey) {
      delete updated[oldKey];
    }
    updated[newKey] = newValue;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <Label>Terminology Map</Label>
      {entries.map(([key, value], i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            placeholder="Concept"
            value={key}
            onChange={(e) => updateEntry(key, e.target.value, value)}
            className="flex-1"
            disabled={disabled}
          />
          <span className="text-muted-foreground">=</span>
          <Input
            placeholder="Preferred term"
            value={value}
            onChange={(e) => updateEntry(key, key, e.target.value)}
            className="flex-1"
            disabled={disabled}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeEntry(key)}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addEntry}
        disabled={disabled}
      >
        <Plus className="mr-1 h-3 w-3" />
        Add Entry
      </Button>
    </div>
  );
}
