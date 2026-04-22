/**
 * Dev-only console helpers for operator Ana `fetch` + SSE timing (removable).
 * Enable in prod builds: `VITE_ANA_STREAM_DEBUG=true` (Vite must see it at build time).
 */
export function operatorAnaStreamDebugEnabled(): boolean {
  return import.meta.env.DEV === true || import.meta.env.VITE_ANA_STREAM_DEBUG === "true";
}

export function logAnaStreamLine(message: string): void {
  if (operatorAnaStreamDebugEnabled()) {
    console.log(`[Ana stream] ${message}`);
  }
}
