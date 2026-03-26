import type { WeddingId } from "./weddingCatalog";

export type FlightLeg = {
  id: string;
  route: string;
  depart: string;
  arrive: string;
  airline: string;
  status: string;
};

export type HotelStay = {
  id: string;
  name: string;
  checkIn: string;
  checkOut: string;
  note?: string;
};

export type GroundSegment = {
  id: string;
  label: string;
  detail: string;
};

export type WeddingTravelPlan = {
  flights: FlightLeg[];
  hotels: HotelStay[];
  ground: GroundSegment[];
};

export const WEDDING_TRAVEL: Record<WeddingId, WeddingTravelPlan> = {
  "lake-como": {
    flights: [
      {
        id: "f1",
        route: "LHR → MXP",
        depart: "Wed 11 Jun · 07:40",
        arrive: "Wed 11 Jun · 10:55",
        airline: "BA",
        status: "Held (demo)",
      },
      {
        id: "f2",
        route: "MXP → FLR",
        depart: "Wed 11 Jun · 14:20",
        arrive: "Wed 11 Jun · 15:05",
        airline: "ITA",
        status: "Held (demo)",
      },
    ],
    hotels: [
      {
        id: "h1",
        name: "Borgo San Felice · near venue",
        checkIn: "Wed 11 Jun",
        checkOut: "Mon 16 Jun",
        note: "Block for crew + overflow suite",
      },
    ],
    ground: [
      {
        id: "g1",
        label: "Rental van",
        detail: "Sixt · Florence airport pickup · 11 Jun–16 Jun",
      },
      {
        id: "g2",
        label: "Planner transfer",
        detail: "Rehearsal night · Elena Rossi Planning",
      },
    ],
  },
  santorini: {
    flights: [
      {
        id: "f1",
        route: "LGW → JTR",
        depart: "Thu 3 Jul · 06:15",
        arrive: "Thu 3 Jul · 12:40",
        airline: "easyJet",
        status: "Watchlist (demo)",
      },
    ],
    hotels: [
      {
        id: "h1",
        name: "Grace Hotel Santorini",
        checkIn: "Thu 3 Jul",
        checkOut: "Mon 7 Jul",
        note: "Cliff suite · sunset slot TBC",
      },
    ],
    ground: [
      {
        id: "g1",
        label: "ATV / small car",
        detail: "Local vendor · 4 Jul–6 Jul",
      },
    ],
  },
  london: {
    flights: [],
    hotels: [
      {
        id: "h1",
        name: "Claridge's · prep hold",
        checkIn: "Fri 19 Sep",
        checkOut: "Sun 21 Sep",
        note: "Subject to contract — planner hold",
      },
    ],
    ground: [
      {
        id: "g1",
        label: "Black car",
        detail: "Mayfair ↔ venues · day-of only (demo)",
      },
    ],
  },
};

export function getTravelForWedding(id: string): WeddingTravelPlan | null {
  const plan = WEDDING_TRAVEL[id as WeddingId];
  return plan ?? null;
}
