export type WeddingEntry = {
  couple: string;
  when: string;
  where: string;
  stage: string;
  package: string;
  value: string;
  balance: string;
  story: string;
};

/** Slugs used in `/wedding/:weddingId` */
export const WEDDING_IDS = ["lake-como", "santorini", "london"] as const;
export type WeddingId = (typeof WEDDING_IDS)[number];

export const WEDDING_CATALOG: Record<string, WeddingEntry> = {
  "lake-como": {
    couple: "Sofia & Marco",
    when: "Saturday, 14 June 2026 · Europe/Rome",
    where: "Villa Cetinale · Tuscany",
    stage: "Booked",
    package: "Weekend editorial + rehearsal",
    value: "€18,500",
    balance: "€4,200 due · Net-15 after wedding",
    story:
      "Planner-led destination wedding. Photography covers rehearsal dinner, full wedding day, and Sunday brunch. Timeline v3 received; vendor meals confirmed. Awaiting final floor plan PDF.",
  },
  santorini: {
    couple: "Amelia & James",
    when: "Saturday, 5 July 2026 · Europe/Athens",
    where: "Santorini · Grace Hotel",
    stage: "Contract out",
    package: "Two-day island coverage",
    value: "£14,200",
    balance: "Awaiting signed agreement",
    story:
      "Intimate cliffside ceremony. Couple prefers warm, editorial black-and-white for ceremony; color for reception. Travel blocks held 3–7 July.",
  },
  london: {
    couple: "Priya & Daniel",
    when: "Saturday, 20 September 2026 · Europe/London",
    where: "Claridge's · Mayfair",
    stage: "Inquiry",
    package: "City editorial + tented reception",
    value: "£9,800",
    balance: "Proposal pending",
    story:
      "High-touch urban wedding with multi-faith elements. Initial consult completed; mood board approved. Open question on second shooter for ceremony only.",
  },
};

export function listWeddingsOrdered(): { id: string; entry: WeddingEntry }[] {
  return WEDDING_IDS.map((id) => ({ id, entry: WEDDING_CATALOG[id] }));
}
