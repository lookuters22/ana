import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, PenLine } from "lucide-react";
import { ApprovalDraftAiModal } from "../components/ApprovalDraftAiModal";
import { PHOTOGRAPHER_APPROVAL_DRAFTS, type ApprovalDraft } from "../data/approvalDrafts";

export function ApprovalsPage() {
  const [drafts, setDrafts] = useState<ApprovalDraft[]>(() => [...PHOTOGRAPHER_APPROVAL_DRAFTS]);
  const [editing, setEditing] = useState<ApprovalDraft | null>(null);

  function applyBody(id: string, body: string) {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, body } : d)));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Approvals</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-muted">
          Nothing reaches a planner or couple until you approve it here or in WhatsApp. Edits stay in one queue.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {drafts.map((d) => (
          <div
            key={d.id}
            className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(26,28,30,0.04),0_12px_32px_rgba(26,28,30,0.06)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-faint">{d.wedding}</p>
                <p className="mt-1 text-[15px] font-semibold text-ink">{d.subject}</p>
                <p className="mt-1 text-[12px] text-ink-faint">To {d.to}</p>
              </div>
              <Link to={`/wedding/${d.weddingId}`} className="text-[12px] font-semibold text-accent hover:text-accent-hover">
                Open context
              </Link>
            </div>
            <p className="mt-4 flex-1 text-[14px] leading-relaxed text-ink-muted">{d.body}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-accent-hover"
              >
                <Check className="h-4 w-4" strokeWidth={1.75} />
                Approve & send
              </button>
              <button
                type="button"
                onClick={() => setEditing(d)}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13px] font-semibold text-ink hover:border-accent/30"
              >
                <PenLine className="h-4 w-4" strokeWidth={1.75} />
                Edit
              </button>
              <button type="button" className="rounded-full px-4 py-2 text-[13px] font-semibold text-ink-faint hover:text-ink">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      <ApprovalDraftAiModal
        draft={editing}
        open={editing !== null}
        onClose={() => setEditing(null)}
        onApply={(body) => {
          if (editing) applyBody(editing.id, body);
        }}
      />
    </div>
  );
}
