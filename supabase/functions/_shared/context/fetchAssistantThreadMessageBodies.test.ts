import { describe, expect, it } from "vitest";
import {
  fetchAssistantThreadMessageBodies,
  IDLE_ASSISTANT_THREAD_MESSAGE_BODIES,
  MAX_MESSAGE_BODY_CHARS_IN_SNAPSHOT,
  MAX_THREAD_MESSAGES_IN_SNAPSHOT,
} from "./fetchAssistantThreadMessageBodies.ts";

describe("fetchAssistantThreadMessageBodies", () => {
  const tid = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";

  it("returns idle shape for invalid UUID", async () => {
    const supabase = { from: () => ({}) } as never;
    const r = await fetchAssistantThreadMessageBodies(supabase, "p1", "not-a-uuid");
    expect(r).toMatchObject({
      ...IDLE_ASSISTANT_THREAD_MESSAGE_BODIES,
      selectionNote: "invalid_thread_id",
    });
  });

  it("returns thread_not_found_or_denied when row missing", async () => {
    const supabase = {
      from: (table: string) => {
        if (table !== "threads") return {};
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: () => Promise.resolve({ data: null, error: null }),
              }),
            }),
          }),
        };
      },
    } as never;
    const r = await fetchAssistantThreadMessageBodies(supabase, "p1", tid);
    expect(r.didRun).toBe(true);
    expect(r.selectionNote).toBe("thread_not_found_or_denied");
    expect(r.messages).toEqual([]);
  });

  it("loads messages in chronological order with per-body clip flag", async () => {
    const longBody = "x".repeat(MAX_MESSAGE_BODY_CHARS_IN_SNAPSHOT + 40);
    const supabase = {
      from: (table: string) => {
        if (table === "threads") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: () =>
                    Promise.resolve({
                      data: { id: tid, title: "Thread A", photographer_id: "p1" },
                      error: null,
                    }),
                }),
              }),
            }),
          };
        }
        if (table === "messages") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  order: () => ({
                    limit: () =>
                      Promise.resolve({
                        data: [
                          {
                            id: "m2",
                            direction: "out",
                            sender: "studio@x.com",
                            body: "Thanks!",
                            sent_at: "2025-01-02T00:00:00.000Z",
                          },
                          {
                            id: "m1",
                            direction: "in",
                            sender: "c@y.com",
                            body: longBody,
                            sent_at: "2025-01-01T00:00:00.000Z",
                          },
                        ],
                        error: null,
                      }),
                  }),
                }),
              }),
            }),
          };
        }
        return {};
      },
    } as never;

    const r = await fetchAssistantThreadMessageBodies(supabase, "p1", tid);
    expect(r.didRun).toBe(true);
    expect(r.selectionNote).toBe("messages_loaded");
    expect(r.threadTitle).toBe("Thread A");
    expect(r.messages).toHaveLength(2);
    expect(r.messages[0]!.messageId).toBe("m1");
    expect(r.messages[0]!.direction).toBe("in");
    expect(r.messages[0]!.bodyClipped).toBe(true);
    expect(r.messages[0]!.bodyExcerpt.length).toBe(MAX_MESSAGE_BODY_CHARS_IN_SNAPSHOT);
    expect(r.messages[1]!.messageId).toBe("m2");
    expect(r.truncatedOverall).toBe(true);
  });

  it("exports snapshot caps matching product contract", () => {
    expect(MAX_THREAD_MESSAGES_IN_SNAPSHOT).toBe(8);
    expect(MAX_MESSAGE_BODY_CHARS_IN_SNAPSHOT).toBe(900);
  });
});
