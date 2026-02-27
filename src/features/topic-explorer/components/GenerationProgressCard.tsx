import { Loader2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GenerationProgressCardProps {
  phase: "prerequisites" | "lesson" | "questions" | "saving";
  elapsedMs: number;
  onCancel?: () => void;
}

const PHASE_LABELS: Record<string, string> = {
  prerequisites: "Discovering prerequisites...",
  lesson: "Generating lesson content...",
  questions: "Generating practice questions...",
  saving: "Saving to database...",
};

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
}

export function GenerationProgressCard({
  phase,
  elapsedMs,
  onCancel,
}: GenerationProgressCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between py-6">
        <div className="flex items-center gap-3">
          <Loader2 className="text-primary h-5 w-5 animate-spin" />
          <div>
            <span className="text-sm">{PHASE_LABELS[phase]}</span>
            <span className="text-muted-foreground ml-2 text-xs">
              {formatElapsed(elapsedMs)}
            </span>
          </div>
        </div>
        {onCancel && phase !== "saving" && (
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
