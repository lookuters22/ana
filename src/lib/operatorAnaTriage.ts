/**
 * Slice A2 — deterministic triage v1 for operator Ana (hint + telemetry only; not a fetch gate).
 * Uses existing intent predicates only — no new regex here.
 */

import {
  hasOperatorInquiryCountContinuityIntent,
  hasOperatorInquiryCountIntent,
} from "./operatorAssistantInquiryCountIntent.ts";
import { hasOperatorQueueStateIntent } from "./operatorAssistantOperatorStateIntent.ts";
import { shouldLoadStudioAnalysisSnapshotForQuery } from "./operatorAssistantStudioAnalysisIntent.ts";
import { hasOperatorThreadMessageLookupIntent } from "./operatorAssistantThreadMessageLookupIntent.ts";

export type OperatorAnaTriageDomain =
  | "project_crm"
  | "inbox_threads"
  | "inquiry_counts"
  | "operator_queue"
  | "studio_analysis"
  | "unclear";

export type OperatorAnaTriage = {
  primary: OperatorAnaTriageDomain;
  secondary: readonly Exclude<OperatorAnaTriageDomain, "unclear">[];
  /** Logs / debug only — never render to the LLM. */
  reason: string;
};

export type ClassifyOperatorAnaTriageInput = {
  queryText: string;
  weddingIdEffective: string | null;
  carryForward: { lastDomain: string; ageSeconds: number } | null;
  entityResolution: {
    weddingSignal: "none" | "unique" | "ambiguous";
    uniqueWeddingId: string | null;
  };
};

const LADDER: readonly Exclude<OperatorAnaTriageDomain, "unclear">[] = [
  "inquiry_counts",
  "operator_queue",
  "studio_analysis",
  "project_crm",
  "inbox_threads",
];

/** Default for tests / placeholders when context is stubbed. */
export const IDLE_OPERATOR_ANA_TRIAGE: OperatorAnaTriage = {
  primary: "unclear",
  secondary: [],
  reason: "idle",
};

export function classifyOperatorAnaTriage(input: ClassifyOperatorAnaTriageInput): OperatorAnaTriage {
  const { queryText, weddingIdEffective, carryForward, entityResolution } = input;

  const matchInquiry =
    hasOperatorInquiryCountIntent(queryText) ||
    hasOperatorInquiryCountContinuityIntent(queryText, carryForward);

  const matchProjectCrm =
    weddingIdEffective != null ||
    (entityResolution.weddingSignal === "unique" && entityResolution.uniqueWeddingId != null);

  const matchInbox = hasOperatorThreadMessageLookupIntent(queryText);
  const matchQueue = hasOperatorQueueStateIntent(queryText);
  const matchStudio = shouldLoadStudioAnalysisSnapshotForQuery(queryText);

  const resolverAmbiguous = entityResolution.weddingSignal === "ambiguous";

  const matches: Record<Exclude<OperatorAnaTriageDomain, "unclear">, boolean> = {
    inquiry_counts: matchInquiry,
    operator_queue: matchQueue,
    studio_analysis: matchStudio,
    project_crm: matchProjectCrm,
    inbox_threads: matchInbox,
  };

  let primary: OperatorAnaTriageDomain = "unclear";
  let reason = "no_matching_domain";

  if (matchInquiry) {
    primary = "inquiry_counts";
    reason = "ladder_inquiry_counts";
  } else if (matchQueue) {
    primary = "operator_queue";
    reason = "ladder_operator_queue";
  } else if (matchStudio) {
    primary = "studio_analysis";
    reason = "ladder_studio_analysis";
  } else if (matchProjectCrm) {
    primary = "project_crm";
    reason = "ladder_project_crm";
  } else if (matchInbox) {
    primary = "inbox_threads";
    reason = "ladder_inbox_threads";
  } else if (resolverAmbiguous) {
    primary = "unclear";
    reason = "resolver_ambiguous";
  }

  const secondary: Exclude<OperatorAnaTriageDomain, "unclear">[] = [];
  for (const d of LADDER) {
    if (matches[d] && d !== primary) {
      secondary.push(d);
    }
  }

  return { primary, secondary, reason };
}
