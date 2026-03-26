import { isCustomWeddingId } from "./customWeddings";

export type WeddingThreadKind = "group" | "planner_only" | "other";

export type WeddingThread = {
  id: string;
  weddingId: string;
  title: string;
  participantHint: string;
  kind: WeddingThreadKind;
  /** Shown on By thread tab */
  lastActivityLabel: string;
  /** When true, timeline shows pending draft for this thread (demo) */
  hasPendingDraft?: boolean;
  /** Composer defaults when replying in this thread */
  composerTo?: string;
  composerSubjectDefault?: string;
};

export type WeddingThreadMessage = {
  id: string;
  threadId: string;
  direction: "in" | "out";
  sender: string;
  meta?: string;
  time: string;
  subject?: string;
  body: string;
  daySegment: "earlier" | "today";
  sortOrder: number;
};

const DRAFT_BODY_DEFAULT =
  "Confirmed—we will cover the rehearsal toast with one lead and one associate, ambient-only, per the package.";

export const WEDDING_THREAD_DRAFT_DEFAULT = DRAFT_BODY_DEFAULT;

const THREADS: WeddingThread[] = [
  // London — two threads (group vs planner-only side channel)
  {
    id: "london-thread-group",
    weddingId: "london",
    title: "Planning · everyone",
    participantHint: "Bride, groom & planner",
    kind: "group",
    lastActivityLabel: "Mon · last reply",
  },
  {
    id: "london-thread-planner",
    weddingId: "london",
    title: "Planner + you",
    participantHint: "Direct with Elena Rossi Planning",
    kind: "planner_only",
    lastActivityLabel: "Today",
    hasPendingDraft: true,
    composerTo: "elena@rossiplans.it",
    composerSubjectDefault: "Re: Timeline v3 — photography coverage",
  },
  // Lake Como — single combined thread (demo)
  {
    id: "lake-como-thread-main",
    weddingId: "lake-como",
    title: "Timeline & coverage",
    participantHint: "Planner, couple & studio",
    kind: "group",
    lastActivityLabel: "Today",
    hasPendingDraft: true,
    composerTo: "elena@rossiplans.it",
    composerSubjectDefault: "Re: Timeline v3 — photography coverage",
  },
  // Santorini — single thread, no draft
  {
    id: "santorini-thread-main",
    weddingId: "santorini",
    title: "Island weekend",
    participantHint: "Couple & planner",
    kind: "group",
    lastActivityLabel: "Last week",
  },
];

const MESSAGES: WeddingThreadMessage[] = [
  // London group
  {
    id: "lc-m1",
    threadId: "london-thread-group",
    direction: "in",
    sender: "Elena Rossi Planning",
    meta: "Lead planner",
    time: "Mon · 14:02",
    subject: "Re: Coverage windows — draft timeline",
    body:
      "Hi team — attaching an early pass at timing. Can you confirm whether you want ambient coverage during welcome drinks or only from processional?",
    daySegment: "earlier",
    sortOrder: 1,
  },
  {
    id: "lc-m2",
    threadId: "london-thread-group",
    direction: "out",
    sender: "You",
    meta: "Atelier",
    time: "Mon · 16:18",
    subject: "Re: Coverage windows — draft timeline",
    body:
      "Thanks — we’ll take welcome drinks ambient-only (no posed), then full coverage from processional through send-off. Let us know if you want a second shooter for cocktail hour only.",
    daySegment: "earlier",
    sortOrder: 2,
  },
  // London planner-only
  {
    id: "lp-m1",
    threadId: "london-thread-planner",
    direction: "in",
    sender: "Planner",
    meta: "elena@rossiplans.it",
    time: "Today · 09:14",
    subject: "Timeline v3 — photography coverage",
    body:
      "Sharing v3 of the run-of-show. Please confirm photography coverage for the rehearsal toast at 19:40.",
    daySegment: "today",
    sortOrder: 1,
  },
  // Lake Como — one thread
  {
    id: "como-m1",
    threadId: "lake-como-thread-main",
    direction: "in",
    sender: "Elena Rossi Planning",
    meta: "Lead planner",
    time: "Mon · 14:02",
    subject: "Re: Coverage windows — draft timeline",
    body:
      "Hi team — attaching an early pass at timing. Can you confirm whether you want ambient coverage during welcome drinks or only from processional?",
    daySegment: "earlier",
    sortOrder: 1,
  },
  {
    id: "como-m2",
    threadId: "lake-como-thread-main",
    direction: "out",
    sender: "You",
    meta: "Atelier",
    time: "Mon · 16:18",
    subject: "Re: Coverage windows — draft timeline",
    body:
      "Thanks — we’ll take welcome drinks ambient-only (no posed), then full coverage from processional through send-off. Let us know if you want a second shooter for cocktail hour only.",
    daySegment: "earlier",
    sortOrder: 2,
  },
  {
    id: "como-m3",
    threadId: "lake-como-thread-main",
    direction: "in",
    sender: "Planner",
    meta: "elena@rossiplans.it",
    time: "Today · 09:14",
    subject: "Timeline v3 — photography coverage",
    body:
      "Sharing v3 of the run-of-show. Please confirm photography coverage for the rehearsal toast at 19:40.",
    daySegment: "today",
    sortOrder: 3,
  },
  // Santorini
  {
    id: "san-m1",
    threadId: "santorini-thread-main",
    direction: "in",
    sender: "Amelia Chen",
    meta: "Bride",
    time: "Tue · 10:22",
    subject: "Re: Santorini timeline",
    body: "We’re finalizing the welcome dinner time — can you be on site from 17:00 for candids?",
    daySegment: "earlier",
    sortOrder: 1,
  },
  {
    id: "san-m2",
    threadId: "santorini-thread-main",
    direction: "out",
    sender: "You",
    meta: "Atelier",
    time: "Tue · 11:05",
    subject: "Re: Santorini timeline",
    body: "Yes — 17:00 works. I’ll align with the planner on ferry timing from the hotel.",
    daySegment: "earlier",
    sortOrder: 2,
  },
];

export function getThreadsForWedding(weddingId: string): WeddingThread[] {
  const found = THREADS.filter((t) => t.weddingId === weddingId);
  if (found.length > 0) return found;
  if (isCustomWeddingId(weddingId)) {
    return [
      {
        id: `${weddingId}-thread-main`,
        weddingId,
        title: "Project",
        participantHint: "Add contacts and start the thread",
        kind: "group",
        lastActivityLabel: "No messages yet",
      },
    ];
  }
  return [];
}

export function getMessagesForThread(threadId: string): WeddingThreadMessage[] {
  return MESSAGES.filter((m) => m.threadId === threadId).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getThreadById(threadId: string): WeddingThread | undefined {
  return THREADS.find((t) => t.id === threadId);
}

export function messageFoldKey(threadId: string, messageId: string): string {
  return `${threadId}:${messageId}`;
}
