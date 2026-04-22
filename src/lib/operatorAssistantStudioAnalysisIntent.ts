/**
 * Deterministic gate: load bounded studio-analysis snapshot (tenant CRM) only for clear analytical questions.
 * Operator assistant only; not fuzzy classification.
 */
export function shouldLoadStudioAnalysisSnapshotForQuery(queryText: string): boolean {
  const t = queryText.trim().toLowerCase();
  if (t.length < 8) return false;

  // Light chat / navigation-only — avoid loading expensive aggregates.
  if (/^(hi|hello|hey|thanks|thank you|ok|okay)[\s!.?]*$/i.test(t)) return false;

  const patterns: RegExp[] = [
    /\bwhat\s+does\s+the\s+data\s+say\b/,
    /\bwhat\s+do\s+the\s+(data|numbers)\s+say\b/,
    /\bhow\s+are\s+my\s+inquir(y|ies)\s+convert/i,
    /\binquir(y|ies)\s+(are\s+)?convert/i,
    /\bwhat\s+am\s+i\s+charging\s+most\s+often\b/,
    /\bmost\s+(common|frequent|booked)\s+package\b/,
    /\bwhat\s+patterns?\s+do\s+you\s+see\b[^?.!]{0,120}\b(bookings?|projects?|pipeline|studio|data|crm)\b/,
    /\bpatterns?\s+in\s+my\s+(bookings?|projects?|pipeline)\b/,
    /\bsummary\s+of\s+(my\s+)?(bookings?|pipeline|revenue|studio)\b/i,
    /\b(should|ought)\b[^?.!]{0,80}\b(prices?|pricing|rates?|fees?|packages?|charging)\b/,
    // Studio pricing vs CRM data: "we" / "I" / "my …" phrasing — still requires studio-price vocabulary below; not generic finance.
    /\b(?:(are|am|is)\s+we|am\s+i|is\s+my|are\s+my)\b[^?.!]{0,80}\b(undercharging|overcharging|under-?chargin\w*|over-?chargin\w*|charging enough|competitive|too high|too low)\b/,
    /\b(raise|lower|increase|decrease|cut)\b[^?.!]{0,40}\b(prices?|pricing|rates?|fees?|packages?|our rates?)\b/,
    /\bwhich\s+package|package(?:es)?\s+that|packages?\s+convert|conversion|convert(?:s|ed)?\s+best|funnel|pipeline (stats|mix|stages?)|by stage|stage distribution|stage mix\b/,
    /\b(average|median|typical|mean)\b[^?.!]{0,60}\b(contract|revenue|fee|pric|balance|booking)\b/,
    /\b(recent|our) data|data (say|suggest|show|tells?)|evidence (from|in) (our|the studio)|worth it for|financially|margin|\brevenue\b|profit|\broi\b/,
    /\b(under-?selling|leaving money|discount(ed)? too (much|often)|too (cheap|expensive))\b/,
    /\bdestination|local (vs?|versus)|travel|multi-?day (event|gig|shoot)\b[^?.!]{0,80}\b(worth|profit|revenue|margin|us)\b/,
    /\bproject type mix|wedding(s)? vs|portrait|commercial|editorial|mix of projects\b/,
    /\bhow(\'s|s)\b[^?.!]{0,40}business|studio performance|studio doing\b/,
  ];

  return patterns.some((r) => r.test(t));
}
