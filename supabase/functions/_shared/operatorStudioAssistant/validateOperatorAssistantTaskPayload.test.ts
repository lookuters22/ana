import { describe, expect, it, vi, afterEach } from "vitest";
import {
  normalizeTaskDueDateForDb,
  tryParseLlmProposedTask,
  validateOperatorAssistantTaskPayload,
} from "./validateOperatorAssistantTaskPayload.ts";

afterEach(() => {
  vi.useRealTimers();
});

describe("validateOperatorAssistantTaskPayload (Slice 7)", () => {
  it("validates and normalizes due date to YYYY-MM-DD (UTC calendar)", () => {
    const v = validateOperatorAssistantTaskPayload({
      title: "  Do the thing  ",
      dueDate: "2026-05-20T12:00:00.000Z",
      weddingId: null,
    });
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.value.title).toBe("Do the thing");
      expect(v.value.dueDateNormalized).toBe("2026-05-20");
    }
  });

  it("rejects empty title", () => {
    const v = validateOperatorAssistantTaskPayload({ title: "   ", dueDate: "2026-01-01" });
    expect(v.ok).toBe(false);
  });

  it("defaults missing dueDate to today UTC (safe manager follow-ups)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-04T15:30:00.000Z"));
    const v = validateOperatorAssistantTaskPayload({
      title: "Call venue",
      weddingId: null,
    });
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.value.dueDateNormalized).toBe("2026-07-04");
      expect(v.value.dueDate).toBe("2026-07-04");
    }
  });
});

describe("tryParseLlmProposedTask", () => {
  it("returns not a task for playbook candidates", () => {
    const r = tryParseLlmProposedTask({
      kind: "playbook_rule_candidate",
      proposedActionKey: "x",
      topic: "t",
      proposedInstruction: "i",
      proposedDecisionMode: "auto",
      proposedScope: "global",
    });
    expect(r.ok).toBe(false);
  });

  it("accepts task JSON with title only and defaults dueDate to today UTC", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T08:00:00.000Z"));
    const r = tryParseLlmProposedTask({ kind: "task", title: "Remind me to invoice" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.dueDate).toBe("2026-03-10");
    }
  });
});

describe("normalizeTaskDueDateForDb", () => {
  it("rejects unparseable strings", () => {
    const r = normalizeTaskDueDateForDb("not a date");
    expect(r.ok).toBe(false);
  });
});
