import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

export function useGlobalDSAMap() {
  const map = useLiveQuery(() =>
    db.knowledgeMaps.where("scope").equals("GlobalDSA").first(),
  );

  return { map: map ?? null, isLoading: map === undefined };
}
