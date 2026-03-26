import { Link } from "react-router-dom";
import { useMemo } from "react";
import { ArrowUpRight, Calendar, MapPin } from "lucide-react";
import { listWeddingsOrdered } from "../../data/weddingCatalog";
import { WEDDING_PHOTOGRAPHER_ID, getPhotographerById } from "../../data/managerPhotographers";
import { useManagerContext } from "../../context/ManagerContext";

export function ManagerWeddingsPage() {
  const { selectedId } = useManagerContext();

  const rows = useMemo(() => {
    const all = listWeddingsOrdered();
    if (selectedId === "all") return all;
    return all.filter(({ id }) => WEDDING_PHOTOGRAPHER_ID[id] === selectedId);
  }, [selectedId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Weddings</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-muted">
          Every active project for the selected photographer—or the full studio when viewing all.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-canvas/40 px-6 py-12 text-center text-[14px] text-ink-muted">
          No weddings match this photographer in the demo catalog.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ id, entry: w }) => {
            const pid = WEDDING_PHOTOGRAPHER_ID[id];
            const ph = pid ? getPhotographerById(pid) : undefined;
            return (
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
                    {ph ? (
                      <p className="mt-2 flex items-center gap-2 text-[12px] font-medium text-ink-muted">
                        <span className={"flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-semibold ring-1 " + ph.ringClass}>{ph.initials}</span>
                        {ph.displayName}
                      </p>
                    ) : null}
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
                  to={`/manager/wedding/${id}`}
                  className="mt-5 inline-flex items-center gap-1.5 self-start text-[13px] font-semibold text-accent hover:text-accent-hover"
                >
                  Open wedding
                  <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
