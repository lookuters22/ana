import { describe, expect, it } from "vitest";
import { getOperatorAnaLlmProviderConfig } from "./operatorAnaLlmProviderConfig.ts";

function envOf(entries: Record<string, string | undefined>) {
  return { get: (k: string) => entries[k] };
}

describe("getOperatorAnaLlmProviderConfig", () => {
  it("defaults to openai and gpt-4o-mini", () => {
    expect(getOperatorAnaLlmProviderConfig(envOf({}))).toEqual({
      provider: "openai",
      model: "gpt-4o-mini",
    });
  });

  it("selects google with gemini-2.5-flash by default", () => {
    expect(getOperatorAnaLlmProviderConfig(envOf({ ANA_LLM_PROVIDER: "google" }))).toEqual({
      provider: "google",
      model: "gemini-2.5-flash",
    });
  });

  it("treats unknown ANA_LLM_PROVIDER as openai", () => {
    expect(getOperatorAnaLlmProviderConfig(envOf({ ANA_LLM_PROVIDER: "azure" }))).toEqual({
      provider: "openai",
      model: "gpt-4o-mini",
    });
  });

  it("ANA_LLM_MODEL overrides the default for the active provider", () => {
    expect(
      getOperatorAnaLlmProviderConfig(
        envOf({ ANA_LLM_PROVIDER: "google", ANA_LLM_MODEL: "gemini-2.5-flash-lite" }),
      ),
    ).toEqual({ provider: "google", model: "gemini-2.5-flash-lite" });
    expect(getOperatorAnaLlmProviderConfig(envOf({ ANA_LLM_MODEL: "gpt-4o" }))).toEqual({
      provider: "openai",
      model: "gpt-4o",
    });
  });
});
