import { describe, expect, it } from "vitest";
import {
  extractOperatorInboxThreadLookupSignals,
  extractOperatorThreadTitleSearchToken,
  hasOperatorThreadMessageBodyLookupIntent,
  hasOperatorThreadMessageLookupIntent,
  querySuggestsCommercialOrNonWeddingInboundFocus,
} from "./operatorAssistantThreadMessageLookupIntent.ts";

describe("hasOperatorThreadMessageBodyLookupIntent", () => {
  it("is true for body-level / meaning questions", () => {
    expect(hasOperatorThreadMessageBodyLookupIntent("What did they say in the email?")).toBe(true);
    expect(hasOperatorThreadMessageBodyLookupIntent("What is this thread about?")).toBe(true);
    expect(hasOperatorThreadMessageBodyLookupIntent("What does the message say?")).toBe(true);
    expect(hasOperatorThreadMessageBodyLookupIntent("What do they want?")).toBe(true);
    expect(hasOperatorThreadMessageBodyLookupIntent("Summarize the email")).toBe(true);
  });

  it("is false for title-only / logistics phrasing", () => {
    expect(hasOperatorThreadMessageBodyLookupIntent("Did they send an email too?")).toBe(false);
    expect(hasOperatorThreadMessageBodyLookupIntent("What is the package price?")).toBe(false);
  });
});

describe("hasOperatorThreadMessageLookupIntent", () => {
  it("is true for email / thread / last activity phrasing", () => {
    expect(hasOperatorThreadMessageLookupIntent("Did they send an email too?")).toBe(true);
    expect(hasOperatorThreadMessageLookupIntent("When did we last email Rita and James?")).toBe(true);
    expect(hasOperatorThreadMessageLookupIntent("What is the latest thread activity?")).toBe(true);
  });

  it("is true when body-level intent matches (widens thread retrieval)", () => {
    expect(hasOperatorThreadMessageLookupIntent("What did they say in the email?")).toBe(true);
  });

  it("is false for generic CRM that should not load thread rows", () => {
    expect(hasOperatorThreadMessageLookupIntent("What is the package price?")).toBe(false);
    expect(hasOperatorThreadMessageLookupIntent("Where is Settings?")).toBe(false);
  });
});

describe("extractOperatorThreadTitleSearchToken", () => {
  it("picks a longest non-stopword token (tie-break lexicographic) for bounded title search", () => {
    // Longest tokens tie at length 8; lexicographic tie-break picks "campaign" before "skincare".
    expect(extractOperatorThreadTitleSearchToken("What about the skincare campaign inquiry?")).toBe("campaign");
  });

  it("ignores generic inbox phrasing and prefers a substantive token (e.g. skincare)", () => {
    expect(
      extractOperatorThreadTitleSearchToken(
        "i received a phone call from somebody today regarding a skincare shoot, did they maybe send an email too?",
      ),
    ).toBe("skincare");
  });
});

describe("querySuggestsCommercialOrNonWeddingInboundFocus", () => {
  it("is true for skincare / brand / campaign style operator questions", () => {
    expect(
      querySuggestsCommercialOrNonWeddingInboundFocus(
        "phone call about a skincare brand campaign — any email?",
      ),
    ).toBe(true);
  });

  it("is false for plain wedding inquiry phrasing", () => {
    expect(querySuggestsCommercialOrNonWeddingInboundFocus("What is the inquiry for Elena and Marco?")).toBe(
      false,
    );
  });
});

describe("extractOperatorInboxThreadLookupSignals", () => {
  it("extracts topic keywords, sender name after from, and today recency", () => {
    const s = extractOperatorInboxThreadLookupSignals(
      "I got a call today from Miki Zmajce — did they send an email about the skincare brand inquiry?",
    );
    expect(s.recency).toBe("today");
    expect(s.senderPhrases.some((p) => p.includes("miki"))).toBe(true);
    expect(s.topicKeywords).toContain("skincare");
    expect(s.topicKeywords).toContain("inquiry");
  });

  it("extracts yesterday and multiple topic terms without broadening to generic words", () => {
    const s = extractOperatorInboxThreadLookupSignals("Yesterday did Rita email about the venue deposit?");
    expect(s.recency).toBe("yesterday");
    expect(s.topicKeywords).toContain("venue");
    expect(s.topicKeywords).toContain("deposit");
    expect(s.topicKeywords.some((k) => k === "email")).toBe(false);
  });

  it("for fuzzy commercial inbound wording, keeps topical keywords and drops generic inbox tokens", () => {
    const s = extractOperatorInboxThreadLookupSignals(
      "i received a phone call from somebody today regarding a skincare shoot, did they maybe send an email too?",
    );
    expect(s.recency).toBe("today");
    expect(s.topicKeywords).toContain("skincare");
    expect(s.topicKeywords).toContain("shoot");
    expect(s.topicKeywords.some((k) => k === "regarding" || k === "question" || k === "project")).toBe(false);
    expect(s.topicKeywords.some((k) => k === "received" || k === "somebody" || k === "maybe")).toBe(false);
  });
});
