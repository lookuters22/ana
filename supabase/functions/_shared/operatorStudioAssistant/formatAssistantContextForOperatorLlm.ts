/**
 * Bounded text serialization of {@link AssistantContext} for operator-only LLM prompts.
 * Not used by reply-in-thread / persona paths.
 */
import type {
  AssistantContext,
  AssistantFocusedProjectFacts,
  AssistantFocusedProjectSummary,
  AssistantOperatorStateSummary,
  AssistantPlaybookCoverageSummary,
  AssistantStudioAnalysisSnapshot,
} from "../../../../src/types/assistantContext.types.ts";
import { EMPTY_ASSISTANT_PLAYBOOK_COVERAGE_SUMMARY } from "../../../../src/lib/deriveAssistantPlaybookCoverageSummary.ts";
import {
  hasOperatorThreadMessageLookupIntent,
  querySuggestsCommercialOrNonWeddingInboundFocus,
} from "../../../../src/lib/operatorAssistantThreadMessageLookupIntent.ts";
import {
  displayTitleLabel,
  keyPeopleSectionTitle,
  primaryDateLabel,
  projectTypeFramingLine,
} from "./projectTypeOperatorFraming.ts";
import { formatCarryForwardBlockForLlm } from "./operatorAssistantCarryForward.ts";

const MAX_PLAYBOOK_RULES = 24;
const MAX_PLAYBOOK_INSTRUCTION_CHARS = 400;
const MAX_MEMORY_SNIPPETS = 8;
const MAX_MEMORY_SNIPPET_CHARS = 320;
const MAX_KB_ROWS = 5;
const MAX_KB_CONTENT_CHARS = 500;
const MAX_STORY_NOTES_CHARS = 400;
const MAX_PACKAGE_INCLUSIONS_LISTED = 12;
/** Catalog JSON includes procedural workflows; keep a ceiling in case the module grows. */
const MAX_APP_CATALOG_JSON_CHARS = 20000;
/** Studio analysis snapshot JSON — bounded for prompt budget. */
const MAX_STUDIO_ANALYSIS_JSON_CHARS = 12000;
const MAX_PLAYBOOK_COVERAGE_TOPIC_LIST_CHARS = 900;
const MAX_PLAYBOOK_COVERAGE_KEY_LIST_CHARS = 900;
const MAX_PLAYBOOK_COVERAGE_KEYWORD_LINE_CHARS = 2000;
const MAX_PLAYBOOK_COVERAGE_TOPICS_IN_TABLE = 16;

export type FormatAssistantContextForOperatorLlmOptions = {
  /**
   * When set (non-null string), a deterministically fetched Open-Meteo weather block for this question.
   * `null`/`undefined` = no weather section.
   */
  weatherToolMarkdown?: string | null;
};

function clip(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}...`;
}

function formatFocusedProjectSummaryBlock(s: AssistantFocusedProjectSummary): string {
  const lines: string[] = [];
  lines.push(
    "*(**Summary / pointer only** — not full CRM. For venue, package, money, story, people, contact points, and task/draft/escalation counts, call the read-only tool **operator_lookup_project_details** with this **projectId**.)*",
  );
  lines.push("");
  lines.push(`- **projectId:** \`${s.projectId}\``);
  lines.push(`- **projectType:** ${s.projectType || "—"}`);
  lines.push(`- **stage:** ${s.stage || "—"}`);
  lines.push(`- **displayTitle:** ${s.displayTitle || "—"}`);
  return lines.join("\n");
}

function formatFocusedProjectFactsBlock(f: AssistantFocusedProjectFacts): string {
  const lines: string[] = [];
  const pt = f.project_type.trim() || "other";
  lines.push(
    `(Structured CRM project row (table \`weddings\`, id \`${f.weddingId}\`) + linked tables — not inferred memory or KB.)`,
  );
  lines.push("");
  lines.push(`- ${projectTypeFramingLine(pt)}`);
  if (f.couple_names.trim()) {
    lines.push(`- **${displayTitleLabel(pt)}:** ${f.couple_names}`);
  }
  if (f.stage.trim()) lines.push(`- **Stage:** ${f.stage}`);
  if (f.wedding_date) {
    lines.push(`- **${primaryDateLabel(pt)}:** ${f.wedding_date}`);
  }
  if (f.event_start_date || f.event_end_date) {
    const start = f.event_start_date ?? "";
    const end = f.event_end_date ?? "";
    if (start && end) lines.push(`- **Event window:** ${start} → ${end}`);
    else lines.push(`- **Event window:** ${start || end}`);
  }
  if (f.location.trim()) lines.push(`- **Venue / location:** ${f.location}`);
  if (f.package_name) lines.push(`- **Package:** ${f.package_name}`);
  if (f.contract_value != null) lines.push(`- **Contract value:** ${f.contract_value}`);
  if (f.balance_due != null) lines.push(`- **Balance due:** ${f.balance_due}`);
  if (f.package_inclusions.length > 0) {
    const listed = f.package_inclusions.slice(0, MAX_PACKAGE_INCLUSIONS_LISTED);
    lines.push(`- **Package inclusions:** ${listed.join("; ")}`);
  }
  if (f.story_notes?.trim()) {
    lines.push(`- **Story / notes (clipped):** ${clip(f.story_notes, MAX_STORY_NOTES_CHARS)}`);
  }
  lines.push(
    `- **Counts (tenant-scoped):** open tasks: ${f.counts.openTasks}; open escalations: ${f.counts.openEscalations}; pending-approval drafts (linked threads): ${f.counts.pendingApprovalDrafts}`,
  );
  if (f.people.length > 0) {
    lines.push(`- **${keyPeopleSectionTitle(pt)}:**`);
    for (const p of f.people) {
      const tag = p.is_primary_contact ? " (primary contact)" : "";
      lines.push(
        `  - ${p.display_name} — ${p.role_label} [${p.kind}]${tag} — \`${p.person_id}\``,
      );
    }
  }
  if (f.contactPoints.length > 0) {
    lines.push("- **Contact points (subset):**");
    for (const c of f.contactPoints) {
      const tag = c.is_primary ? " (primary)" : "";
      lines.push(
        `  - ${c.kind}: ${c.value_raw}${tag} — person \`${c.person_id}\``,
      );
    }
  }
  return lines.join("\n");
}

function formatOperatorStateSummary(s: AssistantOperatorStateSummary): string {
  const lines: string[] = [];
  lines.push(
    "(**Read-only snapshot** — same sources as the operator Today / Zen feed. Use for “what’s waiting / urgent / what next”; **do not invent** queue items. Suggest, don’t assert sends.)",
  );
  lines.push("");
  lines.push("### Counts");
  const c = s.counts;
  lines.push(
    `- **Pending-approval drafts:** ${c.pendingApprovalDrafts} · **Open tasks:** ${c.openTasks} · **Open escalations:** ${c.openEscalations} · **Linked open leads (pre-booking):** ${c.linkedOpenLeads}`,
  );
  lines.push(
    `- **Unlinked (inbox bucket — all unlinked in projection):** inquiry ${c.unlinked.inquiry}; needs filing ${c.unlinked.needsFiling}; operator review ${c.unlinked.operatorReview}; suppressed ${c.unlinked.suppressed}`,
  );
  lines.push(
    `- **Zen tabs (escalations + operator-review unfiled → Review; drafts → Drafts; inquiries + open leads → Leads; other unfiled needs filing → Needs filing; tasks are not in a tab):** Review ${c.zenTabs.review}; Drafts ${c.zenTabs.drafts}; Leads ${c.zenTabs.leads}; Needs filing ${c.zenTabs.needs_filing}`,
  );
  lines.push("");
  lines.push("### Recent samples (titles; no message bodies)");
  if (s.samples.topActions.length > 0) {
    lines.push("**By recency (mixed):**");
    for (const a of s.samples.topActions) {
      lines.push(`  - [${a.typeLabel}] ${a.title} — \`${a.id}\``);
    }
  } else {
    lines.push("**By recency (mixed):** (none)");
  }
  if (s.samples.openEscalations.length > 0) {
    lines.push("**Escalations:**");
    for (const e of s.samples.openEscalations) {
      lines.push(`  - \`${e.actionKey}\` — ${e.title} — \`${e.id}\``);
    }
  }
  if (s.samples.pendingDrafts.length > 0) {
    lines.push("**Pending drafts:**");
    for (const d of s.samples.pendingDrafts) {
      lines.push(`  - ${d.title} — ${d.subtitle || "—"} — \`${d.id}\``);
    }
  }
  if (s.samples.openTasks.length > 0) {
    lines.push("**Open tasks (by due date):**");
    for (const t of s.samples.openTasks) {
      lines.push(`  - ${t.title} (due ${t.dueDate}) — ${t.subtitle ?? "—"} — \`${t.id}\``);
    }
  }
  lines.push("");
  lines.push(`*Snapshot time: \`${s.fetchedAt}\` (ISO). ${s.sourcesNote}*`);
  return lines.join("\n");
}

function formatPlaybookCoverageSummaryForOperatorLlm(ctx: AssistantContext): string {
  const c: AssistantPlaybookCoverageSummary =
    ctx.playbookCoverageSummary ?? EMPTY_ASSISTANT_PLAYBOOK_COVERAGE_SUMMARY;
  const lines: string[] = [];
  lines.push("## Playbook coverage summary (effective rules — read-only aggregate)");
  lines.push(
    "*(**Topics, keys, scopes,** and light **token** hints from active `playbook_rules` after **authorized case exception** merge. The numbered-style **Playbook** block below is still the authoritative instruction text — do not paraphrase rules from this section alone.)*",
  );
  lines.push("");
  lines.push(`- **Total active rules (dataset for this build):** ${c.totalActiveRules} *(detailed list below is capped at ${MAX_PLAYBOOK_RULES} lines for prompt budget.)*`);
  lines.push(
    `- **Distinct topics (${c.uniqueTopics.length}):** ${clip(
      c.uniqueTopics.length ? c.uniqueTopics.map((t) => `\`${t}\``).join(", ") : "(none)",
      MAX_PLAYBOOK_COVERAGE_TOPIC_LIST_CHARS,
    )}`,
  );
  lines.push(
    `- **Distinct action keys (${c.uniqueActionKeys.length}):** ${clip(
      c.uniqueActionKeys.length ? c.uniqueActionKeys.map((k) => `\`${k}\``).join(", ") : "(none)",
      MAX_PLAYBOOK_COVERAGE_KEY_LIST_CHARS,
    )}`,
  );
  if (c.rulesWithCaseException > 0) {
    lines.push(`- **Rules with an active case-exception overlay:** ${c.rulesWithCaseException}`);
  }
  lines.push(
    `- **Scopes:** ${c.scopes.length ? c.scopes.join(", ") : "(none)"} · **Channels:** ${c.channels.length ? c.channels.join(", ") : "(none)"} · **Decision modes:** ${c.decisionModes.length ? c.decisionModes.join(", ") : "(none)"}`,
  );
  lines.push(
    `- **Source types:** ${c.sourceTypes.length ? c.sourceTypes.join(", ") : "(none)"} · **Confidence labels:** ${c.confidenceLabels.length ? c.confidenceLabels.join(", ") : "(none)"}`,
  );
  if (c.topicCounts.length > 0) {
    lines.push("- **Rules per topic (when topic field is set):**");
    for (const row of c.topicCounts.slice(0, MAX_PLAYBOOK_COVERAGE_TOPICS_IN_TABLE)) {
      lines.push(`  - \`${row.topic}\`: ${row.count}`);
    }
    if (c.topicCounts.length > MAX_PLAYBOOK_COVERAGE_TOPICS_IN_TABLE) {
      lines.push(
        `  - *(…omitted ${c.topicCounts.length - MAX_PLAYBOOK_COVERAGE_TOPICS_IN_TABLE} more topic row(s) in this sub-list — full counts are in structured context.)*`,
      );
    }
  }
  if (c.actionKeyTokenHints.length > 0) {
    lines.push(
      `- **Action-key word hints** (from \`action_key\` segments, e.g. \`wedding_travel\` → \`wedding\`, \`travel\`): ${c.actionKeyTokenHints.join(", ")}`,
    );
  }
  if (c.coverageKeywordHints.length > 0) {
    lines.push(
      `- **Content keyword hints (from topic + instruction text; high-frequency, capped, not a full taxonomy):** ${clip(
        c.coverageKeywordHints.join(", "),
        MAX_PLAYBOOK_COVERAGE_KEYWORD_LINE_CHARS,
      )}`,
    );
  }
  return lines.join("\n");
}

function shouldPrioritizeInboxThreadEvidence(ctx: AssistantContext): boolean {
  if (!ctx.operatorThreadMessageLookup.didRun) return false;
  if (ctx.operatorThreadMessageLookup.selectionNote.includes("inbox_scored")) return true;
  return querySuggestsCommercialOrNonWeddingInboundFocus(ctx.queryText);
}

function formatMatchedEntitiesForOperatorLlm(ctx: AssistantContext): string | null {
  const e = ctx.operatorQueryEntityResolution;
  if (!e.didRun) return null;
  const hasPeople = e.personMatches.length > 0;
  const hasBoost = e.queryResolvedProjectFacts != null;
  const sameAsFocus =
    e.weddingSignal === "unique" &&
    e.uniqueWeddingId != null &&
    e.uniqueWeddingId === ctx.focusedWeddingId;
  if (e.weddingSignal === "none" && !hasPeople && !hasBoost) return null;

  const lines: string[] = [];
  lines.push("## Matched entities / likely project matches");
  lines.push(
    "*(Read-only, deterministic — recent `weddings` + `people` index only, tenant-bounded. Not inbox/message history, not all-time search.)*",
  );
  lines.push("");
  if (
    hasOperatorThreadMessageLookupIntent(ctx.queryText) &&
    querySuggestsCommercialOrNonWeddingInboundFocus(ctx.queryText)
  ) {
    lines.push(
      "- **Inbound kind:** The operator may mean a **commercial / non-wedding** inquiry — treat **Recent thread & email activity** (below or above) as primary evidence; do not assume wedding-couple CRM semantics unless thread rows show a `wedding` id matching a named project.",
    );
    lines.push("");
  }
  lines.push(`- **Wedding / project match signal:** \`${e.weddingSignal}\``);
  if (e.uniqueWeddingId) {
    lines.push(`- **Query-resolved wedding id:** \`${e.uniqueWeddingId}\``);
  }
  if (sameAsFocus) {
    lines.push(
      "- **Note:** The query names the **same project** as the **Focused project (summary)** block above; use **operator_lookup_project_details** for full CRM (not duplicated here).",
    );
  }
  if (e.weddingSignal === "ambiguous" && e.weddingCandidates.length > 0) {
    lines.push("- **Plausible projects (ask which one, or disambiguate using these fields):**");
    for (const c of e.weddingCandidates) {
      const date = c.wedding_date ?? "—";
      const loc = c.location.trim() ? c.location : "—";
      lines.push(
        `  - **${c.couple_names}** — stage: ${c.stage}; date: ${date}; location: ${loc}; type: ${c.project_type} — \`${c.weddingId}\``,
      );
    }
  }
  if (e.personMatches.length > 0) {
    lines.push("- **People rows whose `display_name` plausibly matches the query (bounded list):**");
    for (const p of e.personMatches) {
      lines.push(`  - ${p.display_name} (${p.kind}) — \`${p.id}\``);
    }
  }
  if (e.queryResolvedProjectFacts) {
    lines.push("### Query-resolved project facts (from database, best match to this question)");
    lines.push(
      "*(**projectType** is on the first fact line — **Slice 5**; use it for non-wedding-safe wording; do not treat this as a wedding by default.)*",
    );
    lines.push(formatFocusedProjectFactsBlock(e.queryResolvedProjectFacts));
  }
  return lines.join("\n");
}

function formatInquiryCountSnapshotForOperatorLlm(ctx: AssistantContext): string | null {
  const s = ctx.operatorInquiryCountSnapshot;
  if (!s.didRun) return null;
  const lines: string[] = [];
  lines.push("## Inquiry counts / comparisons (read-only, UTC windows)");
  lines.push(
    "*(**First client inbound** per thread — `messages.direction=in` min time — filtered to pre-booking inquiry semantics. Not total messages; not studio-local timezone in this pass.)*",
  );
  lines.push("");
  lines.push(`- **Computed at:** \`${s.computedAt}\` · ${s.timezoneNote}`);
  lines.push(`- **Semantics:** ${clip(s.semanticsNote, 600)}`);
  if (s.truncated) {
    lines.push(
      "- **Caution:** Row cap hit; counts may be **undercounts**. Increase cap only with care; this is not a data warehouse path.",
    );
  }
  lines.push("");
  const w = s.windows;
  lines.push("### Counts (side-by-side for comparisons)");
  lines.push(
    `- **Today:** ${w.today.count} — ${w.today.label} — bounds \`${w.today.startIso}\` … \`${w.today.endIso}\` `,
  );
  lines.push(
    `- **Yesterday:** ${w.yesterday.count} — ${w.yesterday.label} — bounds \`${w.yesterday.startIso}\` … \`${w.yesterday.endIso}\` `,
  );
  lines.push(
    `- **This week (so far, Mon → now):** ${w.thisWeek.count} — ${w.thisWeek.label} — from \`${w.thisWeek.startIso}\` through \`${w.thisWeek.endIso}\` `,
  );
  lines.push(
    `- **Last week (full ISO week):** ${w.lastWeek.count} — ${w.lastWeek.label} — \`${w.lastWeek.startIso}\` … \`${w.lastWeek.endIso}\` `,
  );
  if (s.comparison.todayMinusYesterday != null) {
    const d = s.comparison.todayMinusYesterday;
    const tag = d > 0 ? "more" : d < 0 ? "fewer" : "same";
    lines.push("");
    lines.push(
      `- **Today vs yesterday (today − yesterday):** ${d >= 0 ? "+" : ""}${d} — **${tag}** inquiries than yesterday (same semantics as above).`,
    );
  }
  return lines.join("\n");
}

function formatOperatorCalendarSnapshotForOperatorLlm(ctx: AssistantContext): string | null {
  const s = ctx.operatorCalendarSnapshot;
  if (!s.didRun) return null;
  const lines: string[] = [];
  lines.push("## Calendar lookup (read-only, `calendar_events`)");
  lines.push(
    "*(**This studio’s database events only** — not Google Calendar or other externals. **No writes** from this context: you cannot create, move, or delete events. **Tasks are not calendar events.** Summarize what is listed; if empty, say so.)*",
  );
  lines.push("");
  lines.push(`- **Lookup mode:** \`${s.lookupMode}\``);
  lines.push(`- **Lookup basis:** ${clip(s.lookupBasis, 600)}`);
  lines.push(`- **Time window:** \`${s.windowStartIso}\` … \`${s.windowEndIso}\` — ${s.windowLabel}`);
  if (s.weddingFilter) {
    const cn = s.weddingFilter.coupleNames?.trim() ? s.weddingFilter.coupleNames : "—";
    lines.push(`- **Wedding / project filter:** **${clip(cn, 80)}** — \`${s.weddingFilter.weddingId}\``);
  }
  if (s.titleContains) {
    lines.push(`- **Title contains (case-insensitive):** “${clip(s.titleContains, 80)}”`);
  }
  if (s.eventTypeFilter && s.eventTypeFilter.length > 0) {
    lines.push(`- **Event types filter:** ${s.eventTypeFilter.map((t) => `\`${t}\``).join(", ")}`);
  }
  lines.push(
    `- **Row budget:** up to **${s.maxRows}** rows · returned **${s.rowCountReturned}**`,
  );
  lines.push(`- **Computed at:** \`${s.computedAt}\` · ${s.timeZoneNote}`);
  lines.push(`- **Semantics:** ${clip(s.semanticsNote, 500)}`);
  if (s.truncated) {
    lines.push(
      "- **Caution:** Row cap hit — additional matching events may exist outside this list.",
    );
  }
  if (s.events.length === 0) {
    lines.push("");
    lines.push("- **Events in window:** (none)");
  } else {
    lines.push("");
    lines.push(s.orderAscending === false ? "### Events (most recent first)" : "### Events (chronological)");
    for (const e of s.events) {
      const who = e.coupleNames != null && e.coupleNames.trim() ? e.coupleNames : "—";
      const wtag = e.weddingId != null ? ` — wedding \`${e.weddingId}\`` : "";
      lines.push(
        `- **${clip(e.title, 200)}** (${e.eventTypeLabel}) — start \`${e.startTime}\` end \`${e.endTime}\` — project: **${clip(who, 80)}**${wtag} — id \`${e.id}\``,
      );
    }
  }
  return lines.join("\n");
}

function formatThreadMessageLookupForOperatorLlm(ctx: AssistantContext): string | null {
  const t = ctx.operatorThreadMessageLookup;
  if (!t.didRun) return null;
  const lines: string[] = [];
  lines.push("## Recent thread & email activity (read-only, bounded)");
  lines.push(
    "*(Deterministic `threads` rows — last activity / inbound / outbound times from the database. **Envelope only:** subject/title, channel, kind, timestamps, thread id — **not** message bodies, snippets, or sender text. **Do not** summarize “what the email is about” from the title alone; if asked for body-level content, say it is not in this view and point the operator to Inbox / the thread. Not a search over all history.)*",
  );
  lines.push("");
  if (
    querySuggestsCommercialOrNonWeddingInboundFocus(ctx.queryText) ||
    t.selectionNote.includes("inbox_scored")
  ) {
    lines.push(
      "- **Interpretation:** “Inquiry” can be **wedding**, **commercial**, or other inbound — **unlinked** threads (`wedding: —`) are normal for brand/campaign leads; answer from thread titles/timestamps unless CRM rows clearly name the same project.",
    );
    lines.push("");
  }
  lines.push(`- **Selection:** ${clip(t.selectionNote, 500)}`);
  if (t.threads.length === 0) {
    lines.push("- **Matching threads in this window:** (none)");
  } else {
    lines.push("- **Threads (compare inbound vs outbound times for “did they email / when did we last write”):**");
    for (const row of t.threads) {
      const wid = row.weddingId != null ? `\`${row.weddingId}\`` : "—";
      const li = row.lastInboundAt != null ? row.lastInboundAt : "—";
      const lo = row.lastOutboundAt != null ? row.lastOutboundAt : "—";
      lines.push(
        `  - **${clip(row.title, 200)}** — channel: ${row.channel}; kind: ${row.kind} — wedding: ${wid} — last activity: ${row.lastActivityAt} — last inbound: ${li} — last outbound: ${lo} — thread \`${row.threadId}\``,
      );
    }
  }
  return lines.join("\n");
}

function formatStudioAnalysisSnapshotBlock(s: AssistantStudioAnalysisSnapshot): string {
  const lines: string[] = [];
  lines.push(
    "(**Read-only — this studio’s CRM `weddings` rows** in a rolling window, plus **open task** and **open escalation** counts. **Not** competitors, **not** market benchmarks. If `projectCount` is small, treat trends as **low confidence**.)",
  );
  lines.push("");
  lines.push("```json");
  lines.push(clip(JSON.stringify(s), MAX_STUDIO_ANALYSIS_JSON_CHARS));
  lines.push("```");
  return lines.join("\n");
}

/**
 * Produces compact markdown-style blocks for the model (deterministic ordering).
 */
export function formatAssistantContextForOperatorLlm(
  ctx: AssistantContext,
  options?: FormatAssistantContextForOperatorLlmOptions,
): string {
  const parts: string[] = [];
  const weatherMd = options?.weatherToolMarkdown;

  parts.push("## Operator question");
  parts.push(clip(ctx.queryText, 8000));
  parts.push("");

  if (typeof weatherMd === "string" && weatherMd.trim().length > 0) {
    parts.push("## Weather lookup (external tool — Open-Meteo)");
    parts.push(
      "The block below is **read from Open-Meteo** (geocoding + short-range **forecast** only). It is not CRM data. " +
        "**Cite the source** when you summarize. **Never invent** temperatures, conditions, or probabilities that are not listed. " +
        "If the block says the lookup was not run, failed, is outside the forecast window, or is for a **past** date, say so honestly; do not substitute guessed weather.",
    );
    parts.push(clip(weatherMd, 6000));
    parts.push("");
  }

  parts.push("## Effective scope");
  parts.push(`- Studio (tenant): ${ctx.photographerId}`);
  parts.push(`- Focused wedding (validated): ${ctx.focusedWeddingId ?? "none"}`);
  parts.push(`- Focused person (validated): ${ctx.focusedPersonId ?? "none"}`);
  parts.push("");

  if (ctx.carryForward) {
    parts.push(formatCarryForwardBlockForLlm(ctx.carryForward));
    parts.push("");
  }

  const matched = formatMatchedEntitiesForOperatorLlm(ctx);
  const threadLookupMd = formatThreadMessageLookupForOperatorLlm(ctx);
  const inboxFirst = shouldPrioritizeInboxThreadEvidence(ctx);

  if (inboxFirst && threadLookupMd) {
    parts.push(threadLookupMd);
    parts.push("");
  }

  if (matched) {
    parts.push(matched);
    parts.push("");
  }

  if (ctx.studioAnalysisSnapshot != null) {
    parts.push("## Studio analysis snapshot (from this studio’s data)");
    parts.push(formatStudioAnalysisSnapshotBlock(ctx.studioAnalysisSnapshot));
    parts.push("");
  }

  if (ctx.includeAppCatalogInOperatorPrompt) {
    parts.push("## App help / navigation (in-repo catalog — authoritative for *this* app only)");
    parts.push(
      "For **where to find** something, **how to** do something in the product, or **what a status/label means**, use **only** the JSON object below. " +
        "For **procedural** questions, match **`APP_PROCEDURAL_WORKFLOWS`** by `id` and follow `steps` in order, quoting control labels (e.g. **Edit**, **Save**, **Has draft**) exactly as listed. " +
        "Respect `groundingConfidence`: **`high`** = full steps are fine; **`medium`** = keep guidance high-level and do not fabricate sub-controls or tab names. " +
        "For surfaces that are **not** built, use **`APP_WORKFLOW_HONESTY_NOTES`** and state the gap honestly. " +
        "**Quote** `path` values, dock `label` strings, and left-rail labels **exactly** as in the JSON. " +
        "If the question is about **generic software** (browsers, Git, other apps) or the catalog has no matching entry, say briefly you only help with **this** studio app and suggest **Settings** or **Onboarding** — **do not invent** UI.",
    );
    parts.push("```json");
    parts.push(clip(ctx.appCatalog.catalogJson, MAX_APP_CATALOG_JSON_CHARS));
    parts.push("```");
    parts.push(`*Catalog UTF-8 size: ${ctx.appCatalog.serializedUtf8Bytes} bytes, format v${ctx.appCatalog.version}.*`);
  } else {
    parts.push("## App help / navigation");
    parts.push(
      "*(Full in-repo app catalog **not** included for this question — the query was not treated as app-navigation, label, or in-product “where/how” help.)* " +
        "**Do not invent** routes, tab names, or status labels. If the user needs UI navigation or label meanings, they can ask in those terms; otherwise use playbook, memory, operator state, and CRM context above.",
    );
  }
  parts.push("");

  parts.push("## Operator state (Today / Inbox — read-only snapshot)");
  parts.push(formatOperatorStateSummary(ctx.operatorStateSummary));
  parts.push("");

  if (!inboxFirst && threadLookupMd) {
    parts.push(threadLookupMd);
    parts.push("");
  }

  const inquirySnap = formatInquiryCountSnapshotForOperatorLlm(ctx);
  if (inquirySnap) {
    parts.push(inquirySnap);
    parts.push("");
  }

  const calendarSnap = formatOperatorCalendarSnapshotForOperatorLlm(ctx);
  if (calendarSnap) {
    parts.push(calendarSnap);
    parts.push("");
  }

  if (ctx.focusedProjectSummary) {
    parts.push("## Focused project (summary — call operator_lookup_project_details for specifics)");
    parts.push(formatFocusedProjectSummaryBlock(ctx.focusedProjectSummary));
    parts.push("");
  }

  parts.push(formatPlaybookCoverageSummaryForOperatorLlm(ctx));
  parts.push("");

  parts.push("## Playbook (effective rules - authoritative over memory)");
  const rules = ctx.playbookRules.slice(0, MAX_PLAYBOOK_RULES);
  if (rules.length === 0) {
    parts.push("(no active rules returned)");
  } else {
    for (const r of rules) {
      const line = `- **${r.action_key}** (${r.topic}): ${clip(r.instruction ?? "", MAX_PLAYBOOK_INSTRUCTION_CHARS)}`;
      parts.push(line);
    }
  }
  parts.push("");

  parts.push("## Durable memory (supporting - titles/summaries; may be incomplete)");
  const mem = ctx.selectedMemories.slice(0, MAX_MEMORY_SNIPPETS);
  if (mem.length === 0) {
    parts.push("(none selected)");
  } else {
    for (const m of mem) {
      parts.push(
        `- **${m.title}** (${m.type}): ${clip(`${m.summary}\n${m.full_content ?? ""}`, MAX_MEMORY_SNIPPET_CHARS)}`,
      );
    }
  }
  parts.push("");

  parts.push("## Global knowledge excerpts (tenant KB - supporting)");
  const kb = ctx.globalKnowledge.slice(0, MAX_KB_ROWS);
  if (kb.length === 0) {
    parts.push("(none retrieved)");
  } else {
    for (const row of kb) {
      const r = row as Record<string, unknown>;
      const dt = String(r.document_type ?? "");
      const content = clip(String(r.content ?? ""), MAX_KB_CONTENT_CHARS);
      parts.push(`- **${dt}**: ${content}`);
    }
  }
  parts.push("");

  // Slice 4: do not render recent digest rows — they competed with the project tool path. `ctx.crmDigest` may still be loaded for compatibility.
  parts.push("## CRM digest (omitted in prompt — Slice 4)");
  parts.push(
    "*(**Slice 4** — the bounded **recent projects & people** list is **not** included in this prompt, so a project is **not** “in your Context” just because it is active in the studio. For **project-specific** CRM, follow **Project CRM — resolver vs detail (Slice 3)** in the system prompt and use **operator_lookup_projects** / **operator_lookup_project_details**. For **queue / what’s on my plate**, rely on **Operator state (Today / Inbox)** and the rest of the Context blocks, not a static digest list.)*",
  );
  parts.push("");

  parts.push("## Retrieval debug");
  parts.push("```json");
  parts.push(
    JSON.stringify({
      fingerprint: ctx.retrievalLog.queryDigest.fingerprint,
      scopesQueried: ctx.retrievalLog.scopesQueried,
      appCatalogUtf8Bytes: ctx.appCatalog.serializedUtf8Bytes,
      appCatalogInPrompt: ctx.includeAppCatalogInOperatorPrompt,
      studioAnalysisInPrompt: ctx.studioAnalysisSnapshot != null,
      studioAnalysisProjectCount: ctx.retrievalLog.studioAnalysisProjectCount,
      selectedMemoryIds: ctx.retrievalLog.selectedMemoryIds,
      globalKnowledgeRowCount: ctx.retrievalLog.globalKnowledgeRowCount,
      focus: ctx.retrievalLog.focus,
      entityResolution: ctx.retrievalLog.entityResolution,
      threadMessageLookup: ctx.retrievalLog.threadMessageLookup,
      inquiryCountSnapshot: ctx.retrievalLog.inquiryCountSnapshot,
      calendarSnapshot: ctx.retrievalLog.calendarSnapshot,
      readOnlyLookupTools: ctx.retrievalLog.readOnlyLookupTools,
      playbookCoverage: ctx.retrievalLog.playbookCoverage,
    }),
  );
  parts.push("```");

  return parts.join("\n");
}
