import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import type { KnowledgeEdge } from "@/db/schema";

export function useKnowledgeNode(nodeId: string | undefined) {
  const node = useLiveQuery(
    () => (nodeId ? db.knowledgeNodes.get(nodeId) : undefined),
    [nodeId],
  );

  return { node: node ?? null, isLoading: node === undefined };
}

export function usePrerequisiteEdges(mapId: string | undefined, nodeId: string | undefined) {
  const edges = useLiveQuery(
    () => {
      if (!mapId || !nodeId) return [] as KnowledgeEdge[];
      return db.knowledgeEdges
        .where("mapId")
        .equals(mapId)
        .filter((e) => e.toNodeId === nodeId && e.type === "Prerequisite")
        .toArray();
    },
    [mapId, nodeId],
  );

  return { edges: edges ?? [], isLoading: edges === undefined };
}

export function usePrerequisiteNodes(mapId: string | undefined, nodeId: string | undefined) {
  const data = useLiveQuery(
    async () => {
      if (!mapId || !nodeId) return [];
      const edges = await db.knowledgeEdges
        .where("mapId")
        .equals(mapId)
        .filter((e) => e.toNodeId === nodeId && e.type === "Prerequisite")
        .toArray();
      if (edges.length === 0) return [];
      const nodeIds = edges.map((e) => e.fromNodeId);
      return db.knowledgeNodes.where("nodeId").anyOf(nodeIds).toArray();
    },
    [mapId, nodeId],
  );

  return { prerequisites: data ?? [], isLoading: data === undefined };
}
