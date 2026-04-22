import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export type PlaybookRuleCandidateListRow = Pick<
  Database["public"]["Tables"]["playbook_rule_candidates"]["Row"],
  | "id"
  | "created_at"
  | "topic"
  | "proposed_action_key"
  | "proposed_instruction"
  | "proposed_decision_mode"
  | "proposed_scope"
  | "proposed_channel"
  | "review_status"
  | "wedding_id"
  | "promoted_to_playbook_rule_id"
  | "operator_resolution_summary"
  | "source_classification"
>;

const SELECT_COLUMNS = [
  "id",
  "created_at",
  "topic",
  "proposed_action_key",
  "proposed_instruction",
  "proposed_decision_mode",
  "proposed_scope",
  "proposed_channel",
  "review_status",
  "wedding_id",
  "promoted_to_playbook_rule_id",
  "operator_resolution_summary",
  "source_classification",
].join(", ");

/**
 * Tenant-scoped list for the operator dashboard (RLS on `photographer_id`).
 * Newest first.
 */
export async function fetchPlaybookRuleCandidates(
  supabase: SupabaseClient<Database>,
): Promise<{ rows: PlaybookRuleCandidateListRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from("playbook_rule_candidates")
    .select(SELECT_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) {
    return { rows: [], error: error.message };
  }
  return { rows: (data ?? []) as PlaybookRuleCandidateListRow[], error: null };
}
