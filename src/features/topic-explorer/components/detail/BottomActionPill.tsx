import { CheckCircle2, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { KnowledgeNodeStatus } from "@/db/schema";

interface BottomActionPillProps {
  status: KnowledgeNodeStatus | undefined;
  onMarkRead: () => void;
  onPractice: () => void;
}

export function BottomActionPill({
  status,
  onMarkRead,
  onPractice,
}: BottomActionPillProps) {
  const isCovered = status === "Covered" || status === "Mastered";

  return (
    <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center">
      <div className="flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/90 p-1.5 shadow-lg shadow-stone-200/30 backdrop-blur-xl dark:border-white/10 dark:bg-[#201E1D]/90 dark:shadow-black/40">
        <Button
          variant={isCovered ? "secondary" : "default"}
          size="sm"
          className="rounded-full"
          onClick={onMarkRead}
          disabled={isCovered}
        >
          <CheckCircle2 className="mr-1.5 size-3.5" />
          {isCovered ? "Read" : "Mark Read"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full"
          onClick={onPractice}
        >
          <Dumbbell className="mr-1.5 size-3.5" />
          Practice
        </Button>
      </div>
    </div>
  );
}
