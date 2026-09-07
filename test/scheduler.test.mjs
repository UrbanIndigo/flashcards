import test from 'node:test';
import assert from 'node:assert/strict';

import { newCardState, review, isDue, formatDue, tierOf, TIERS } from '../js/scheduler.js';

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_700_000_000_000;

test('a new card graded Good comes back tomorrow', () => {
  const state = review(newCardState(), 2, NOW);
  assert.equal(state.interval, 1);
  assert.equal(state.reps, 1);
  assert.equal(state.due, NOW + DAY);
});

test('Easy on a new card skips further ahead than Good', () => {
  const good = review(newCardState(), 2, NOW);
  const easy = review(newCardState(), 3, NOW);
  assert.ok(easy.interval > good.interval);
});

test('intervals grow as a card is repeatedly answered well', () => {
  let state = newCardState();
  const seen = [];
  for (let i = 0; i < 5; i += 1) {
    state = review(state, 2, NOW);
    seen.push(state.interval);
  }
  for (let i = 1; i < seen.length; i += 1) assert.ok(seen[i] > seen[i - 1], seen.join(' '));
});

test('Again resets the interval, records a lapse and lowers ease', () => {
  let state = review(review(newCardState(), 2, NOW), 2, NOW);
  const before = state.ease;
  state = review(state, 0, NOW);
  assert.equal(state.interval, 0);
  assert.equal(state.lapses, 1);
  assert.ok(state.ease < before);
  assert.ok(isDue(state, NOW), 'a lapsed card is due immediately');
});

test('ease stays inside its bounds', () => {
  let state = newCardState();
  for (let i = 0; i < 40; i += 1) state = review(state, 0, NOW);
  assert.ok(state.ease >= 1.3, state.ease);
  state = newCardState();
  for (let i = 0; i < 40; i += 1) state = review(state, 3, NOW);
  assert.ok(state.ease <= 2.8, state.ease);
});

test('intervals are capped at a year', () => {
  let state = newCardState();
  for (let i = 0; i < 60; i += 1) state = review(state, 3, NOW);
  assert.ok(state.interval <= 365, state.interval);
});

test('an unseen card is due', () => {
  assert.ok(isDue(undefined, NOW));
  assert.ok(!isDue({ due: NOW + DAY }, NOW));
});

test('due dates read naturally', () => {
  assert.equal(formatDue(NOW, NOW), 'now');
  assert.equal(formatDue(NOW + DAY, NOW), 'tomorrow');
  assert.equal(formatDue(NOW + 5 * DAY, NOW), 'in 5 days');
  assert.equal(formatDue(NOW + 60 * DAY, NOW), 'in 2 months');
});

// ------------------------------------------------------------ progress bar

test('cards are banded by how well established they are', () => {
  assert.equal(tierOf(undefined), 'new');
  assert.equal(tierOf(newCardState()), 'new');

  // One Good puts a card a day out: started, but not established.
  assert.equal(tierOf(review(newCardState(), 2, NOW)), 'young');

  // Answering Again zeroes the interval, so it drops back to learning even
  // though it has been reviewed several times.
  let state = newCardState();
  for (let i = 0; i < 6; i += 1) state = review(state, 2, NOW);
  assert.equal(tierOf(state), 'known', `interval ${state.interval}`);
  assert.equal(tierOf(review(state, 0, NOW)), 'learning');
});

test('the tiers are exhaustive and mutually exclusive', () => {
  const ids = new Set(TIERS.map((t) => t.id));
  assert.equal(ids.size, TIERS.length);
  let state = newCardState();
  for (let i = 0; i < 30; i += 1) {
    state = review(state, i % 5 === 4 ? 0 : 2, NOW);
    assert.ok(ids.has(tierOf(state)), `unbanded state: ${JSON.stringify(state)}`);
  }
});
