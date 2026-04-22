/**
 * Slice 12 — bounded read-only aggregates over `weddings` (+ open task/escalation counts) for operator studio analysis. Tenant-scoped.
 */
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import type { AssistantStudioAnalysisSnapshot } from "../../../../src/types/assistantContext.types.ts";

const MONTHS_LOOKBACK = 24;
const MAX_FETCH = 200;
const SAMPLE_IN_PROMPT = 12;

const POST_BOOKED_STAGES = new Set([
  "booked",
  "prep",
  "final_balance",
  "delivered",
]);

/** Pipeline stages before a signed booking (CRM semantics — aligns with PipelineContextList). */
const OPEN_PIPELINE_STAGES = new Set(["inquiry", "consultation", "proposal_sent", "contract_out"]);

function sumStages(dist: Record<string, number>, stages: Set<string>): number {
  let n = 0;
  for (const s of stages) {
    n += dist[s] ?? 0;
  }
  return n;
}

function buildStudioAnalysisEvidenceNotes(input: {
  windowRowsLength: number;
  rawFetchLength: number;
  maxFetch: number;
  monthsBack: number;
  cutoffIso: string;
  stageDistribution: Record<string, number>;
  contractStats: { count: number } | null;
}): string[] {
  const notes: string[] = [];
  notes.push(
    `Rolling window: ${input.monthsBack} months from cutoff **${input.cutoffIso}** (UTC calendar). Up to **${input.maxFetch}** \`weddings\` rows fetched (ordered by \`wedding_date\` desc, nulls last); rows with **no** event date are kept in-window. Older CRM rows may exist outside this batch.`,
  );

  const n = input.windowRowsLength;
  const conf =
    n <= 5
      ? "**Very small** sample — cite counts only; do not imply strong trends, rankings, or “best” packages."
      : n <= 15
        ? "**Small** sample — segment splits are **indicative only**; avoid statistical language."
        : n <= 40
          ? "**Moderate** sample — still no significance claims; stay descriptive."
          : "**Larger** window count — still **this snapshot only**, not guaranteed all-time CRM.";
  notes.push(`Projects in window: **${n}**. ${conf}`);

  const openPipe = sumStages(input.stageDistribution, OPEN_PIPELINE_STAGES);
  const bookedPath = sumStages(input.stageDistribution, POST_BOOKED_STAGES);
  notes.push(
    `Approximate stage buckets (read \`stageDistribution\` for full breakdown): open pipeline **inquiry|consultation|proposal_sent|contract_out** ≈ **${openPipe}**; post-book path **booked|prep|final_balance|delivered** ≈ **${bookedPath}**. Do **not** present a “conversion rate” unless you state it as a **simple ratio of these two counts** and label it **rough**, not cohort-accurate.`,
  );

  notes.push(
    `\`packageMixBooked\` and package averages use **only** rows in stages **${[...POST_BOOKED_STAGES].join(", ")}** — not inquiry-stage quotes.`,
  );

  if (input.contractStats == null) {
    notes.push(
      "No **contract_value** summary: no non-null numeric values on post-booked rows in this window — **do not** invent averages or medians.",
    );
  } else {
    notes.push(
      `Contract min/max/avg use **${input.contractStats.count}** post-booked row(s) with non-null \`contract_value\`.`,
    );
  }

  if (input.rawFetchLength >= input.maxFetch) {
    notes.push(
      `**Fetch cap hit** (${input.maxFetch} rows) — very old projects may be missing from this ordered slice.`,
    );
  }

  return notes;
}

type WeddingRow = {
  id: string;
  couple_names: string;
  stage: string;
  wedding_date: string | null;
  event_start_date: string | null;
  project_type: string;
  package_name: string | null;
  contract_value: number | null;
  balance_due: number | null;
  location: string;
};

function monthCutoff(now: Date): Date {
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCMonth(d.getUTCMonth() - MONTHS_LOOKBACK);
  return d;
}

function effectiveDateForWindow(r: WeddingRow): string | null {
  return (r.wedding_date ?? r.event_start_date) ?? null;
}

function inWindow(r: WeddingRow, cutoff: Date): boolean {
  const ed = effectiveDateForWindow(r);
  if (ed == null) return true;
  const t = new Date(ed + (ed.length <= 10 ? "T12:00:00.000Z" : ""));
  return t >= cutoff;
}

/**
 * Fetches a bounded set of `weddings` for the tenant, filters to a rolling `MONTHS_LOOKBACK` window, and returns aggregates.
 */
export async function fetchAssistantStudioAnalysisSnapshot(
  supabase: SupabaseClient,
  photographerId: string,
  now: Date = new Date(),
): Promise<AssistantStudioAnalysisSnapshot> {
  const cutoff = monthCutoff(now);
  const cutoffIso = cutoff.toISOString().slice(0, 10);

  const { data: raw, error } = await supabase
    .from("weddings")
    .select(
      "id, couple_names, stage, wedding_date, event_start_date, project_type, package_name, contract_value, balance_due, location",
    )
    .eq("photographer_id", photographerId)
    .order("wedding_date", { ascending: false, nullsLast: true })
    .order("id", { ascending: true })
    .limit(MAX_FETCH);

  if (error) {
    throw new Error(`fetchAssistantStudioAnalysisSnapshot weddings: ${error.message}`);
  }

  const rows = (raw ?? []) as unknown as WeddingRow[];
  const windowRows = rows.filter((r) => inWindow(r, cutoff));

  const stageDistribution: Record<string, number> = {};
  for (const r of windowRows) {
    const k = (r.stage ?? "").trim() || "(unknown)";
    stageDistribution[k] = (stageDistribution[k] ?? 0) + 1;
  }
  const byStage = Object.entries(stageDistribution)
    .map(([stage, count]) => ({ stage, count }))
    .sort((a, b) => b.count - a.count);

  const projectTypeMap: Record<string, number> = {};
  for (const r of windowRows) {
    const k = (r.project_type ?? "").trim() || "(unknown)";
    projectTypeMap[k] = (projectTypeMap[k] ?? 0) + 1;
  }
  const projectTypeMix = Object.entries(projectTypeMap)
    .map(([project_type, count]) => ({ project_type, count }))
    .sort((a, b) => b.count - a.count);

  const signed = windowRows.filter((r) => POST_BOOKED_STAGES.has(r.stage));
  const withContract = signed.filter((r) => r.contract_value != null && Number.isFinite(r.contract_value));
  const values = withContract.map((r) => r.contract_value as number);
  const contractStats =
    values.length > 0
      ? (() => {
          const min = Math.min(...values);
          const max = Math.max(...values);
          const sum = values.reduce((a, b) => a + b, 0);
          return { count: values.length, min, max, sum, avg: sum / values.length };
        })()
      : null;

  const withBalance = windowRows.filter((r) => r.balance_due != null && Number.isFinite(r.balance_due) && (r.balance_due as number) > 0);
  const balanceStats =
    withBalance.length > 0
      ? {
          count: withBalance.length,
          sum: withBalance.reduce((a, r) => a + (r.balance_due as number), 0),
        }
      : null;

  const packageMap = new Map<string, { count: number; contractSum: number; contractN: number }>();
  for (const r of signed) {
    if (r.package_name == null || !String(r.package_name).trim()) continue;
    const pk = String(r.package_name).trim();
    const cur = packageMap.get(pk) ?? { count: 0, contractSum: 0, contractN: 0 };
    cur.count += 1;
    if (r.contract_value != null && Number.isFinite(r.contract_value)) {
      cur.contractSum += r.contract_value as number;
      cur.contractN += 1;
    }
    packageMap.set(pk, cur);
  }
  const packageMixBooked = [...packageMap.entries()]
    .map(([package_name, v]) => ({
      package_name,
      count: v.count,
      avgContractValue: v.contractN > 0 ? v.contractSum / v.contractN : null,
    }))
    .sort((a, b) => b.count - a.count);

  const withLoc = windowRows.filter((r) => (r.location ?? "").trim().length > 0);
  const locationHint =
    "Location is free text in CRM. This snapshot only reports whether a non-empty location is stored, not true destination travel vs local (no boolean field).";

  const [openTasksRes, openEscsRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("photographer_id", photographerId)
      .eq("status", "open"),
    supabase
      .from("escalation_requests")
      .select("id", { count: "exact", head: true })
      .eq("photographer_id", photographerId)
      .eq("status", "open"),
  ]);

  if (openTasksRes.error) {
    throw new Error(`fetchAssistantStudioAnalysisSnapshot tasks count: ${openTasksRes.error.message}`);
  }
  if (openEscsRes.error) {
    throw new Error(`fetchAssistantStudioAnalysisSnapshot escalations count: ${openEscsRes.error.message}`);
  }

  const rowSamples = windowRows.slice(0, SAMPLE_IN_PROMPT).map((r) => ({
    id: r.id,
    couple_names: r.couple_names,
    stage: r.stage,
    project_type: r.project_type,
    wedding_date: r.wedding_date,
    package_name: r.package_name,
    contract_value: r.contract_value,
    balance_due: r.balance_due,
    location: (r.location ?? "").trim() ? (r.location ?? "").trim() : "(empty)",
  }));

  const evidenceNotes = buildStudioAnalysisEvidenceNotes({
    windowRowsLength: windowRows.length,
    rawFetchLength: rows.length,
    maxFetch: MAX_FETCH,
    monthsBack: MONTHS_LOOKBACK,
    cutoffIso,
    stageDistribution,
    contractStats: contractStats != null ? { count: contractStats.count } : null,
  });

  return {
    fetchedAt: now.toISOString(),
    window: { monthsBack: MONTHS_LOOKBACK, cutoffDateIso: cutoffIso },
    projectCount: windowRows.length,
    evidenceNotes,
    stageDistribution,
    byStage,
    projectTypeMix,
    packageMixBooked,
    contractStats,
    balanceStats,
    openTasksCount: openTasksRes.count ?? 0,
    openEscalationsCount: openEscsRes.count ?? 0,
    locationCoverage: { withLocationCount: withLoc.length, total: windowRows.length, note: locationHint },
    rowSamples,
  };
}
