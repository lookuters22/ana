import type { WeddingId } from "./weddingCatalog";

export type WeddingPersonRow = {
  id: string;
  name: string;
  /** e.g. "Bride · sofia@email.com" */
  subtitle: string;
};

export const WEDDING_PEOPLE_DEFAULTS: Record<WeddingId, WeddingPersonRow[]> = {
  "lake-como": [
    { id: "lc-1", name: "Sofia Marin", subtitle: "Bride · sofia@email.com" },
    { id: "lc-2", name: "Marco Bianchi", subtitle: "Groom · marco@email.com" },
    { id: "lc-3", name: "Elena Rossi Planning", subtitle: "Lead planner · elena@rossiplans.it" },
  ],
  santorini: [
    { id: "sa-1", name: "Amelia Collins", subtitle: "Bride · amelia@email.com" },
    { id: "sa-2", name: "James Wright", subtitle: "Groom · james@email.com" },
    { id: "sa-3", name: "Helena Mavros Planning", subtitle: "Lead planner · helena@mavros.gr" },
  ],
  london: [
    { id: "lo-1", name: "Priya Kapoor", subtitle: "Bride · priya@email.com" },
    { id: "lo-2", name: "Daniel Okonkwo", subtitle: "Groom · daniel@email.com" },
    { id: "lo-3", name: "Harriet Vance", subtitle: "Lead planner · harriet@mayfairweddings.co.uk" },
  ],
};
