/**
 * The daily allowance of new cards.
 *
 * Reviews that fall due are always shown — they are the whole point of a
 * spaced system — but *new* cards are rationed, so a session has a finish
 * line instead of dealing another twenty every time the queue drains.
 */

export const DAILY_GOALS = [5, 10, 20, 40];
export const DEFAULT_DAILY_NEW = 20;

/** Local calendar day, so the count rolls over at your midnight, not UTC. */
export function todayKey(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function newDay(today, goal = DEFAULT_DAILY_NEW) {
  return { date: today, introduced: 0, allowance: goal };
}

/**
 * Returns the day's record, starting a fresh one if the date has changed.
 * A new day resets to the configured goal, so yesterday's "add 20 more"
 * does not quietly become today's target.
 */
export function rollOver(daily, today, goal = DEFAULT_DAILY_NEW) {
  if (!daily || daily.date !== today) return newDay(today, goal);
  return daily;
}

export function remainingNew(daily) {
  return Math.max(0, (daily?.allowance ?? 0) - (daily?.introduced ?? 0));
}

export function goalReached(daily) {
  return remainingNew(daily) === 0;
}
