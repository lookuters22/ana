import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ArrowUpRight,
  CalendarClock,
  ChevronDown,
  Filter,
  Mail,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type FilterId =
  | "all"
  | "inquiries"
  | "active_weddings"
  | "past_weddings"
  | "needs_reply"
  | "unfiled"
  | "draft"
  | "planner";

type InboxRow = {
  id: string;
  wedding: string;
  weddingId: string | null;
  subject: string;
  snippet: string;
  time: string;
  badges: string[];
  categories: FilterId[];
  confidence: null | { label: string; pct: number };
};

const rows: InboxRow[] = [
  {
    id: "1",
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

const FOCUS_FILTERS: { id: FilterId; label: string; Icon: LucideIcon }[] = [
  { id: "inquiries", label: "Inquiries", Icon: Mail },
  { id: "active_weddings", label: "Active weddings", Icon: CalendarClock },
  { id: "past_weddings", label: "Past weddings", Icon: Archive },
];

const QUICK_FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All messages" },
  { id: "needs_reply", label: "Needs reply" },
  { id: "unfiled", label: "Unfiled" },
  { id: "draft", label: "Has draft" },
  { id: "planner", label: "Planner" },
];

function rowMatches(row: InboxRow, filter: FilterId): boolean {
  if (filter === "all") return true;
  return row.categories.includes(filter);
}

function filterLabel(filter: FilterId): string {
  const focus = FOCUS_FILTERS.find((x) => x.id === filter);
  if (focus) return focus.label;
  const q = QUICK_FILTERS.find((x) => x.id === filter);
  return q?.label ?? "All messages";
}

export function InboxPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterId>("inquiries");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setFilterOpen(false);
    }
    if (filterOpen) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [filterOpen]);

  const visible = useMemo(
    () => rows.filter((r) => rowMatches(r, activeFilter)),
    [activeFilter],
  );

  const selectFilter = (id: FilterId) => {
    setActiveFilter(id);
    setFilterOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Inbox</h1>
          <p className="mt-2 max-w-2xl text-[14px] text-ink-muted">
            Triage across every wedding. Link stray threads once—Atelier keeps the timeline unified.
          </p>
        </div>
        <div className="relative" ref={panelRef}>
          <button
            type="button"
            aria-expanded={filterOpen}
            aria-haspopup="listbox"
            className={
              "inline-flex items-center gap-2 rounded-full border bg-surface px-3 py-2 text-[13px] font-medium shadow-sm transition " +
              (activeFilter !== "all"
                ? "border-ink/10 text-ink shadow-[0_1px_3px_rgba(26,28,30,0.06)]"
                : "border-border text-ink-muted hover:border-ink/15 hover:text-ink")
            }
            onClick={() => setFilterOpen((o) => !o)}
          >
            <Filter className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span>
              {activeFilter === "all" ? "Filters" : filterLabel(activeFilter)}
            </span>
            {activeFilter !== "all" ? (
              <span className="rounded-full bg-canvas px-2 py-0.5 text-[11px] font-semibold text-ink-muted">
                Active
              </span>
            ) : null}
            <ChevronDown
              className={"h-4 w-4 shrink-0 opacity-60 transition " + (filterOpen ? "rotate-180" : "")}
              strokeWidth={1.75}
            />
          </button>

          {filterOpen ? (
            <div
              className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(100vw-2rem,20rem)] rounded-2xl border border-border/90 bg-surface py-2 shadow-[0_12px_40px_rgba(26,28,30,0.1)]"
              role="listbox"
            >
              <div className="border-b border-border/70 px-3 pb-2 pt-1">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  Focus
                </p>
                <div className="flex flex-col gap-1">
                  {FOCUS_FILTERS.map(({ id, label, Icon }) => {
                    const on = activeFilter === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="option"
                        aria-selected={on}
                        className={
                          "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition " +
                          (on
                            ? "bg-canvas text-ink ring-1 ring-ink/10"
                            : "text-ink-muted hover:bg-canvas/80 hover:text-ink")
                        }
                        onClick={() => selectFilter(id)}
                      >
                        <span
                          className={
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg " +
                            (on ? "bg-surface text-accent" : "bg-canvas/90 text-ink-faint")
                          }
                        >
                          <Icon className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="px-2 pt-2">
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  Quick filters
                </p>
                {QUICK_FILTERS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    role="option"
                    aria-selected={activeFilter === o.id}
                    className={
                      "flex w-full rounded-lg px-2 py-2 text-left text-[13px] transition " +
                      (activeFilter === o.id
                        ? "bg-canvas font-semibold text-ink ring-1 ring-ink/8"
                        : "text-ink-muted hover:bg-canvas/70 hover:text-ink")
                    }
                    onClick={() => selectFilter(o.id)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-canvas/40 px-6 py-12 text-center">
          <p className="text-[15px] font-semibold text-ink">No threads in this view</p>
          <p className="mt-2 text-[13px] text-ink-muted">
            Try another filter, or open <strong className="text-ink">Inquiries</strong> for new leads.
          </p>
          <button
            type="button"
            className="mt-4 rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-white hover:bg-accent-hover"
            onClick={() => setActiveFilter("inquiries")}
          >
            Show inquiries
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((row) => (
            <div
              key={row.id}
              className="rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(26,28,30,0.04),0_10px_28px_rgba(26,28,30,0.05)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-semibold text-ink">{row.wedding}</p>
                    {row.badges.map((b) => (
                      <span
                        key={b}
                        className={
                          "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide " +
                          (b === "Inquiry"
                            ? "bg-accent/15 text-accent"
                            : "bg-canvas text-ink-muted")
                        }
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-[15px] font-semibold text-ink">{row.subject}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{row.snippet}</p>
                  {row.confidence ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-canvas px-3 py-2 text-[12px] text-ink-muted">
                      <span className="font-semibold text-ink">{row.confidence.pct}% match</span>
                      <span>· {row.confidence.label}</span>
                      <button type="button" className="font-semibold text-accent hover:text-accent-hover">
                        Confirm
                      </button>
                      <button type="button" className="font-semibold text-ink-muted hover:text-ink">
                        Choose wedding
                      </button>
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className="text-[12px] text-ink-faint">{row.time}</span>
                  {row.weddingId ? (
                    <Link
                      to={`/wedding/${row.weddingId}`}
                      className="inline-flex items-center gap-1 text-[13px] font-semibold text-accent hover:text-accent-hover"
                    >
                      Open wedding
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-[13px] font-semibold text-accent hover:text-accent-hover"
                    >
                      Link thread
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
