import test from 'node:test';
import assert from 'node:assert/strict';

import {
  todayKey, newDay, rollOver, remainingNew, goalReached, DEFAULT_DAILY_NEW, introduces,
} from '../js/daily.js';

test('the day key follows the local calendar, not UTC', () => {
  // Late evening local time: the date must still read as that evening's day,
  // which a UTC-based key would get wrong.
  assert.equal(todayKey(new Date(2026, 8, 7, 23, 30)), '2026-09-07');
  assert.equal(todayKey(new Date(2026, 0, 1, 0, 5)), '2026-01-01');
  assert.equal(todayKey(new Date(2026, 11, 31)), '2026-12-31');
});

test('a fresh day starts empty at the configured goal', () => {
  const day = newDay('2026-09-07', 20);
  assert.equal(day.introduced, 0);
  assert.equal(day.allowance, 20);
  assert.equal(remainingNew(day), 20);
  assert.ok(!goalReached(day));
});

test('the count survives within a day and resets across one', () => {
  const day = { date: '2026-09-07', introduced: 12, allowance: 20 };
  assert.equal(rollOver(day, '2026-09-07', 20), day, 'same day is untouched');
  const tomorrow = rollOver(day, '2026-09-08', 20);
  assert.equal(tomorrow.introduced, 0);
  assert.equal(tomorrow.date, '2026-09-08');
});

test('extending today does not become tomorrow\'s target', () => {
  const stretched = { date: '2026-09-07', introduced: 40, allowance: 40 };
  assert.equal(rollOver(stretched, '2026-09-08', 20).allowance, 20);
});

test('the goal is reached when the allowance is spent', () => {
  assert.ok(goalReached({ date: 'x', introduced: 20, allowance: 20 }));
  assert.ok(!goalReached({ date: 'x', introduced: 19, allowance: 20 }));
  // Lowering the goal below what you have already done counts as done.
  assert.ok(goalReached({ date: 'x', introduced: 25, allowance: 20 }));
  assert.equal(remainingNew({ date: 'x', introduced: 25, allowance: 20 }), 0);
});

test('missing or malformed records do not blow up', () => {
  assert.equal(remainingNew(undefined), 0);
  assert.equal(remainingNew({}), 0);
  assert.equal(rollOver(undefined, '2026-09-07').allowance, DEFAULT_DAILY_NEW);
});

test('a card you retire on sight does not spend one of the day’s new cards', () => {
  // "Too easy" on a word you have never seen is not an introduction: you
  // knew it before it came up, so the twenty still owes you twenty.
  assert.equal(introduces(true, 0), true, 'got it wrong — that is learning');
  assert.equal(introduces(true, 1), true, 'got it right, but it comes back');
  assert.equal(introduces(true, 2), false, 'knew it already');

  // A card already in progress never counted against today in the first
  // place, whatever you grade it.
  for (const grade of [0, 1, 2]) assert.equal(introduces(false, grade), false, `grade ${grade}`);
});

test('the refunded card comes back as another new one', () => {
  let day = newDay('2026-09-17', 20);
  // Nineteen genuinely new cards, and one you already knew.
  for (let i = 0; i < 19; i += 1) {
    if (introduces(true, 1)) day = { ...day, introduced: day.introduced + 1 };
  }
  if (introduces(true, 2)) day = { ...day, introduced: day.introduced + 1 };

  assert.equal(day.introduced, 19, 'the easy one did not count');
  assert.equal(remainingNew(day), 1, 'so the day still has one to give');
  assert.equal(goalReached(day), false);
});
