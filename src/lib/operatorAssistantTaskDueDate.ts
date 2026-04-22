/**
 * Calendar date in UTC (YYYY-MM-DD) for operator-assistant task proposals and inserts.
 * Used when the model or operator omits a due date — safe default: today UTC.
 */
export function utcCalendarDateFromMs(ms: number): string {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function defaultOperatorAssistantTaskDueDateUtcToday(): string {
  return utcCalendarDateFromMs(Date.now());
}
