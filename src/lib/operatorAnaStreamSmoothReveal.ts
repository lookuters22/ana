import type { OperatorAnaWidgetFocusSnapshot } from "./operatorAnaWidgetConversationBounds.ts";
import type { OperatorStudioAssistantAssistantDisplay } from "./operatorStudioAssistantWidgetResult.ts";

/** Characters per second target for visible reveal. */
export const TARGET_CPS = 120;

/** How far behind the live buffer can lag (ms) before catch-up extra chars. */
export const MAX_LAG_MS_LIVE = 300;

/** Tighter cap after `done` while draining the tail. */
export const MAX_LAG_MS_AFTER_DONE = 150;

/** If total received text is shorter than this, drain/swap to final on `done` without long pacing. */
export const SHORT_REPLY_BYPASS = 30;

export const REVEAL_PACING_DEFAULTS = {
  targetCps: TARGET_CPS,
  maxLagLive: MAX_LAG_MS_LIVE,
  maxLagAfterDone: MAX_LAG_MS_AFTER_DONE,
} as const;

export type RevealState = {
  inFlightId: string;
  received: string;
  displayedLen: number;
  lastTs: number;
  rafId: number | null;
  receivedEnded: boolean;
  pendingFinal: {
    display: OperatorStudioAssistantAssistantDisplay;
    focusSnapshot: OperatorAnaWidgetFocusSnapshot;
  } | null;
};

export function shouldBypassPacedDrain(receivedTotalLen: number, bypassChars = SHORT_REPLY_BYPASS): boolean {
  return receivedTotalLen < bypassChars;
}

/**
 * Paced reveal: how many code units to show after this frame, given elapsed time and catch-up.
 * Pure: easy to test.
 */
export function computeRevealNewLength(
  input: {
    receivedLen: number;
    displayedLen: number;
    receivedEnded: boolean;
    lastTs: number;
  },
  nowTs: number,
  opts: { targetCps: number; maxLagLive: number; maxLagAfterDone: number } = REVEAL_PACING_DEFAULTS,
): { newDisplayedLen: number; lastTs: number } {
  const elapsedMs = Math.max(0, nowTs - input.lastTs);
  const receivedLen = input.receivedLen;
  const displayedLen = input.displayedLen;
  const lagChars = receivedLen - displayedLen;
  const maxLagMs = input.receivedEnded ? opts.maxLagAfterDone : opts.maxLagLive;
  const lagMs = (lagChars * 1000) / opts.targetCps;
  const natural = Math.round((opts.targetCps * elapsedMs) / 1000);
  const catchUp =
    lagMs > maxLagMs ? Math.ceil(((lagMs - maxLagMs) * opts.targetCps) / 1000) : 0;
  const budget = Math.max(1, natural + catchUp);
  const newLen = Math.min(receivedLen, displayedLen + budget);
  return { newDisplayedLen: newLen, lastTs: nowTs };
}
