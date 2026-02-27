import { Button } from "@/components/ui/button";
import type { Difficulty } from "@/db/schema";

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (difficulty: Difficulty) => void;
  disabled?: boolean;
}

const LEVELS: { value: Difficulty; label: string; description: string }[] = [
  { value: "Easy", label: "Easy", description: "Simpler numbers, standard base cases" },
  { value: "Medium", label: "Medium", description: "Matches Cobo's originals" },
  { value: "Hard", label: "Hard", description: "Tricky twists and non-standard cases" },
];

export function DifficultySelector({
  value,
  onChange,
  disabled,
}: DifficultySelectorProps) {
  return (
    <div className="flex gap-2">
      {LEVELS.map((level) => (
        <Button
          key={level.value}
          variant={value === level.value ? "default" : "outline"}
          size="sm"
          disabled={disabled}
          onClick={() => onChange(level.value)}
          title={level.description}
        >
          {level.label}
        </Button>
      ))}
    </div>
  );
}
