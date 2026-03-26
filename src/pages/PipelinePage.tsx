import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

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
  },
  {
    id: "amelia",
    weddingRouteId: "santorini",
    couple: "Amelia & James",
    when: "Jul 5",
    city: "Santorini",
    value: "£14.2k",
    currentStageIndex: 3,
  },
  {
    id: "sofia",
    weddingRouteId: "lake-como",
    couple: "Sofia & Marco",
    when: "Jun 14",
    city: "Lake Como",
    value: "€18.5k",
    currentStageIndex: 5,
  },
  {
    id: "nina",
    weddingRouteId: "london",
    couple: "Nina & Leo",
    when: "Aug 2025",
    city: "Provence",
    value: "€12.4k",
    currentStageIndex: 6,
  },
];

function StageTrack({ currentStageIndex }: { currentStageIndex: number }) {
  return (
    <div className="mt-4 w-full min-w-0 overflow-x-auto pb-1 [scrollbar-width:thin]">
      <div className="flex min-w-[640px] items-start sm:min-w-0">
        {STAGES.map((label, i) => {
          const done = i < currentStageIndex;
          const current = i === currentStageIndex;
          const last = i === STAGES.length - 1;

          return (
            <Fragment key={label}>
              <div className="flex min-w-0 flex-1 flex-col items-center">
                <div
                  className={
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-semibold transition-colors " +
                    (done
                      ? "border-accent bg-accent text-white"
                      : current
                        ? "border-accent bg-surface text-accent shadow-[0_0_0_3px_rgba(59,78,208,0.12)]"
                        : "border-border bg-canvas/80 text-ink-faint")
                  }
                  aria-current={current ? "step" : undefined}
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : i + 1}
                </div>
                <span
                  className={
                    "mt-1.5 line-clamp-2 text-center text-[9px] font-semibold uppercase leading-tight tracking-wide sm:text-[10px] " +
                    (current ? "text-ink" : done ? "text-ink-muted" : "text-ink-faint")
                  }
                >
                  {label}
                </span>
              </div>
              {!last ? (
                <div
                  className={
                    "mb-auto mt-3.5 h-0.5 min-w-[6px] flex-1 rounded-full " +
                    (i < currentStageIndex ? "bg-accent/70" : "bg-border")
                  }
                  aria-hidden
                />
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function PipelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Pipeline</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-muted">
          Each wedding has its own journey below. Scan every couple&apos;s stage in one view—no shared columns mixing
          different projects.
        </p>
      </div>

      <div className="space-y-4">
        {weddings.map((w) => (
          <div
            key={w.id}
            className="rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(26,28,30,0.04),0_8px_28px_rgba(26,28,30,0.05)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 pb-4">
              <div>
                <Link
                  to={`/wedding/${w.weddingRouteId}`}
                  className="text-[16px] font-semibold text-ink hover:text-accent"
                >
                  {w.couple}
                </Link>
                <p className="mt-1 text-[13px] text-ink-muted">
                  {w.when} · {w.city}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-semibold text-ink">{w.value}</p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                  Now: {STAGES[w.currentStageIndex]}
                </p>
              </div>
            </div>
            <StageTrack currentStageIndex={w.currentStageIndex} />
          </div>
        ))}
      </div>
    </div>
  );
}
