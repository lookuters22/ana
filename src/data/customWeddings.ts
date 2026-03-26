import type { WeddingEntry } from "./weddingCatalog";

const STORAGE_KEY = "atelier.customWeddings.v1";

export type CustomWeddingRecord = {
  id: string;
  entry: WeddingEntry;
};

function load(): CustomWeddingRecord[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as unknown;
    return Array.isArray(p) ? (p as CustomWeddingRecord[]) : [];
  } catch {
    return [];
  }
}

function save(records: CustomWeddingRecord[]) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    /* quota */
  }
}

export function listCustomWeddings(): CustomWeddingRecord[] {
  return load();
}

export function getCustomWeddingEntry(id: string): WeddingEntry | null {
  return load().find((r) => r.id === id)?.entry ?? null;
}

export function isCustomWeddingId(id: string): boolean {
  return load().some((r) => r.id === id);
}

export function addCustomWedding(entry: WeddingEntry): string {
  const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  save([...load(), { id, entry }]);
  return id;
}
