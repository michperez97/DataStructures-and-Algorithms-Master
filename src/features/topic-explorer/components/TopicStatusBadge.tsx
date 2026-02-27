import { Badge } from "@/components/ui/badge";
import type { KnowledgeNodeStatus } from "@/db/schema";

const STATUS_CONFIG: Record<
  KnowledgeNodeStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  NotCovered: { label: "Not Covered", variant: "outline" },
  Covered: { label: "Covered", variant: "default" },
  InProgress: { label: "In Progress", variant: "secondary" },
  Mastered: { label: "Mastered", variant: "default" },
  Weak: { label: "Weak", variant: "destructive" },
};

interface TopicStatusBadgeProps {
  status: KnowledgeNodeStatus | undefined;
}

export function TopicStatusBadge({ status }: TopicStatusBadgeProps) {
  const config = STATUS_CONFIG[status ?? "NotCovered"];

  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  );
}
