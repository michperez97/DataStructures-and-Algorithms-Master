import { useState } from "react";
import { Link } from "react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { KnowledgeNode } from "@/db/schema";
import { TopicCard } from "./TopicCard";

interface TopicCategoryGroupProps {
  category: string;
  nodes: KnowledgeNode[];
}

export function TopicCategoryGroup({ category, nodes }: TopicCategoryGroupProps) {
  const [open, setOpen] = useState(true);
  const coveredCount = nodes.filter(
    (n) => n.status && n.status !== "NotCovered",
  ).length;

  const firstNodeId = nodes[0]?.nodeId;

  return (
    <div className="space-y-1">
      <div className="hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-2 transition-colors">
        <button
          onClick={() => setOpen(!open)}
          className="shrink-0"
          aria-label={open ? "Collapse" : "Expand"}
        >
          {open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {firstNodeId ? (
          <Link
            to={`/explorer/${firstNodeId}`}
            className="flex flex-1 items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <span className="text-sm font-semibold">{category}</span>
            <span className="text-muted-foreground text-xs">
              {coveredCount}/{nodes.length}
            </span>
          </Link>
        ) : (
          <>
            <span className="text-sm font-semibold">{category}</span>
            <span className="text-muted-foreground text-xs">
              {coveredCount}/{nodes.length}
            </span>
          </>
        )}
      </div>
      {open && (
        <div className="ml-6 space-y-1">
          {nodes.map((node) => (
            <TopicCard key={node.nodeId} node={node} />
          ))}
        </div>
      )}
    </div>
  );
}
