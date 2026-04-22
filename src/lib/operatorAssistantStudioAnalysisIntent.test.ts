import { describe, expect, it } from "vitest";
import { shouldLoadStudioAnalysisSnapshotForQuery } from "./operatorAssistantStudioAnalysisIntent.ts";

describe("shouldLoadStudioAnalysisSnapshotForQuery (Slice 12)", () => {
  it("returns true for clear studio / pricing / data analysis questions", () => {
    expect(shouldLoadStudioAnalysisSnapshotForQuery("Should I raise my package prices for next year?")).toBe(true);
    expect(shouldLoadStudioAnalysisSnapshotForQuery("Are we undercharging compared to our average contract?")).toBe(
      true,
    );
    expect(shouldLoadStudioAnalysisSnapshotForQuery("Which packages convert best in our pipeline?")).toBe(true);
    expect(shouldLoadStudioAnalysisSnapshotForQuery("What does our recent data suggest about revenue?")).toBe(true);
  });

  it("matches natural first- and second-person studio pricing analysis (not only “are we …”)", () => {
    expect(shouldLoadStudioAnalysisSnapshotForQuery("Are we undercharging?")).toBe(true);
    expect(shouldLoadStudioAnalysisSnapshotForQuery("Am I undercharging?")).toBe(true);
    expect(shouldLoadStudioAnalysisSnapshotForQuery("Is my pricing too low?")).toBe(true);
    expect(shouldLoadStudioAnalysisSnapshotForQuery("Am I charging enough for weddings?")).toBe(true);
  });

  it("returns true for Slice 12 hardening phrases (data / conversion / patterns)", () => {
    expect(shouldLoadStudioAnalysisSnapshotForQuery("What does the data say about our bookings?")).toBe(true);
    expect(shouldLoadStudioAnalysisSnapshotForQuery("How are my inquiries converting lately?")).toBe(true);
    expect(shouldLoadStudioAnalysisSnapshotForQuery("What am I charging most often?")).toBe(true);
    expect(shouldLoadStudioAnalysisSnapshotForQuery("What patterns do you see in my pipeline?")).toBe(true);
    expect(shouldLoadStudioAnalysisSnapshotForQuery("Summary of my studio revenue")).toBe(true);
  });

  it("returns false for normal CRM / app / chit-chat (regression)", () => {
    expect(shouldLoadStudioAnalysisSnapshotForQuery("hi")).toBe(false);
    expect(shouldLoadStudioAnalysisSnapshotForQuery("Where do I find drafts in the app?")).toBe(false);
    expect(shouldLoadStudioAnalysisSnapshotForQuery("What is the venue for this project?")).toBe(false);
    expect(shouldLoadStudioAnalysisSnapshotForQuery("What patterns do you see in the app settings?")).toBe(false);
    expect(shouldLoadStudioAnalysisSnapshotForQuery("Should I refinance my mortgage this year?")).toBe(false);
  });
});
