/**
 * The day's review log, and the summary drawn from it.
 *
 * Card state records where a verb has got to, not what happened today, so a
 * recap needs its own log. The interesting half is not the score — it is the
 * list of forms you actually missed, which is otherwise invisible the moment
 * the card goes past.
 */

/** Beyond this the list stops being a study aid and becomes a wall. */
export const MAX_LISTED = 12;

/** Plenty for a day's reviewing, and stops a runaway log growing forever. */
const MAX_ENTRIES = 2000;

export function newLog(date) {
  return { date, entries: [] };
}

/** Starts a fresh log when the calendar day changes. */
export function rollLog(log, today) {
  if (!log || log.date !== today || !Array.isArray(log.entries)) return newLog(today);
  return log;
}

export function record(log, id, grade) {
  const entries = [...log.entries, { id, grade }];
  return { ...log, entries: entries.slice(-MAX_ENTRIES) };
}

/**
 * `missed` lists each card answered wrongly at least once, most-missed
 * first — a card you fumbled three times deserves attention before one you
 * slipped on once.
 */
export function summarise(log) {
  const entries = log?.entries ?? [];
  const misses = new Map();
  for (const { id, grade } of entries) {
    if (grade === 0) misses.set(id, (misses.get(id) ?? 0) + 1);
  }
  return {
    answered: entries.length,
    right: entries.filter((e) => e.grade > 0).length,
    missed: [...misses]
      .sort(([, a], [, b]) => b - a)
      .map(([id, times]) => ({ id, times })),
  };
}

export function accuracy({ answered, right }) {
  return answered ? Math.round((right / answered) * 100) : 0;
}
