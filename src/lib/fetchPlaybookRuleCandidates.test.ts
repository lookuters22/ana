import { describe, expect, it, vi } from "vitest";
import { fetchPlaybookRuleCandidates } from "./fetchPlaybookRuleCandidates";

describe("fetchPlaybookRuleCandidates", () => {
  it("returns rows ordered query and maps error message", async () => {
    const order = vi.fn().mockResolvedValue({
      data: [
        {
          id: "c1",
          created_at: "2026-01-01T00:00:00Z",
          topic: "Flash policy",
          proposed_action_key: "no_flash",
          proposed_instruction: "No on-camera flash in church.",
          proposed_decision_mode: "forbidden",
          proposed_scope: "global",
          proposed_channel: null,
          review_status: "candidate",
          wedding_id: null,
          promoted_to_playbook_rule_id: null,
          operator_resolution_summary: "Ana proposal",
          source_classification: { source: "operator_studio_assistant", v: 1 },
        },
      ],
      error: null,
    });
    const select = vi.fn(() => ({ order }));
    const supabase = { from: vi.fn(() => ({ select })) } as never;

    const out = await fetchPlaybookRuleCandidates(supabase);
    expect(supabase.from).toHaveBeenCalledWith("playbook_rule_candidates");
    expect(select).toHaveBeenCalled();
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(out.error).toBeNull();
    expect(out.rows).toHaveLength(1);
    expect(out.rows[0]!.topic).toBe("Flash policy");
  });

  it("returns empty rows and error when Supabase errors", async () => {
    const supabase = {
      from: () => ({
        select: () => ({
          order: async () => ({ data: null, error: { message: "rls denied" } }),
        }),
      }),
    } as never;
    const out = await fetchPlaybookRuleCandidates(supabase);
    expect(out.rows).toEqual([]);
    expect(out.error).toBe("rls denied");
  });
});
