/**
 * Minimal Gemini (Generative Language API) adapter for Operator Ana — JSON text completions only.
 * Does not implement function/tool calling; callers must not pass tool-role messages.
 */

export type GeminiContent = { role: "user" | "model"; parts: Array<{ text: string }> };

type OpenAiStyleMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: unknown[] }
  | { role: "tool"; tool_call_id: string; content: string };

export function splitSystemAndGeminiContents(messages: OpenAiStyleMessage[]): {
  systemInstruction: string;
  contents: GeminiContent[];
} {
  let systemInstruction = "";
  const contents: GeminiContent[] = [];
  for (const m of messages) {
    if (m.role === "system") {
      systemInstruction = m.content;
      continue;
    }
    if (m.role === "user") {
      contents.push({ role: "user", parts: [{ text: m.content }] });
      continue;
    }
    if (m.role === "assistant") {
      if (m.tool_calls && Array.isArray(m.tool_calls) && m.tool_calls.length > 0) {
        throw new Error(
          "Gemini Ana path does not support assistant messages with tool_calls; use OpenAI for tool rounds.",
        );
      }
      contents.push({ role: "model", parts: [{ text: m.content ?? "" }] });
      continue;
    }
    if (m.role === "tool") {
      throw new Error(
        "Gemini Ana path does not support tool-role messages; use OpenAI for read-only lookup tools.",
      );
    }
  }
  return { systemInstruction, contents };
}

/** Extracts concatenated text from a `generateContent` JSON body (tests + runtime). */
export function extractGeminiGenerateContentText(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const cands = (data as { candidates?: unknown }).candidates;
  if (!Array.isArray(cands) || cands.length === 0) return "";
  const parts = (cands[0] as { content?: { parts?: unknown } })?.content?.parts;
  if (!Array.isArray(parts)) return "";
  let out = "";
  for (const p of parts) {
    if (p && typeof p === "object" && "text" in p && typeof (p as { text: unknown }).text === "string") {
      out += (p as { text: string }).text;
    }
  }
  return out;
}

export async function postGeminiGenerateContentJson(params: {
  apiKey: string;
  model: string;
  systemInstruction: string;
  contents: GeminiContent[];
  temperature?: number;
  maxOutputTokens?: number;
  signal?: AbortSignal;
}): Promise<string> {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(params.model)}:generateContent` +
    `?key=${encodeURIComponent(params.apiKey)}`;
  const body = {
    systemInstruction: { parts: [{ text: params.systemInstruction }] },
    contents: params.contents,
    generationConfig: {
      temperature: params.temperature ?? 0.25,
      maxOutputTokens: params.maxOutputTokens ?? 1600,
      responseMimeType: "application/json",
    },
  };
  const res = await fetch(url, {
    method: "POST",
    signal: params.signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }
  const json = (await res.json()) as unknown;
  const text = extractGeminiGenerateContentText(json).trim();
  if (!text) {
    throw new Error("Gemini returned empty text content");
  }
  return text;
}
