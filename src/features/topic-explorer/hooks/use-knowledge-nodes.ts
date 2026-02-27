import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

export function useKnowledgeNodes(mapId: string | undefined) {
  const nodes = useLiveQuery(
    () =>
      mapId ? db.knowledgeNodes.where("mapId").equals(mapId).toArray() : [],
    [mapId],
  );

  return { nodes: nodes ?? [], isLoading: nodes === undefined };
}
