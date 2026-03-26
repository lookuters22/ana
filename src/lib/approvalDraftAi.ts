/**
 * Demo-only draft refinement. Replace with a server call to your LLM when ready.
 */
export async function regenerateDraftMock(body: string, instruction: string): Promise<string> {
  const hint = instruction.trim().toLowerCase();
  await new Promise((r) => window.setTimeout(r, 550));

  if (!hint) {
    return body;
  }

  if (/warmer|warm|friendlier|friendly|softer|gentle/i.test(hint)) {
    return (
      `Hi — thank you for your patience.\n\n` +
      body.replace(/^Confirmed/, "We’re happy to confirm").replace(/\.$/, ", and we’re genuinely looking forward to making this smooth for everyone.") +
      `\n\nWarmly`
    );
  }

  if (/shorter|brief|concise|tight/i.test(hint)) {
    const first = body.split(/(?<=[.!?])\s+/)[0] ?? body;
    return first.length < body.length ? first : `${body.slice(0, Math.min(body.length, 220)).trimEnd()}…`;
  }

  if (/formal|professional|business/i.test(hint)) {
    return `Dear colleagues,\n\n${body}\n\nKind regards`;
  }

  if (/casual|informal|relaxed/i.test(hint)) {
    return `Hey — quick note:\n\n${body.replace(/^Confirmed/, "Just confirming")}\n\nThanks!`;
  }

  return `${body}\n\n[Adjusted per: “${instruction.trim()}” — review before sending.]`;
}
