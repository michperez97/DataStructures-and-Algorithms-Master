import { useMemo } from "react";
import { useKnowledgeNodes } from "./use-knowledge-nodes";

export function useCategorySiblings(
  mapId: string | undefined,
  category: string | undefined,
) {
  const { nodes, isLoading } = useKnowledgeNodes(mapId);

  return useMemo(() => {
    if (!category) {
      return { siblings: [], coveredCount: 0, totalCount: 0, progressPercent: 0, isLoading };
    }

    const siblings = nodes.filter((n) => n.category === category);
    const totalCount = siblings.length;
    const coveredCount = siblings.filter(
      (n) => n.status === "Covered" || n.status === "Mastered",
    ).length;
    const progressPercent = totalCount > 0 ? Math.round((coveredCount / totalCount) * 100) : 0;

    return { siblings, coveredCount, totalCount, progressPercent, isLoading };
  }, [nodes, category, isLoading]);
}
