/**
 * A small SM-2 style scheduler, kept deliberately simple: the point is to
 * bring back the conjugations you keep missing, not to model memory exactly.
 */

const DAY = 24 * 60 * 60 * 1000;

export const GRADES = [
  { id: 0, tone: 'again', label: 'Again', key: '1', hint: 'Got it wrong — come back to it shortly' },
  { id: 1, tone: 'good', label: 'Got it', key: '2', hint: 'Right — space it out a bit further' },
  { id: 2, tone: 'easy', label: 'Too easy', key: '3', hint: 'Right, and I would rather not see it again' },
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
      next.interval = first ? 1 : Math.max(1, next.interval * next.ease);
      break;
    case 2:
      // "I would rather not see it again": pushed straight to the longest
      // interval there is, so it drops out of the rotation without being
      // deleted — if it ever comes back and you miss it, it is relearnt
      // like anything else.
      next.ease = clamp(next.ease + 0.15, MIN_EASE, MAX_EASE);
      next.interval = MAX_INTERVAL;
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
  const days = review(state, grade, now).interval;
  if (days === 0) return 'soon';
  if (days < 1) return '<1d';
  if (days < 30) return `${Math.round(days)}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return '1y';
}

/** Cards mature at three weeks, the same threshold Anki uses. */
export const MATURE_DAYS = 21;

export const TIERS = [
  { id: 'known', label: 'Known' },
  { id: 'young', label: 'Young' },
  { id: 'learning', label: 'Learning' },
  { id: 'new', label: 'New' },
];

/**
 * Which band of the progress bar a card falls in.
 *
 * A card drops back to 'learning' the moment you answer Again, since its
 * interval is reset to zero — which is the point: the bar should show a verb
 * you have started forgetting, not the fact that you once knew it.
 */
export function tierOf(state) {
  if (!state || state.reps === 0) return 'new';
  if (state.interval >= MATURE_DAYS) return 'known';
  if (state.interval >= 1) return 'young';
  return 'learning';
}
