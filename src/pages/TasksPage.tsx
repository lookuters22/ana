import { Link } from "react-router-dom";

const tasks = [
  { title: "Send questionnaire (6-week)", wedding: "Sofia & Marco", due: "Apr 02", id: "lake-como" },
  { title: "Confirm second shooter addendum", wedding: "Priya & Daniel", due: "Today", id: "london" },
  { title: "Upload COI to venue portal", wedding: "Amelia & James", due: "Apr 18", id: "santorini" },
];

export function TasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Tasks</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-muted">
          Pulled from email threads and your own notes—everything dated, everything traceable.
        </p>
      </div>

      <div className="space-y-3">
        {tasks.map((t) => (
          <div
            key={t.title}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-4 shadow-sm"
          >
            <div>
              <p className="text-[14px] font-semibold text-ink">{t.title}</p>
              <p className="mt-1 text-[13px] text-ink-muted">{t.wedding}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="rounded-full bg-canvas px-3 py-1 text-[12px] font-semibold text-ink-muted">{t.due}</span>
              <Link to={`/wedding/${t.id}`} className="text-[13px] font-semibold text-accent hover:text-accent-hover">
                Open
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
