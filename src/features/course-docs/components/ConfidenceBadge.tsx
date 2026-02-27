import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  confidence: number;
  className?: string;
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const percent = Math.round(confidence * 100);

  const colorClass =
    confidence >= 0.8
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
      : confidence >= 0.6
        ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
        : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400";

  return (
    <Badge variant="outline" className={cn(colorClass, className)}>
      {percent}%
    </Badge>
  );
}
