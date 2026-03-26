import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, CalendarClock, ClipboardPen, Inbox, ListTodo, Sparkles } from "lucide-react";

const attention: {
  title: string;
  count: number;
  hint: string;
  to: string;
  Icon: LucideIcon;
  /** Soft fill + icon color—differentiates rows without heavy left rails */
  iconWell: string;
}[] = [
  {
    title: "Unfiled messages",
    count: 2,
    hint: "Link threads to the right wedding to keep timelines clean.",
    to: "/inbox?filter=unfiled",
    Icon: Inbox,
    iconWell: "bg-[#e01e5a]/[0.09] text-[#b01238]",
  },
  {
    title: "Drafts awaiting approval",
    count: 2,
    hint: "Review tone before anything reaches a planner or couple.",
    to: "/approvals",
    Icon: ClipboardPen,
    iconWell: "bg-accent/12 text-accent",
  },
  {
    title: "Tasks due today",
    count: 1,
    hint: "Questionnaire reminder for Villa Cetinale.",
    to: "/tasks",
    Icon: ListTodo,
    iconWell: "bg-[#5c6b2e]/10 text-[#4a5a24]",
  },
];

const upcoming = [
  {
    couple: "Sofia & Marco",
    when: "Sat, Jun 14 · Lake Como",
    stage: "Booked",
    balance: "Balance · €4,200",
    id: "lake-como",
  },
  {
    couple: "Amelia & James",
    when: "Sat, Jul 5 · Santorini",
    stage: "Contract out",
    balance: "Retainer received",
    id: "santorini",
  },
  {
    couple: "Priya & Daniel",
    when: "Sep 20 · London",
    stage: "Inquiry",
    balance: "Proposal pending",
    id: "london",
  },
];

export function TodayPage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-ink-muted">Wednesday, 25 March</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink md:text-[28px]">
            Good morning, Elena
          </h1>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-muted">
            Your command center for inquiries, approvals, and what is next in the calendar—without opening your inbox blind.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/wedding/lake-como"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-[13px] font-medium text-ink shadow-sm transition hover:border-accent/30 hover:shadow-md"
          >
            <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.75} />
            Open featured wedding
          </Link>
          <Link
            to="/inbox"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-white shadow-sm transition hover:bg-accent-hover"
          >
            <Inbox className="h-4 w-4" strokeWidth={1.75} />
            Review inbox
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-ink">Needs attention</h2>
            <span className="text-[12px] text-ink-faint">Prioritized for today</span>
          </div>
          <div className="grid gap-3">
            {attention.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="group flex items-start gap-4 rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(26,28,30,0.04),0_12px_32px_rgba(26,28,30,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(26,28,30,0.06)]"
              >
                <div
                  className={
                    "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl " + item.iconWell
                  }
                >
                  <item.Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold text-ink">{item.title}</p>
                    <span className="rounded-full bg-canvas px-2 py-0.5 text-[11px] font-semibold text-ink-muted">
                      {item.count}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{item.hint}</p>
                </div>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-ink-faint transition group-hover:text-ink" />
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-ink">Upcoming weddings</h2>
            <Link to="/calendar" className="text-[12px] font-medium text-accent hover:text-accent-hover">
              View calendar
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-1 shadow-[0_1px_2px_rgba(26,28,30,0.04),0_12px_32px_rgba(26,28,30,0.06)]">
            {upcoming.map((w, i) => (
              <Link
                key={w.id}
                to={`/wedding/${w.id}`}
                className={
                  "flex items-center justify-between gap-4 px-4 py-4 transition hover:bg-canvas/80 " +
                  (i < upcoming.length - 1 ? "border-b border-border/80" : "")
                }
              >
                <div>
                  <p className="text-[14px] font-semibold text-ink">{w.couple}</p>
                  <p className="mt-1 flex items-center gap-2 text-[13px] text-ink-muted">
                    <CalendarClock className="h-4 w-4 text-ink-faint" strokeWidth={1.5} />
                    {w.when}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex rounded-full bg-canvas px-2.5 py-1 text-[11px] font-semibold text-ink-muted">
                    {w.stage}
                  </span>
                  <p className="mt-2 text-[12px] text-ink-faint">{w.balance}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
