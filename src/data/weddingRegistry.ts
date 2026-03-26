import { listWeddingsOrdered, WEDDING_CATALOG, type WeddingEntry } from "./weddingCatalog";
import { getCustomWeddingEntry, listCustomWeddings } from "./customWeddings";

export function resolveWeddingEntry(id: string): WeddingEntry | null {
  const built = WEDDING_CATALOG[id];
  if (built) return built;
  return getCustomWeddingEntry(id);
}

/** Photographer-created weddings first, then built-in demos. */
export function listAllWeddingsForDashboard(): { id: string; entry: WeddingEntry }[] {
  const custom = listCustomWeddings().map((r) => ({ id: r.id, entry: r.entry }));
  return [...custom, ...listWeddingsOrdered()];
}
