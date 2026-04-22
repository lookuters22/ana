import { describe, expect, it } from "vitest";
import { shouldIncludeAppCatalogInOperatorPrompt } from "./operatorAssistantAppHelpIntent.ts";

describe("shouldIncludeAppCatalogInOperatorPrompt", () => {
  it("is false for empty and generic workflow questions", () => {
    expect(shouldIncludeAppCatalogInOperatorPrompt("")).toBe(false);
    expect(shouldIncludeAppCatalogInOperatorPrompt("What’s urgent?")).toBe(false);
    expect(shouldIncludeAppCatalogInOperatorPrompt("Any open tasks?")).toBe(false);
  });

  it("is false for CRM fact lookups (Slice 3 tools), not app navigation", () => {
    expect(shouldIncludeAppCatalogInOperatorPrompt("Where is the venue for this project?")).toBe(false);
    expect(shouldIncludeAppCatalogInOperatorPrompt("Where can I see the package name?")).toBe(false);
    expect(shouldIncludeAppCatalogInOperatorPrompt("Where do I find the balance due?")).toBe(false);
  });

  it("is true for where/how UI navigation phrasing", () => {
    expect(shouldIncludeAppCatalogInOperatorPrompt("Where do I find drafts?")).toBe(true);
    expect(shouldIncludeAppCatalogInOperatorPrompt("How do I open Settings?")).toBe(true);
    expect(shouldIncludeAppCatalogInOperatorPrompt("Which tab has the pipeline?")).toBe(true);
  });

  it("is true for guarded where is/are when the subject is a UI surface", () => {
    expect(shouldIncludeAppCatalogInOperatorPrompt("Where is the Settings page?")).toBe(true);
    expect(shouldIncludeAppCatalogInOperatorPrompt("Where are my tasks in the app?")).toBe(true);
  });

  it("is true for extended navigation phrasing", () => {
    expect(shouldIncludeAppCatalogInOperatorPrompt("How can I get to the pipeline?")).toBe(true);
    expect(shouldIncludeAppCatalogInOperatorPrompt("Show me how to open Today")).toBe(true);
    expect(shouldIncludeAppCatalogInOperatorPrompt("Navigate to the inbox")).toBe(true);
    expect(shouldIncludeAppCatalogInOperatorPrompt("Take me to workspace")).toBe(true);
    expect(shouldIncludeAppCatalogInOperatorPrompt("Walk me through the inbox quick filters")).toBe(true);
  });

  it("is true for label / status meaning questions", () => {
    expect(shouldIncludeAppCatalogInOperatorPrompt("What does Needs filing mean?")).toBe(true);
    expect(shouldIncludeAppCatalogInOperatorPrompt("What is operator review?")).toBe(true);
  });
});
