import type { WeddingEntry } from "../data/weddingCatalog";
import type { WeddingPersonRow } from "../data/weddingPeopleDefaults";

export type WeddingFieldsEditable = Pick<
  WeddingEntry,
  "couple" | "when" | "where" | "stage" | "package" | "value" | "balance"
>;

export type WeddingDetailPersisted = {
  wedding: WeddingFieldsEditable;
  people: WeddingPersonRow[];
  photographerNotes: string;
};

const storageKey = (weddingId: string) => `atelier.weddingDetail.${weddingId}`;

export function loadWeddingDetailPersisted(
  weddingId: string,
  defaults: WeddingDetailPersisted,
): WeddingDetailPersisted {
  if (typeof localStorage === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(storageKey(weddingId));
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<WeddingDetailPersisted>;
    return {
      wedding: { ...defaults.wedding, ...parsed.wedding },
      people:
        Array.isArray(parsed.people) && parsed.people.length > 0
          ? (parsed.people as WeddingPersonRow[])
          : defaults.people,
      photographerNotes:
        typeof parsed.photographerNotes === "string" ? parsed.photographerNotes : defaults.photographerNotes,
    };
  } catch {
    return defaults;
  }
}

export function saveWeddingDetailPersisted(weddingId: string, data: WeddingDetailPersisted) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(storageKey(weddingId), JSON.stringify(data));
  } catch {
    /* ignore quota */
  }
}
