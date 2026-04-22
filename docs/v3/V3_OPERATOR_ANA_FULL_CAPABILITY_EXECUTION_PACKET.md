# V3 Operator Ana - Full Capability Composer Execution Packet

> Status: Active execution packet.
> Scope: Internal Ana operator widget only.
> Audience: Humans, Claude, and Composer.
> Purpose: Hold the full Ana destination in one place while keeping Composer prompts narrow, latency-aware, and consistent with the current codebase.

---

## 1. Why this doc exists

Ana is no longer just one feature. It is becoming the operator's single assistant surface across:

- project CRM
- inbox / threads
- inquiry counts
- calendar
- operator state
- playbook / rules / policy
- app-help / workflow guidance
- grounded studio analysis
- later: file and invoice HTML editing
- later: broader per-photographer search / investigation

We need one execution packet that:

- preserves the full destination
- distinguishes fast everyday helper paths from later heavier workflows
- records what is already implemented
- keeps Composer prompts small and scoped
- prevents us from "solving" each new issue with isolated hacks that drift from the long-term shape

This packet does not replace the source architecture docs. It turns them into a practical execution spine.

---

## 2. Primary source docs

Use these as the main truth set:

- `C:\Users\Despot\Desktop\wedding\docs\v3\V3_OPERATOR_ANA_WIDGET_CAPABILITY_PLAN.md`
- `C:\Users\Despot\Desktop\wedding\docs\v3\V3_OPERATOR_ANA_WIDGET_CAPABILITY_SLICES.md`
- `C:\Users\Despot\Desktop\wedding\docs\v3\V3_OPERATOR_ANA_DOMAIN_FIRST_RETRIEVAL_PLAN.md`
- `C:\Users\Despot\Desktop\wedding\docs\v3\V3_OPERATOR_ANA_PROJECT_TYPE_SEMANTICS_SLICE.md`
- `C:\Users\Despot\Desktop\wedding\docs\v3\V3_OPERATOR_ANA_FOLLOW_UP_AND_CARRY_FORWARD_SLICE.md`
- `C:\Users\Despot\Desktop\wedding\docs\v3\V3_OPERATOR_ANA_STREAMING_IMPLEMENTATION_SLICES.md`
- `C:\Users\Despot\Desktop\wedding\docs\v3\V3_OPERATOR_ANA_STREAMING_COMPOSER_EXECUTION_PACKET.md`

If this packet conflicts with those docs:

- architecture truth comes from the source docs
- slice sizing and execution order come from this packet

---

## 3. Current repo state we should assume

These are already in place and should not be accidentally redone:

### Already landed

- domain-first projects retrieval foundation
- focused project summary instead of full focused-project preload
- project resolver/detail split
- CRM digest de-emphasis on the operator path
- project-type semantics enforcement
- carry-forward transport and advisory behavior
- carry-forward behavior verification
- operator-path CRM digest fetch bypass
- project-type anti-bleed in memory selection
- inquiry-count continuity follow-up fix
- thread title/body honesty guardrail
- streaming infrastructure and widget streaming path

### Current important realities

- main LLM loop currently uses `gpt-4.1-mini`
- streaming works for some turns and still behaves inconsistently on others
- inbox/thread retrieval can still choose the wrong thread for fuzzy non-wedding inbound queries
- current routing behavior is still a mix of independent deterministic intent helpers plus model behavior
- Ana is still closer to a "mixed-prompt assistant" than a cleanly domain-shaped helper

### Important design constraint

Ana is a fast helper widget.

Normal turns must stay quick.

So this packet explicitly rejects:

- worker-heavy orchestration
- multi-agent fan-out
- minutes-long planning on the normal path
- expensive classifier calls on every turn

Heavier workflows may exist later, but they must be opt-in and clearly separate from the default fast path.

---

## 4. Full destination: all capability families

We do want Ana to eventually cover all of these:

### Fast everyday domains

- `project_crm`
- `inbox_threads`
- `inquiry_counts`
- `calendar`
- `operator_state`
- `rules_policy`
- `app_help`
- `unclear`

### Later heavier specialist modes

- `studio_analysis`
- `file_editing`
- `invoice_html_editing`
- `broad_search_investigation`

Important:

- everyday domains belong on the low-latency helper path
- heavier modes may use slower retrieval or more deliberate workflows later
- do not force the heavy modes into the default path just because we know we want them eventually

---

## 5. Architectural rules for future slices

These rules should apply to every Composer prompt from here on:

1. Keep Ana as one assistant surface, but do not make every domain first-class in the first implementation pass.
2. Separate fast-path routing from heavier workflow paths.
3. Prefer deterministic-first routing over extra LLM classifier calls.
4. Triage, when added, is a hint and conflict-resolver first, not a hard gate.
5. Domain expansion must follow retrieval quality. Do not add a top-level domain if its retrieval is still weak or misleading.
6. Honesty fixes ship before capability-expansion fixes.
7. New retrieval capability should be introduced only when the operator actually needs it, not just because it is theoretically nice.
8. Composer prompts should target one slice only and explicitly list what is out of scope.

---

## 6. The execution shape we want

Instead of one giant plan, use three tracks:

### Track A - Fast-path routing and consistency

Goal:
Reduce Ana's brittle mixed-domain behavior without adding latency.

This is where deterministic triage belongs.

### Track B - Domain capability completion

Goal:
Fill the missing domain capabilities one by one:

- calendar
- app-help
- operator state
- thread/message retrieval quality
- later studio analysis

### Track C - Heavier workflow modes

Goal:
Add slower, specialist capabilities later without polluting the normal helper path:

- file editing
- invoice HTML editing
- broader search/investigation

This packet focuses first on Tracks A and B.

---

## 7. Recommended near-term slice sequence

This is the recommended order from here, assuming we preserve the already-landed fixes.

### Slice A1 - Thread retrieval quality fix

Why:
Current inbox/thread matching can return the wrong thread for fuzzy commercial/non-wedding inbound queries.

Goal:
Improve thread selection quality for queries like:

- "I received a phone call today regarding a skincare shoot, did they maybe send an email too?"

In scope:

- stop-word / generic-token tightening
- scoring-threshold tuning
- narrow inbox-scoring fixes

Out of scope:

- no new message-body tool
- no triage yet
- no widget changes

### Slice A2 - Deterministic triage v1

Why:
We now have enough evidence that Ana needs a cheap, conflict-resolving triage hint.

Approved v1 top-level domains:

- `project_crm`
- `inbox_threads`
- `inquiry_counts`
- `unclear`

Strict v1 constraints:

- deterministic only
- no extra LLM call
- no fetch-gating changes yet
- no tool gating
- triage block in context
- telemetry

Out of scope:

- no calendar/app-help/studio-analysis as top-level triage domains in v1
- no evidence flags in v1
- no model-based router

### Slice B1 - Calendar capability hardening

Why:
Calendar is required for the full destination and belongs on the fast path, but it does not need to be a v1 triage domain.

Goal:
Audit and strengthen current calendar coverage:

- event/date lookup
- schedule questions
- calendar wording clarity

Out of scope:

- no broad logistics agent
- no external live logistics tools unless specifically justified

### Slice B2 - App-help grounding completion

Why:
App-help is part of the intended operator surface and should be reliable.

Goal:
Finish and harden the app-help path:

- route/app catalog quality
- prompt guidance
- answer calibration

Out of scope:

- no generic software-help assistant

### Slice B3 - Thread content capability decision

Why:
We fixed title/body honesty, but operators may still genuinely want Ana to answer "what did they say?"

Goal:
Decide and, if approved, implement a bounded message-content lookup path.

Possible outcomes:

- no new capability, keep honesty-only
- or add a small read-only thread-message/body tool

Out of scope:

- no broad history search
- no full email drafting pipeline

### Slice B4 - Operator state / inbox-state refinement

Why:
This is part of the everyday fast helper path and should be strong.

Goal:
Improve:

- what's waiting
- what's urgent
- what's next

Out of scope:

- no autonomous task planning

### Slice B5 - Studio analysis first cut

Why:
This belongs to the eventual destination, but should remain separate from everyday routing.

Goal:
Introduce a bounded, grounded studio-analysis read path.

Out of scope:

- no generic consulting mode
- no multi-step analysis agents

### Slice C1 - File-editing mode planning

Why:
Later invoice HTML editing and file help should be planned as a separate heavier mode, not silently folded into the fast helper path.

Goal:
Define:

- triggers
- boundaries
- allowed files
- latency expectations

Out of scope:

- no implementation yet

### Slice C2 - Invoice HTML editing implementation

Why:
This is explicitly wanted later, but it should be treated as a specialist mode.

Goal:
Implement a safe, bounded invoice HTML editing workflow.

Out of scope:

- no general arbitrary file editing over the whole repo

---

## 8. What triage v1 should and should not do

This is important enough to lock explicitly.

### Triage v1 should do

- consolidate current conflict-prone deterministic signals
- choose one primary domain
- optionally record secondary domains
- help the model understand "primarily this, secondarily that"
- emit cheap telemetry
- improve continuity and mixed-domain robustness

### Triage v1 should not do

- replace all fetch gating
- replace existing intent helpers
- block tools
- introduce a new LLM call
- solve thread ranking quality
- solve title/body capability gaps
- solve calendar/app-help/studio-analysis completeness by itself

---

## 9. Composer context rules

When writing Composer prompts from this packet:

1. Always say Ana is a fast helper widget and normal turns must stay quick.
2. Always say whether the slice is on the fast path or a later heavier path.
3. Always state what is already landed and must not be redone.
4. If a slice touches routing, say whether it is:
   - triage/hinting only
   - fetch-gating
   - tool-choice behavior
5. If a slice touches inbox/thread behavior, explicitly distinguish:
   - retrieval quality
   - honesty/calibration
   - message-body capability
6. If a slice touches future editing features, explicitly mark it as a heavier specialist mode.

---

## 10. Recommended next move

The best next concrete move from this packet is:

### Next implementation slice

**Slice A1 - Thread retrieval quality fix**

Reason:

- it is a real current failure
- it affects fast helper-widget trust directly
- triage will not fix it by itself
- it should be corrected before more top-level routing abstraction is added

### After A1

Implement:

- **Slice A2 - Deterministic triage v1**

Reason:

- by then the inbox-thread domain itself is less misleading
- triage can consolidate the current routing heuristics without hiding a bad domain underneath

---

## 11. Suggested prompt pattern for Composer

Every future Composer prompt derived from this packet should include:

1. **Why this slice exists**
2. **What is already landed and should not be redone**
3. **What is in scope**
4. **What is explicitly out of scope**
5. **Whether this is fast-path or heavier specialist work**
6. **Acceptance criteria**
7. **Tests / verification required**

That is the minimum context shape Composer should always receive.

