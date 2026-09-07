import test from 'node:test';
import assert from 'node:assert/strict';

import {
  newCardState, review, isDue, formatDue, tierOf, GRADES, TIERS,
} from '../js/scheduler.js';

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_700_000_000_000;

test('a new card needs two correct answers before it is spaced out', () => {
  const once = review(newCardState(), 1, NOW);
  assert.equal(once.interval, 0, 'still being learnt');
  assert.equal(once.step, 1);
  assert.ok(isDue(once, NOW), 'so it comes back in the same session');

  const twice = review(once, 1, NOW);
  assert.equal(twice.interval, 1, 'graduates on the second correct answer');
  assert.equal(twice.step, 0, 'and the step counter resets');
  assert.equal(twice.due, NOW + DAY);
  assert.equal(twice.reps, 2);
});

test('a wrong answer sends a half-learnt card back to the start', () => {
  const once = review(newCardState(), 1, NOW);
  assert.equal(once.step, 1);
  const failed = review(once, 0, NOW);
  assert.equal(failed.step, 0, 'the correct answer no longer counts');
  // So it still takes two more right answers to graduate.
  assert.equal(review(failed, 1, NOW).interval, 0);
  assert.equal(review(review(failed, 1, NOW), 1, NOW).interval, 1);
});

test('a graduated card is spaced out on every correct answer', () => {
  const day = review(review(newCardState(), 1, NOW), 1, NOW);
  assert.equal(day.interval, 1);
  // No second step needed once it has graduated.
  assert.equal(review(day, 1, NOW).interval, 2.5);
});

test('a lapsed card has to be relearnt twice as well', () => {
  let state = review(review(newCardState(), 1, NOW), 1, NOW);
  for (let i = 0; i < 3; i += 1) state = review(state, 1, NOW);
  assert.ok(state.interval > 1);

  state = review(state, 0, NOW);
  assert.equal(state.interval, 0);
  assert.equal(review(state, 1, NOW).interval, 0, 'one right answer is not enough');
  assert.equal(review(review(state, 1, NOW), 1, NOW).interval, 1);
});

test('"too easy" skips the learning steps entirely', () => {
  const state = review(newCardState(), 2, NOW);
  assert.equal(state.interval, 365);
  assert.equal(state.step, 0);
});

test('"too easy" retires a card straight away', () => {
  const easy = review(newCardState(), 2, NOW);
  const good = review(newCardState(), 1, NOW);
  assert.ok(easy.interval > good.interval);
  // Out of the rotation for as long as the scheduler allows.
  assert.equal(easy.interval, 365);
  assert.equal(easy.due, NOW + 365 * DAY);
});

test('intervals grow as a card is repeatedly answered well', () => {
  // Graduate it first, then watch the spacing widen.
  let state = review(review(newCardState(), 1, NOW), 1, NOW);
  const seen = [state.interval];
  for (let i = 0; i < 4; i += 1) {
    state = review(state, 1, NOW);
    seen.push(state.interval);
  }
  for (let i = 1; i < seen.length; i += 1) assert.ok(seen[i] > seen[i - 1], seen.join(' '));
});

test('Again resets the interval, records a lapse and lowers ease', () => {
  let state = review(review(newCardState(), 1, NOW), 1, NOW);
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
  for (let i = 0; i < 40; i += 1) state = review(state, 2, NOW);
  assert.ok(state.ease <= 2.8, state.ease);
});

test('intervals are capped at a year', () => {
  let state = newCardState();
  for (let i = 0; i < 60; i += 1) state = review(state, 1, NOW);
  assert.ok(state.interval <= 365, state.interval);
});

test('there are exactly three grades, and nothing else is accepted', () => {
  assert.deepEqual(GRADES.map((g) => g.id), [0, 1, 2]);
  assert.deepEqual(GRADES.map((g) => g.tone), ['again', 'good', 'easy']);
  assert.throws(() => review(newCardState(), 3, NOW), /Unknown grade/);
  assert.throws(() => review(newCardState(), -1, NOW), /Unknown grade/);
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

  // One right answer is not yet a day out, so it is still being learnt.
  assert.equal(tierOf(review(newCardState(), 1, NOW)), 'learning');
  assert.equal(tierOf(review(review(newCardState(), 1, NOW), 1, NOW)), 'young');

  // Answering Again zeroes the interval, so it drops back to learning even
  // though it has been reviewed several times.
  let state = newCardState();
  for (let i = 0; i < 7; i += 1) state = review(state, 1, NOW);
  assert.equal(tierOf(state), 'known', `interval ${state.interval}`);
  assert.equal(tierOf(review(state, 0, NOW)), 'learning');
});

test('the tiers are exhaustive and mutually exclusive', () => {
  const ids = new Set(TIERS.map((t) => t.id));
  assert.equal(ids.size, TIERS.length);
  let state = newCardState();
  for (let i = 0; i < 30; i += 1) {
    state = review(state, i % 5 === 4 ? 0 : 1, NOW);
    assert.ok(ids.has(tierOf(state)), `unbanded state: ${JSON.stringify(state)}`);
  }
});
