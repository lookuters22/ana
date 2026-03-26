import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Calendar, MapPin, Paperclip, Shield, Users, X, Sparkles, Paperclip as ClipIcon } from "lucide-react";

type TabId = "timeline" | "thread" | "tasks" | "files";

const catalog: Record<
  string,
  { couple: string; when: string; where: string; stage: string; package: string; value: string; balance: string; story: string }
> = {
  "lake-como": {
    couple: "Sofia & Marco",
    when: "Saturday, 14 June 2026 · Europe/Rome",
    where: "Villa Cetinale · Tuscany",
    stage: "Booked",
    package: "Weekend editorial + rehearsal",
    value: "€18,500",
    balance: "€4,200 due · Net-15 after wedding",
    story:
      "Planner-led destination wedding. Photography covers rehearsal dinner, full wedding day, and Sunday brunch. Timeline v3 received; vendor meals confirmed. Awaiting final floor plan PDF.",
  },
  santorini: {
    couple: "Amelia & James",
    when: "Saturday, 5 July 2026 · Europe/Athens",
    where: "Santorini · Grace Hotel",
    stage: "Contract out",
    package: "Two-day island coverage",
    value: "£14,200",
    balance: "Awaiting signed agreement",
    story:
      "Intimate cliffside ceremony. Couple prefers warm, editorial black-and-white for ceremony; color for reception. Travel blocks held 3–7 July.",
  },
  london: {
    couple: "Priya & Daniel",
    when: "Saturday, 20 September 2026 · Europe/London",
    where: "Claridge's · Mayfair",
    stage: "Inquiry",
    package: "City editorial + tented reception",
    value: "£9,800",
    balance: "Proposal pending",
    story:
      "High-touch urban wedding with multi-faith elements. Initial consult completed; mood board approved. Open question on second shooter for ceremony only.",
  },
};

const DRAFT_DEFAULT =
  "Confirmed—we will cover the rehearsal toast with one lead and one associate, ambient-only, per the package.";

export function WeddingDetailPage() {
  const { weddingId } = useParams();
  const key = weddingId && catalog[weddingId] ? weddingId : "lake-como";
  const w = catalog[key];

  const [tab, setTab] = useState<TabId>("timeline");
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerKind, setComposerKind] = useState<"reply" | "internal">("reply");
  const [draftPending, setDraftPending] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [summaryBusy, setSummaryBusy] = useState(false);
  const [to, setTo] = useState("elena@rossiplans.it");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState("Re: Timeline v3 — photography coverage");
  const [body, setBody] = useState(DRAFT_DEFAULT);
  const [internalBody, setInternalBody] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(t);
  }, [toast]);

  function showToast(msg: string) {
    setToast(msg);
  }

  function openComposer(kind: "reply" | "internal") {
    setComposerKind(kind);
    if (kind === "reply") {
      setBody(draftPending ? DRAFT_DEFAULT : body);
    }
    setComposerOpen(true);
  }

  function approveDraft() {
    setDraftPending(false);
    showToast("Message queued — sent to Elena Rossi Planning (demo).");
  }

  function editDraftInComposer() {
    setBody(DRAFT_DEFAULT);
    openComposer("reply");
  }

  function sendComposer() {
    if (composerKind === "internal") {
      showToast("Internal note saved on this wedding (demo).");
      setInternalBody("");
    } else {
      showToast("Draft submitted for approval — check Approvals (demo).");
    }
    setComposerOpen(false);
  }

  function requestAiDraft() {
    setBody((b) => b + "\\n\\n[AI] Added a warmer sign-off and confirmed vendor meals per thread context.");
    showToast("AI draft inserted — review before sending.");
  }

  function regenerateSummary() {
    setSummaryBusy(true);
    window.setTimeout(() => {
      setSummaryBusy(false);
      showToast("Summary refreshed from the last 30 messages (demo).");
    }, 900);
  }

  function tabBtn(id: TabId, label: string) {
    const on = tab === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => setTab(id)}
        className={
          "rounded-full px-3 py-1 text-[12px] font-semibold transition " +
          (on ? "bg-canvas text-ink" : "text-ink-muted hover:bg-canvas")
        }
      >
        {label}
      </button>
    );
  }

  return (
    <div className="relative grid min-h-[70vh] gap-6 xl:grid-cols-[280px_minmax(0,1fr)_300px]">
      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[120] max-w-md -translate-x-1/2 rounded-full border border-border bg-surface px-5 py-2.5 text-[13px] font-medium text-ink shadow-lg">
          {toast}
        </div>
      ) : null}

      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(26,28,30,0.04),0_12px_32px_rgba(26,28,30,0.06)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-faint">Wedding</p>
              <h1 className="mt-2 text-[22px] font-semibold tracking-tight text-ink">{w.couple}</h1>
            </div>
            <span className="rounded-full bg-canvas px-3 py-1 text-[11px] font-semibold text-ink-muted">{w.stage}</span>
          </div>
          <div className="mt-4 space-y-3 text-[13px] text-ink-muted">
            <p className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-4 w-4 text-ink-faint" strokeWidth={1.5} />
              {w.when}
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-ink-faint" strokeWidth={1.5} />
              {w.where}
            </p>
          </div>
          <div className="mt-5 rounded-xl bg-canvas p-4">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-faint">Commercial</p>
            <p className="mt-2 text-[14px] font-semibold text-ink">{w.package}</p>
            <div className="mt-3 flex items-baseline justify-between gap-3">
              <div>
                <p className="text-[11px] text-ink-faint">Contract value</p>
                <p className="text-[16px] font-semibold text-ink">{w.value}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-ink-faint">Status</p>
                <p className="text-[13px] font-semibold text-ink">{w.balance}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-ink-faint" strokeWidth={1.5} />
            <p className="text-[13px] font-semibold text-ink">People</p>
          </div>
          <ul className="mt-3 space-y-3 text-[13px] text-ink-muted">
            <li>
              <p className="font-semibold text-ink">Sofia Marin</p>
              <p>Bride · sofia@email.com</p>
            </li>
            <li>
              <p className="font-semibold text-ink">Marco Bianchi</p>
              <p>Groom · marco@email.com</p>
            </li>
            <li>
              <p className="font-semibold text-ink">Elena Rossi Planning</p>
              <p>Lead planner · elena@rossiplans.it</p>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-ink-faint" strokeWidth={1.5} />
            <p className="text-[13px] font-semibold text-ink">Logistics</p>
          </div>
          <p className="mt-2 text-[13px] text-ink-muted">COI on file · Travel 11–16 Jun · Final timeline due 21 May</p>
        </div>
      </aside>

      <section className="flex min-h-[560px] flex-col rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(26,28,30,0.04),0_12px_32px_rgba(26,28,30,0.06)]">
        <header className="border-b border-border px-6 py-4">
          <div className="flex flex-wrap gap-2">{tabBtn("timeline", "Timeline")}{tabBtn("thread", "By thread")}{tabBtn("tasks", "Tasks")}{tabBtn("files", "Files")}</div>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {tab === "timeline" ? (
            <>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Thread · Timeline v3</p>
                <div className="mt-3 rounded-2xl border border-border/80 bg-canvas/60 p-4">
                  <p className="text-[12px] text-ink-faint">Planner · 09:14</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink">
                    Sharing v3 of the run-of-show. Please confirm photography coverage for the rehearsal toast at 19:40.
                  </p>
                </div>
              </div>
              {draftPending ? (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">You · Draft (pending approval)</p>
                  <div className="mt-3 rounded-2xl border border-dashed border-accent/40 bg-accent/5 p-4">
                    <p className="text-[14px] leading-relaxed text-ink">{DRAFT_DEFAULT}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[12px] font-semibold">
                      <button type="button" className="rounded-full bg-accent px-3 py-1.5 text-white" onClick={approveDraft}>
                        Approve & send
                      </button>
                      <button type="button" className="rounded-full border border-border px-3 py-1.5 text-ink-muted" onClick={editDraftInComposer}>
                        Edit in composer
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="rounded-xl border border-border bg-canvas px-4 py-3 text-[13px] text-ink-muted">No pending drafts. Open the composer to draft a new reply.</p>
              )}
            </>
          ) : null}

          {tab === "thread" ? (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Thread · elena@rossiplans.it</p>
                <div className="mt-2 space-y-2 rounded-2xl border border-border bg-canvas/60 p-4 text-[13px] text-ink-muted">
                  <p className="font-semibold text-ink">Timeline v3 + vendor meals</p>
                  <p>3 messages · last activity today</p>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Thread · sofia@email.com</p>
                <div className="mt-2 space-y-2 rounded-2xl border border-border bg-canvas/60 p-4 text-[13px] text-ink-muted">
                  <p className="font-semibold text-ink">Welcome & mood references</p>
                  <p>5 messages · last activity last week</p>
                </div>
              </div>
            </div>
          ) : null}

          {tab === "tasks" ? (
            <ul className="space-y-2 text-[13px]">
              <li className="flex items-center gap-3 rounded-xl border border-border bg-canvas px-3 py-2">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-accent" />
                <span>Send 6-week questionnaire</span>
              </li>
              <li className="flex items-center gap-3 rounded-xl border border-border bg-canvas px-3 py-2">
                <input type="checkbox" className="h-4 w-4 accent-accent" />
                <span>Confirm final floor plan PDF from planner</span>
              </li>
              <li className="flex items-center gap-3 rounded-xl border border-border bg-canvas px-3 py-2">
                <input type="checkbox" className="h-4 w-4 accent-accent" />
                <span>Upload COI to venue portal</span>
              </li>
            </ul>
          ) : null}

          {tab === "files" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-canvas px-3 py-2">
                <Paperclip className="h-4 w-4 text-ink-faint" />
                <div>
                  <p className="text-[13px] font-semibold text-ink">timeline_v3.pdf</p>
                  <p className="text-[12px] text-ink-faint">248 KB · from planner</p>
                </div>
              </div>
              <button type="button" className="text-[12px] font-semibold text-accent hover:text-accent-hover" onClick={() => showToast("Upload dialog would open here (demo).")}>
                + Add file
              </button>
            </div>
          ) : null}
        </div>

        <footer className="border-t border-border px-6 py-4">
          <div className="rounded-2xl border border-border bg-canvas px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Composer</p>
            <p className="mt-2 text-[13px] text-ink-muted">
              Reply, reply all, internal note, or request an AI draft—everything routes through the same approval queue.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-canvas" onClick={() => openComposer("reply")}>
                Open composer
              </button>
              <button type="button" className="rounded-full border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-ink" onClick={() => openComposer("internal")}>
                Internal note
              </button>
            </div>
          </div>
        </footer>
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-faint">Story so far</p>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">{w.story}</p>
          <button type="button" disabled={summaryBusy} className="mt-4 text-[12px] font-semibold text-accent hover:text-accent-hover disabled:opacity-50" onClick={regenerateSummary}>
            {summaryBusy ? "Regenerating…" : "Regenerate summary"}
          </button>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-faint">Attachments</p>
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-canvas px-3 py-2">
            <Paperclip className="h-4 w-4 text-ink-faint" />
            <div>
              <p className="text-[13px] font-semibold text-ink">timeline_v3.pdf</p>
              <p className="text-[12px] text-ink-faint">248 KB</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-dashed border-border bg-canvas/70 p-4 text-[13px] text-ink-muted">
          <p className="font-semibold text-ink">Other weddings</p>
          <p className="mt-2">Jump between projects without losing context.</p>
          <div className="mt-3 flex flex-col gap-2 text-[13px] font-semibold text-accent">
            <Link to="/wedding/santorini" className="hover:text-accent-hover">Amelia & James</Link>
            <Link to="/wedding/london" className="hover:text-accent-hover">Priya & Daniel</Link>
          </div>
        </div>
      </aside>

      {composerOpen ? (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-ink/35 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-label="Composer">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-faint">{composerKind === "internal" ? "Internal note" : "Email composer"}</p>
                <p className="mt-1 text-[15px] font-semibold text-ink">{w.couple}</p>
              </div>
              <button type="button" className="rounded-full p-2 text-ink-faint hover:bg-canvas hover:text-ink" aria-label="Close composer" onClick={() => setComposerOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {composerKind === "reply" ? (
              <div className="mt-4 space-y-3">
                <label className="block text-[12px] font-semibold text-ink-muted">
                  To
                  <input value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-canvas px-3 py-2 text-[13px] text-ink" />
                </label>
                <label className="block text-[12px] font-semibold text-ink-muted">
                  Cc <span className="font-normal text-ink-faint">(optional)</span>
                  <input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="assistant@studio.com" className="mt-1 w-full rounded-xl border border-border bg-canvas px-3 py-2 text-[13px] text-ink" />
                </label>
                <label className="block text-[12px] font-semibold text-ink-muted">
                  Subject
                  <input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-canvas px-3 py-2 text-[13px] text-ink" />
                </label>
                <label className="block text-[12px] font-semibold text-ink-muted">
                  Message
                  <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className="mt-1 w-full resize-y rounded-xl border border-border bg-canvas px-3 py-2 text-[13px] leading-relaxed text-ink" />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="inline-flex items-center gap-2 rounded-full border border-border bg-canvas px-4 py-2 text-[13px] font-semibold text-ink hover:border-accent/40" onClick={requestAiDraft}>
                    <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.75} />
                    Request AI draft
                  </button>
                  <button type="button" className="inline-flex items-center gap-2 rounded-full border border-border bg-canvas px-4 py-2 text-[13px] font-semibold text-ink hover:border-accent/40" onClick={() => showToast("Attachment picker (demo).")}>
                    <ClipIcon className="h-4 w-4" strokeWidth={1.75} />
                    Attach file
                  </button>
                </div>
                <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                  <button type="button" className="rounded-full px-4 py-2 text-[13px] font-semibold text-ink-muted hover:text-ink" onClick={() => setComposerOpen(false)}>
                    Cancel
                  </button>
                  <button type="button" className="rounded-full bg-accent px-5 py-2 text-[13px] font-semibold text-white hover:bg-accent-hover" onClick={sendComposer}>
                    Submit for approval
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="text-[13px] text-ink-muted">Visible only to your studio — never emailed to clients.</p>
                <textarea value={internalBody} onChange={(e) => setInternalBody(e.target.value)} rows={6} placeholder="e.g. Call planner about second shooter add-on…" className="w-full resize-y rounded-xl border border-blush/50 bg-blush/10 px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint" />
                <div className="flex flex-wrap justify-end gap-2">
                  <button type="button" className="rounded-full px-4 py-2 text-[13px] font-semibold text-ink-muted" onClick={() => setComposerOpen(false)}>
                    Cancel
                  </button>
                  <button type="button" className="rounded-full bg-ink px-5 py-2 text-[13px] font-semibold text-canvas" onClick={sendComposer}>
                    Save note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
