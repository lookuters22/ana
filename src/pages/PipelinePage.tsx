import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { getPipelineMoneyLine } from "../data/weddingFinancials";

const STAGES = ["Inquiry", "Consultation", "Proposal", "Contract", "Booked", "Prep", "Delivered"] as const;

type WeddingRow = {
  id: string;
  /** Route param for `/wedding/:id` */
  weddingRouteId: string;
  couple: string;
  when: string;
  city: string;
  value: string;
  /** Index in STAGES — current stage for this wedding (0–6) */
  currentStageIndex: number;
  waitingOn: string;
  nextAction: string;
};

/** Each row is one wedding; scan many journeys at once */
const weddings: WeddingRow[] = [
  {
    id: "priya",
    weddingRouteId: "london",
    couple: "Priya & Daniel",
    when: "Sep 20",
    city: "London",
    value: "£9.8k",
    currentStageIndex: 0,
    waitingOn: "Couple to confirm budget ceiling.",
    nextAction: "Book consultation call this week.",
  },
  {
    id: "amelia",
    weddingRouteId: "santorini",
    couple: "Amelia & James",
    when: "Jul 5",
    city: "Santorini",
    value: "£14.2k",
    currentStageIndex: 3,
    waitingOn: "Couple to sign contract.",
    nextAction: "Send 6-week questionnaire on April 2nd.",
  },
  {
    id: "sofia",
    weddingRouteId: "lake-como",
    couple: "Sofia & Marco",
    when: "Jun 14",
    city: "Lake Como",
    value: "€18.5k",
    currentStageIndex: 5,
    waitingOn: "Final floor plan PDF from planner.",
    nextAction: "Confirm vendor meal count by May 1st.",
  },
  {
    id: "nina",
    weddingRouteId: "london",
    couple: "Nina & Leo",
    when: "Aug 2025",
    city: "Provence",
    value: "€12.4k",
    currentStageIndex: 6,
    waitingOn: "Nothing — gallery delivered.",
    nextAction: "Archive project & request testimonial.",
  },
];

type StageGroup = "action" | "cruise" | "delivered";

function stageGroup(currentStageIndex: number): StageGroup {
  if (currentStageIndex <= 3) return "action";
  if (currentStageIndex <= 5) return "cruise";
  return "delivered";
}

function PipelineCard({ w }: { w: WeddingRow }) {
  const stageLabel = STAGES[w.currentStageIndex];
  const stageNum = w.currentStageIndex + 1;
  const moneyLine = getPipelineMoneyLine(w.weddingRouteId);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(26,28,30,0.04),0_8px_28px_rgba(26,28,30,0.05)]">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6 md:items-start">
        <div className="min-w-0">
          <Link to={`/wedding/${w.weddingRouteId}`} className="text-[16px] font-semibold text-ink hover:text-accent">
            {w.couple}
          </Link>
          <p className="mt-1 text-[13px] text-ink-muted">
            {w.when} · {w.city}
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-3 md:items-center md:text-center">
          <span className="inline-flex w-fit max-w-full rounded-lg bg-indigo-500/[0.09] px-2.5 py-1.5 text-[11px] font-semibold leading-tight text-indigo-950 md:mx-auto">
            Stage {stageNum}: {stageLabel}
          </span>
          <div className="flex flex-col gap-1 md:items-center">
            <p className="text-[13px] font-semibold text-ink">{w.value}</p>
            {moneyLine ? <p className="max-w-[16rem] text-[11px] leading-snug text-ink-faint md:mx-auto">{moneyLine}</p> : null}
          </div>
        </div>

        <div className="min-w-0 space-y-4 border-t border-border/50 pt-4 md:border-t-0 md:pt-0">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-faint">Waiting on</p>
            <p className="mt-1.5 text-[13px] leading-snug text-ink">{w.waitingOn}</p>
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-faint">Next action</p>
            <p className="mt-1.5 text-[13px] leading-snug text-ink">{w.nextAction}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

type SectionKey = "action" | "cruise" | "delivered";

const SECTIONS: { key: SectionKey; title: string; description: string }[] = [
  { key: "action", title: "Action required (Inquiry–Contract)", description: "Pre-booking — unblock or advance the deal." },
  { key: "cruise", title: "Cruising (Booked & Prep)", description: "Signed clients — execution and logistics." },
  { key: "delivered", title: "Delivered", description: "Completed journeys." },
];

export function PipelinePage() {
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    action: true,
    cruise: false,
    delivered: false,
  });

  const grouped = useMemo(() => {
    const action: WeddingRow[] = [];
    const cruise: WeddingRow[] = [];
    const delivered: WeddingRow[] = [];
    for (const w of weddings) {
      const g = stageGroup(w.currentStageIndex);
      if (g === "action") action.push(w);
      else if (g === "cruise") cruise.push(w);
      else delivered.push(w);
    }
    return { action, cruise, delivered };
  }, []);

  function rowsFor(key: SectionKey): WeddingRow[] {
    return grouped[key];
  }

  function toggle(key: SectionKey) {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Pipeline</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-muted">
          Bottleneck-first triage: see what each couple is waiting on and your next move—grouped so urgent pre-booking work stays on top.
        </p>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((section) => {
          const rows = rowsFor(section.key);
          if (rows.length === 0) return null;
          const expanded = open[section.key];
          return (
            <div key={section.key} className="overflow-hidden rounded-2xl border border-border bg-canvas/40">
              <button
                type="button"
                onClick={() => toggle(section.key)}
                className="flex w-full items-start gap-2 px-4 py-3 text-left transition hover:bg-black/[0.02] sm:items-center sm:gap-3"
                aria-expanded={expanded}
              >
                <ChevronDown
                  className={"mt-0.5 h-5 w-5 shrink-0 text-ink-faint transition sm:mt-0 " + (expanded ? "" : "-rotate-90")}
                  strokeWidth={2}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-ink">{section.title}</p>
                  <p className="mt-0.5 text-[12px] text-ink-muted">{section.description}</p>
                </div>
                <span className="shrink-0 rounded-full bg-ink/5 px-2 py-0.5 text-[11px] font-semibold text-ink-muted">{rows.length}</span>
              </button>
              {expanded ? (
                <div className="space-y-3 border-t border-border/60 px-3 pb-3 pt-2 sm:px-4">
                  {rows.map((w) => (
                    <PipelineCard key={w.id} w={w} />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
