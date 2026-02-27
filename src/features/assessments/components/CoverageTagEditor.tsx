import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CoverageTag {
  topicTag: string;
  weight?: number;
}

interface CoverageTagEditorProps {
  tags: CoverageTag[];
  onChange: (tags: CoverageTag[]) => void;
}

export function CoverageTagEditor({ tags, onChange }: CoverageTagEditorProps) {
  const addTag = () => {
    onChange([...tags, { topicTag: "", weight: undefined }]);
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const updateTag = (index: number, field: keyof CoverageTag, value: string) => {
    const updated = [...tags];
    if (field === "weight") {
      updated[index] = { ...updated[index], weight: value ? Number(value) : undefined };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <Label>Coverage Tags</Label>
      {tags.map((tag, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            placeholder="Topic tag"
            value={tag.topicTag}
            onChange={(e) => updateTag(i, "topicTag", e.target.value)}
            className="flex-1"
          />
          <Input
            type="number"
            placeholder="Weight"
            value={tag.weight ?? ""}
            onChange={(e) => updateTag(i, "weight", e.target.value)}
            className="w-24"
            min={0}
            max={100}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeTag(i)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addTag}>
        <Plus className="mr-1 h-3 w-3" />
        Add Tag
      </Button>
    </div>
  );
}
