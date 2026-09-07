/**
 * A small SM-2 style scheduler, kept deliberately simple: the point is to
 * bring back the conjugations you keep missing, not to model memory exactly.
 */

const DAY = 24 * 60 * 60 * 1000;

export const GRADES = [
  { id: 0, label: 'Again', key: '1', hint: 'No idea' },
  { id: 1, label: 'Hard', key: '2', hint: 'Struggled' },
  { id: 2, label: 'Good', key: '3', hint: 'Got it' },
  { id: 3, label: 'Easy', key: '4', hint: 'Instant' },
];

const MIN_EASE = 1.3;
const MAX_EASE = 2.8;
const MAX_INTERVAL = 365;

export function newCardState() {
  return { interval: 0, ease: 2.5, reps: 0, lapses: 0, due: 0 };
}

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/**
 * Returns the next state for a card, given how the answer went.
 * `interval` is in days; a zero interval means "again this session".
 */
export function review(state = newCardState(), grade, now = Date.now()) {
  const next = { ...state };
  const first = next.reps === 0;

  switch (grade) {
    case 0:
      next.lapses += 1;
      next.ease = clamp(next.ease - 0.2, MIN_EASE, MAX_EASE);
      next.interval = 0;
      break;
    case 1:
      next.ease = clamp(next.ease - 0.15, MIN_EASE, MAX_EASE);
      next.interval = first ? 1 : Math.max(1, next.interval * 1.2);
      break;
    case 2:
      next.interval = first ? 1 : Math.max(1, next.interval * next.ease);
      break;
    case 3:
      next.ease = clamp(next.ease + 0.15, MIN_EASE, MAX_EASE);
      next.interval = first ? 3 : Math.max(1, next.interval * next.ease * 1.3);
      break;
    default:
      throw new Error(`Unknown grade: ${grade}`);
  }

  next.interval = Math.min(MAX_INTERVAL, Math.round(next.interval * 100) / 100);
  next.reps += 1;
  next.due = now + next.interval * DAY;
  return next;
}

export function isDue(state, now = Date.now()) {
  return !state || state.due <= now;
}

/** "in 3 days", "tomorrow" — for the caught-up screen. */
export function formatDue(timestamp, now = Date.now()) {
  const days = Math.ceil((timestamp - now) / DAY);
  if (days <= 0) return 'now';
  if (days === 1) return 'tomorrow';
  if (days < 30) return `in ${days} days`;
  const months = Math.round(days / 30);
  return `in ${months} month${months > 1 ? 's' : ''}`;
}

/** A one-line description of what a grade will do, for the buttons. */
export function previewInterval(state, grade, now = Date.now()) {
  const next = review(state, grade, now);
  if (next.interval === 0) return 'soon';
  if (next.interval < 1) return '<1d';
  return `${Math.round(next.interval)}d`;
}
