/**
 * Deterministic gate for whether the operator-assistant prompt should embed the full app catalog JSON.
 * Narrow, keyword/regex based — not fuzzy ML classification.
 */

/** UI / nav vocabulary: if present with a guarded "where is/are", treat as app-help. */
const APP_SURFACE_TOKEN =
  /\b(in the app|in atelier|in the studio app|in the dashboard|in this app|user interface|left rail|navigation dock|ana routing|quick filter|dock|sidebar|tab|page|screen|section|menu|settings|onboarding|inbox|pipeline|today|calendar|workspace|directory|drafts?|escalations?|approvals?|zen|offer builder|pricing calculator|has draft|needs filing|operator review|unfiled|planner|studio tools|tasks?)\b/;

/**
 * "Where is the venue?" is CRM / project truth (Slice 3 tools), not B9. Exclude similar fact lookups
 * when the question uses where-is / where-are or where-can-I-**see** style phrasing.
 */
const CRM_LOCATION_OR_FACT_SUBJECT =
  /\b(venue|package|balance|contract|deposit|invoice|quote|ceremony|reception|wedding date|story notes?|contact points?|that thread|this thread|the thread|message body|email from|sender)\b/;

function whereIsAreAppNavigation(q: string): boolean {
  if (!/\bwhere\s+(is|are)\b/.test(q)) return false;
  if (CRM_LOCATION_OR_FACT_SUBJECT.test(q)) return false;
  return APP_SURFACE_TOKEN.test(q);
}

export function shouldIncludeAppCatalogInOperatorPrompt(queryText: string): boolean {
  const q = queryText.trim().toLowerCase();
  if (q.length === 0) return false;

  if (/\bwhere\s+(do\s+i|can\s+i|should\s+i|did)\b/.test(q)) {
    if (/\b(find|see|check|look)\b/.test(q) && CRM_LOCATION_OR_FACT_SUBJECT.test(q)) return false;
    return true;
  }

  if (whereIsAreAppNavigation(q)) return true;

  if (/\bhow\s+do\s+i\b/.test(q)) return true;
  if (/\bhow\s+can\s+i\b/.test(q)) return true;
  if (/\bhow\s+to\s+(find|open|get\s+to|navigate|use|go\s+to)\b/.test(q)) return true;

  if (/\b(which|what)\s+(tab|page|route|section|menu|screen|view|label)\b/.test(q)) return true;

  if (/\bwhat\s+(does|do)\b[^?.!\n]*\bmean\b/.test(q)) return true;
  if (/\bwhat\s+is\s+(the\s+)?(needs filing|operator review|inquiry|draft|escalation|zen|pipeline)\b/.test(q)) {
    return true;
  }
  if (/\bwhat(?:'s|s)\s+(needs filing|operator review|inquiry|drafts)\b/.test(q)) return true;

  if (/\bshow\s+me\s+how\s+to\b/.test(q)) return true;
  if (/\bwalk\s+me\s+through\b/.test(q) && APP_SURFACE_TOKEN.test(q)) return true;
  if (/\btake\s+me\s+to\b/.test(q)) return true;
  if (/\bnavigate\s+to\b/.test(q)) return true;
  if (/\bopen\s+(the\s+)?(settings|inbox|pipeline|today|calendar|workspace|directory|offer\s+builder)\b/.test(q)) {
    return true;
  }

  if (/\b(this app|in the app|the app|in the studio app|in atelier|the ui|user interface|left rail|navigation dock|ana routing)\b/.test(q)) {
    if (/\b(find|open|go to|go|where|how|navigate|tab|page|menu|settings|onboarding|dock|sidebar|rail|click|section)\b/.test(q)) {
      return true;
    }
  }

  if (/\b(ana routing|left rail|navigation dock|inbox bucket|zen tab|app help|in-repo catalog)\b/.test(q)) {
    return true;
  }

  return false;
}
