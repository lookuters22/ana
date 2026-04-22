/**
 * Deterministic intent for operator **queue / Today / workload** questions (Slice 3 refinement).
 * Gates prompt emphasis and triage — operator state is still fetched every request for stability.
 */

import { hasOperatorInquiryCountIntent } from "./operatorAssistantInquiryCountIntent.ts";

/**
 * True when the operator is asking what is waiting, urgent, or next — grounded on the Today/Zen snapshot.
 * Excludes pure **inquiry count / analytics** questions (handled by inquiry-count intent).
 */
export function hasOperatorQueueStateIntent(queryText: string): boolean {
  if (hasOperatorInquiryCountIntent(queryText)) return false;

  const s = String(queryText ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  if (s.length < 8) return false;

  if (/\bwhat\s+should\s+i\s+(do|tackle|handle|focus)\s+(next|on|first)\b/.test(s)) return true;
  if (/\bwhat\s+do\s+i\s+(do|tackle|handle|focus)\s+next\b/.test(s)) return true;
  if (/\bwhat\s+to\s+(do|tackle)\s+next\b/.test(s)) return true;
  if (/\bwhat'?s\s+waiting(\s+for\s+me)?\b/.test(s)) return true;
  if (/\bwhat\s+is\s+waiting(\s+for\s+me)?\b/.test(s)) return true;
  if (/\bwhat'?s\s+urgent\b/.test(s)) return true;
  if (/\bwhat\s+is\s+urgent\b/.test(s)) return true;
  if (/\banything\s+urgent\b/.test(s)) return true;
  if (/\b(is\s+there\s+)?anything\s+waiting\b/.test(s)) return true;
  if (/\bwhat\s+needs\s+(my\s+)?attention\b/.test(s)) return true;
  if (/\bwhat\s+needs\s+doing\b/.test(s)) return true;
  if (/\bwhat'?s\s+on\s+my\s+plate\b/.test(s)) return true;
  if (/\b(on\s+my\s+plate|my\s+workload|studio\s+workload)\b/.test(s)) return true;
  if (/\b(work\s+)?queue\b/.test(s) && /\b(what|how|anything|status|look|check)\b/.test(s)) return true;
  if (/\b(backlog|stalled|bottleneck)\b/.test(s) && /\b(inbox|today|draft|lead|task|review|studio)\b/.test(s)) {
    return true;
  }
  if (/\bpriorit(y|ize)\b/.test(s) && /\b(inbox|today|tasks?|drafts?|morning)\b/.test(s)) return true;
  if (/\bhow\s+busy\b/.test(s)) return true;
  if (/\bwhere\s+should\s+i\s+(start|focus)\b/.test(s)) return true;
  if (/\bwhat\s+am\s+i\s+behind\s+on\b/.test(s)) return true;

  return false;
}
