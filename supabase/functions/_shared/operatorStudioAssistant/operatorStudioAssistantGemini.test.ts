import { describe, expect, it } from "vitest";
import {
  extractGeminiGenerateContentText,
  splitSystemAndGeminiContents,
} from "./operatorStudioAssistantGemini.ts";

describe("splitSystemAndGeminiContents", () => {
  it("maps system + user/model turns", () => {
    const { systemInstruction, contents } = splitSystemAndGeminiContents([
      { role: "system", content: "SYS" },
      { role: "user", content: "u1" },
      { role: "assistant", content: "a1" },
      { role: "user", content: "u2" },
    ]);
    expect(systemInstruction).toBe("SYS");
    expect(contents).toEqual([
      { role: "user", parts: [{ text: "u1" }] },
      { role: "model", parts: [{ text: "a1" }] },
      { role: "user", parts: [{ text: "u2" }] },
    ]);
  });

  it("rejects tool messages", () => {
    expect(() =>
      splitSystemAndGeminiContents([
        { role: "system", content: "S" },
        { role: "user", content: "u" },
        { role: "tool", tool_call_id: "x", content: "{}" },
      ]),
    ).toThrow(/tool-role/);
  });
});

describe("extractGeminiGenerateContentText", () => {
  it("concatenates text parts from the first candidate", () => {
    const t = extractGeminiGenerateContentText({
      candidates: [{ content: { parts: [{ text: '{"a":' }, { text: '1}' }] } }],
    });
    expect(t).toBe('{"a":1}');
  });

  it("returns empty string when no candidates", () => {
    expect(extractGeminiGenerateContentText({ candidates: [] })).toBe("");
  });
});
