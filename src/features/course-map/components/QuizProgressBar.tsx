interface QuizProgressBarProps {
  current: number;
  total: number;
}

export function QuizProgressBar({ current, total }: QuizProgressBarProps) {
  const pct = total > 0 ? ((current) / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Question {current + 1} of {total}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {Math.round(pct)}% complete
        </span>
      </div>
      <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
