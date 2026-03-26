import type { LucideIcon } from "lucide-react";
import {
  Archive,
  CalendarClock,
  Mail,
} from "lucide-react";

export type ManagerInboxFilterId =
  | "all"
  | "inquiries"
  | "active_weddings"
  | "past_weddings"
  | "needs_reply"
  | "unfiled"
  | "draft"
  | "planner";

export type ManagerInboxRow = {
  id: string;
  photographerId: string;
  wedding: string;
  weddingId: string | null;
  subject: string;
  snippet: string;
  time: string;
  badges: string[];
  categories: ManagerInboxFilterId[];
  confidence: null | { label: string; pct: number };
};

export const MANAGER_INBOX_ROWS: ManagerInboxRow[] = [
  {
    id: "1",
    photographerId: "ph-elena",
    wedding: "Sofia & Marco",
    weddingId: "lake-como",
    subject: "Re: Final timeline · Villa Cetinale",
    snippet:
      "The planner shared v3 of the run-of-show. Hot meals for vendors confirmed for 6:30pm.",
    time: "12 min ago",
    badges: ["Booked", "Planner"],
    categories: ["active_weddings", "needs_reply", "planner"],
    confidence: null,
  },
  {
    id: "2",
    photographerId: "ph-elena",
    wedding: "Unfiled",
    weddingId: null,
    subject: "FW: Insurance certificate — Castello Brown",
    snippet: "Forwarding the COI from the venue coordinator for your records.",
    time: "32 min ago",
    badges: ["Unfiled"],
    categories: ["unfiled"],
    confidence: { label: "Maybe Amelia & James", pct: 62 },
  },
  {
    id: "3",
    photographerId: "ph-luca",
    wedding: "Priya & Daniel",
    weddingId: "london",
    subject: "Consultation follow-up",
    snippet: "We loved the mood board. Can we add a second photographer for the ceremony only?",
    time: "Yesterday",
    badges: ["Inquiry", "Couple", "Has draft"],
    categories: ["inquiries", "draft"],
    confidence: null,
  },
  {
    id: "4",
    photographerId: "ph-marco",
    wedding: "Clara & Noah",
    weddingId: "santorini",
    subject: "Re: Thank you — gallery & album",
    snippet:
      "We finally sat down with the album. Thank you again for everything last season.",
    time: "Last week",
    badges: ["Delivered"],
    categories: ["past_weddings"],
    confidence: null,
  },
];

export const MANAGER_FOCUS_FILTERS: { id: ManagerInboxFilterId; label: string; Icon: LucideIcon }[] = [
  { id: "inquiries", label: "Inquiries", Icon: Mail },
  { id: "active_weddings", label: "Active weddings", Icon: CalendarClock },
  { id: "past_weddings", label: "Past weddings", Icon: Archive },
];

export const MANAGER_QUICK_FILTERS: { id: ManagerInboxFilterId; label: string }[] = [
  { id: "all", label: "All messages" },
  { id: "needs_reply", label: "Needs reply" },
  { id: "unfiled", label: "Unfiled" },
  { id: "draft", label: "Has draft" },
  { id: "planner", label: "Planner" },
];

export function managerRowMatches(row: ManagerInboxRow, filter: ManagerInboxFilterId): boolean {
  if (filter === "all") return true;
  return row.categories.includes(filter);
}
