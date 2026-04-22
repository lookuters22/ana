import { describe, expect, it } from "vitest";
import {
  computeRevealNewLength,
  REVEAL_PACING_DEFAULTS,
  shouldBypassPacedDrain,
  SHORT_REPLY_BYPASS,
  TARGET_CPS,
} from "./operatorAnaStreamSmoothReveal.ts";

describe("computeRevealNewLength", () => {
  it("applies base rate: ~2 chars in 16ms at 120 CPS when backlog is small (no catch-up)", () => {
    // 5 chars behind: lagMs < MAX_LAG_MS_LIVE so only `natural` applies
    const r = computeRevealNewLength(
      { receivedLen: 5, displayedLen: 0, receivedEnded: false, lastTs: 0 },
      16,
    );
    expect(r.newDisplayedLen).toBe(2);
    expect(r.lastTs).toBe(16);
  });

  it("catch-up when virtual lag time exceeds max live lag", () => {
    // Many chars behind: lagMs = 5000*1000/120 >> MAX_LAG_MS_LIVE
    const r = computeRevealNewLength(
      { receivedLen: 5000, displayedLen: 0, receivedEnded: false, lastTs: 0 },
      16,
    );
    const lagMs = (5000 * 1000) / TARGET_CPS;
    const extra = Math.ceil(((lagMs - REVEAL_PACING_DEFAULTS.maxLagLive) * TARGET_CPS) / 1000);
    const expectedBudget = Math.max(1, Math.round((TARGET_CPS * 16) / 1000) + extra);
    expect(r.newDisplayedLen).toBe(Math.min(5000, 0 + expectedBudget));
  });

  it("tighter post-done cap: catch-up uses maxLagAfterDone", () => {
    const live = computeRevealNewLength(
      { receivedLen: 200, displayedLen: 0, receivedEnded: true, lastTs: 0 },
      16,
    );
    const withLiveEndedFalse = computeRevealNewLength(
      { receivedLen: 200, displayedLen: 0, receivedEnded: false, lastTs: 0 },
      16,
    );
    // Same backlog; post-done should allow a larger one-frame jump when over tight tail cap
    expect(live.newDisplayedLen).toBeGreaterThanOrEqual(2);
    expect(withLiveEndedFalse.newDisplayedLen).toBeGreaterThanOrEqual(2);
    const rDone = computeRevealNewLength(
      { receivedLen: 500, displayedLen: 0, receivedEnded: true, lastTs: 0 },
      16,
    );
    const rNotDone = computeRevealNewLength(
      { receivedLen: 500, displayedLen: 0, receivedEnded: false, lastTs: 0 },
      16,
    );
    const lagMs = (500 * 1000) / TARGET_CPS;
    const catchDone =
      lagMs > REVEAL_PACING_DEFAULTS.maxLagAfterDone
        ? Math.ceil(
            ((lagMs - REVEAL_PACING_DEFAULTS.maxLagAfterDone) * TARGET_CPS) / 1000,
          )
        : 0;
    const catchNotDone =
      lagMs > REVEAL_PACING_DEFAULTS.maxLagLive
        ? Math.ceil(((lagMs - REVEAL_PACING_DEFAULTS.maxLagLive) * TARGET_CPS) / 1000)
        : 0;
    // After done, tail uses smaller cap → larger catch-up when far behind
    expect(catchDone).toBeGreaterThan(catchNotDone);
    expect(rDone.newDisplayedLen).toBeGreaterThan(rNotDone.newDisplayedLen);
  });
});

describe("shouldBypassPacedDrain", () => {
  it("bypasses when under SHORT_REPLY_BYPASS", () => {
    expect(shouldBypassPacedDrain(0)).toBe(true);
    expect(shouldBypassPacedDrain(SHORT_REPLY_BYPASS - 1)).toBe(true);
    expect(shouldBypassPacedDrain(SHORT_REPLY_BYPASS)).toBe(false);
  });
});
