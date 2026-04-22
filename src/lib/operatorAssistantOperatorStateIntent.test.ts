import { describe, expect, it } from "vitest";
import { hasOperatorQueueStateIntent } from "./operatorAssistantOperatorStateIntent.ts";

describe("hasOperatorQueueStateIntent", () => {
  it.each([
    "What's waiting for me?",
    "What is urgent right now?",
    "What should I do next?",
    "What needs my attention in the studio?",
    "What's on my plate today?",
    "Anything waiting in my inbox?",
    "How busy am I today?",
    "Where should I start with the inbox?",
  ])("matches %s", (q) => {
    expect(hasOperatorQueueStateIntent(q)).toBe(true);
  });

  it("does not steal pure inquiry-count analytics questions", () => {
    expect(hasOperatorQueueStateIntent("How many new inquiries did we get today vs yesterday?")).toBe(false);
  });

  it("is false for bare greetings and app-help style questions", () => {
    expect(hasOperatorQueueStateIntent("Hi Ana")).toBe(false);
    expect(hasOperatorQueueStateIntent("Where do I find drafts?")).toBe(false);
  });
});
