import { Link } from "react-router-dom";
import { ArrowUpRight, Calendar, MapPin, Plus } from "lucide-react";
import { listAllWeddingsForDashboard } from "../data/weddingRegistry";

export function WeddingsPage() {
  const rows = listAllWeddingsForDashboard();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Weddings</h1>
          <p className="mt-2 max-w-2xl text-[14px] text-ink-muted">
            Every active project in one place. Open a wedding for timeline, threads, tasks, files, and the composer.
          </p>
        </div>
        <Link
          to="/weddings/new"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-ink shadow-sm ring-1 ring-black/[0.04] transition hover:border-accent/35 hover:text-accent"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add wedding
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ id, entry: w }) => (
          <div
            key={id}
            className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(26,28,30,0.04),0_12px_32px_rgba(26,28,30,0.06)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[16px] font-semibold text-ink">{w.couple}</p>
                <span className="mt-2 inline-flex rounded-full bg-canvas px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                  {w.stage}
                </span>
              </div>
              <p className="text-[13px] font-semibold text-ink">{w.value}</p>
            </div>
            <p className="mt-3 flex items-start gap-2 text-[13px] text-ink-muted">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" strokeWidth={1.5} />
              {w.when}
            </p>
            <p className="mt-2 flex items-start gap-2 text-[13px] text-ink-muted">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" strokeWidth={1.5} />
              {w.where}
            </p>
            <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-ink-muted">{w.story}</p>
            <Link
              to={`/wedding/${id}`}
              className="mt-5 inline-flex items-center gap-1.5 self-start text-[13px] font-semibold text-accent hover:text-accent-hover"
            >
              Open wedding
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
