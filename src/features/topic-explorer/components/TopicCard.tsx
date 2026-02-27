import { Link } from "react-router";
import type { KnowledgeNode } from "@/db/schema";
import { TopicStatusBadge } from "./TopicStatusBadge";
import { StatusSparkIcon } from "./StatusSparkIcon";

interface TopicCardProps {
  node: KnowledgeNode;
}

export function TopicCard({ node }: TopicCardProps) {
  return (
    <Link
      to={`/explorer/${node.nodeId}`}
      className="hover:bg-accent flex items-center justify-between rounded-md border px-4 py-3 transition-colors"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <StatusSparkIcon status={node.status} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{node.title}</p>
          {node.description && (
            <p className="text-muted-foreground mt-0.5 truncate text-xs">
              {node.description}
            </p>
          )}
        </div>
      </div>
      <TopicStatusBadge status={node.status} />
    </Link>
  );
}
