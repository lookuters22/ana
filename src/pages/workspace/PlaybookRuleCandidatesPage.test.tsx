// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PlaybookRuleCandidatesPage } from "./PlaybookRuleCandidatesPage";

vi.mock("@/lib/supabase", () => ({
  supabase: {},
}));

const fetchMock = vi.fn();

vi.mock("@/lib/fetchPlaybookRuleCandidates", () => ({
  fetchPlaybookRuleCandidates: (...args: unknown[]) => fetchMock(...args),
}));

describe("PlaybookRuleCandidatesPage", () => {
  beforeEach(() => {
    fetchMock.mockResolvedValue({ rows: [], error: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("shows empty state when no candidates", async () => {
    render(
      <MemoryRouter>
        <PlaybookRuleCandidatesPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText(/No rule candidates yet/i)).toBeDefined();
    });
  });

  it("renders candidate topic and pending copy", async () => {
    fetchMock.mockResolvedValue({
      rows: [
        {
          id: "id-1",
          created_at: "2026-06-01T12:00:00.000Z",
          topic: "Travel fee",
          proposed_action_key: "travel_fee",
          proposed_instruction: "Always disclose travel in first reply.",
          proposed_decision_mode: "ask_first",
          proposed_scope: "global",
          proposed_channel: null,
          review_status: "candidate",
          wedding_id: null,
          promoted_to_playbook_rule_id: null,
          operator_resolution_summary: "Operator assistant proposal — Travel fee",
          source_classification: { source: "operator_studio_assistant", v: 1 },
        },
      ],
      error: null,
    });
    render(
      <MemoryRouter>
        <PlaybookRuleCandidatesPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText("Travel fee")).toBeDefined();
    });
    expect(screen.getByText(/Always disclose travel/i)).toBeDefined();
    expect(screen.getAllByText(/not active studio rules/i).length).toBeGreaterThanOrEqual(1);
  });
});
