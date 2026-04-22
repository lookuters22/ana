import { describe, expect, it } from "vitest";
import { classifyOperatorAnaTriage, type ClassifyOperatorAnaTriageInput } from "./operatorAnaTriage.ts";

const base: ClassifyOperatorAnaTriageInput = {
  queryText: "",
  weddingIdEffective: null,
  carryForward: null,
  entityResolution: { weddingSignal: "none", uniqueWeddingId: null },
};

describe("classifyOperatorAnaTriage", () => {
  it.each([
    {
      name: "clean inquiry-count case",
      input: {
        ...base,
        queryText: "How many new inquiries did we get today vs yesterday?",
      },
      wantPrimary: "inquiry_counts" as const,
      // "inquiries" also matches thread-lookup predicate — secondary reflects that overlap.
      wantSecondary: ["inbox_threads"] as const,
    },
    {
      name: "continuity follow-up inquiry-count case",
      input: {
        ...base,
        queryText: "How many yesterday?",
        carryForward: { lastDomain: "inquiry_counts", ageSeconds: 30 },
      },
      wantPrimary: "inquiry_counts" as const,
      wantSecondary: [] as const,
    },
    {
      name: "clean project CRM case (focused wedding)",
      input: {
        ...base,
        queryText: "What stage is this project in?",
        weddingIdEffective: "w-11111111-1111-1111-1111-111111111111",
      },
      wantPrimary: "project_crm" as const,
      wantSecondary: [] as const,
    },
    {
      name: "clean project CRM case (unique resolver)",
      input: {
        ...base,
        queryText: "What is the venue for the Thorne booking?",
        entityResolution: {
          weddingSignal: "unique",
          uniqueWeddingId: "w-thorne",
        },
      },
      wantPrimary: "project_crm" as const,
      wantSecondary: [] as const,
    },
    {
      name: "clean inbox-thread case",
      input: {
        ...base,
        queryText: "Did they send a follow-up email on this thread?",
      },
      wantPrimary: "inbox_threads" as const,
      wantSecondary: [] as const,
    },
    {
      name: "operator queue / workload primary",
      input: {
        ...base,
        queryText: "What's waiting for me today?",
      },
      wantPrimary: "operator_queue" as const,
      wantSecondary: [] as const,
    },
    {
      name: "operator queue beats inbox_threads when both match",
      input: {
        ...base,
        queryText: "What's urgent in my inbox?",
      },
      wantPrimary: "operator_queue" as const,
      wantSecondary: ["inbox_threads"] as const,
    },
    {
      name: "operator queue with secondary project_crm when focused",
      input: {
        ...base,
        queryText: "What should I focus on next?",
        weddingIdEffective: "w-11111111-1111-1111-1111-111111111111",
      },
      wantPrimary: "operator_queue" as const,
      wantSecondary: ["project_crm"] as const,
    },
    {
      name: "studio analysis primary",
      input: {
        ...base,
        queryText: "What does the data say about our pipeline?",
      },
      wantPrimary: "studio_analysis" as const,
      wantSecondary: [] as const,
    },
    {
      name: "studio analysis with secondary project_crm when focused",
      input: {
        ...base,
        queryText: "What patterns do you see in my bookings?",
        weddingIdEffective: "w-11111111-1111-1111-1111-111111111111",
      },
      wantPrimary: "studio_analysis" as const,
      wantSecondary: ["project_crm"] as const,
    },
    {
      name: "project + inbox mixed case",
      input: {
        ...base,
        queryText: "Did the client send another email on this inquiry?",
        weddingIdEffective: "w-1",
      },
      wantPrimary: "project_crm" as const,
      wantSecondary: ["inbox_threads"] as const,
    },
    {
      name: "ambiguous project case",
      input: {
        ...base,
        queryText: "Is the Como location for Elena or Clara?",
        entityResolution: { weddingSignal: "ambiguous", uniqueWeddingId: null },
      },
      wantPrimary: "unclear" as const,
      wantSecondary: [] as const,
    },
    {
      name: "inquiry beats project + inbox when all match",
      input: {
        ...base,
        queryText:
          "How many inquiries today and did the client email — focused project is open",
        weddingIdEffective: "w-1",
      },
      wantPrimary: "inquiry_counts" as const,
      wantSecondary: ["project_crm", "inbox_threads"] as const,
    },
    {
      name: "fully unclear case",
      input: {
        ...base,
        queryText: "Where is Settings in the app?",
      },
      wantPrimary: "unclear" as const,
      wantSecondary: [] as const,
    },
    {
      name: "inbox still wins over ambiguous when thread intent present",
      input: {
        ...base,
        queryText: "Any reply on the email thread for the Como inquiry?",
        entityResolution: { weddingSignal: "ambiguous", uniqueWeddingId: null },
      },
      wantPrimary: "inbox_threads" as const,
      wantSecondary: [] as const,
    },
  ])("$name", ({ input, wantPrimary, wantSecondary }) => {
    const got = classifyOperatorAnaTriage(input);
    expect(got.primary).toBe(wantPrimary);
    expect([...got.secondary]).toEqual([...wantSecondary]);
    expect(typeof got.reason).toBe("string");
    expect(got.reason.length).toBeGreaterThan(0);
  });
});
