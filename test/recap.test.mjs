import test from 'node:test';
import assert from 'node:assert/strict';

import { newLog, rollLog, record, summarise, accuracy, MAX_LISTED } from '../js/recap.js';

const logOf = (...grades) =>
  grades.reduce((log, [id, grade]) => record(log, id, grade), newLog('2026-09-07'));

test('an empty day summarises to nothing', () => {
  const summary = summarise(newLog('2026-09-07'));
  assert.deepEqual(summary, { answered: 0, right: 0, missed: [] });
  assert.equal(accuracy(summary), 0, 'and does not divide by zero');
});

test('answered and right are counted across every grade', () => {
  // 0 = Again, 1 = Got it, 2 = Too easy.
  const summary = summarise(logOf(['a', 1], ['b', 0], ['c', 2], ['d', 1]));
  assert.equal(summary.answered, 4);
  assert.equal(summary.right, 3, 'Too easy counts as right');
  assert.equal(accuracy(summary), 75);
});

test('missed cards are listed most-missed first', () => {
  const summary = summarise(logOf(
    ['once', 0], ['thrice', 0], ['thrice', 0], ['thrice', 0], ['twice', 0], ['twice', 0], ['fine', 1],
  ));
  assert.deepEqual(summary.missed, [
    { id: 'thrice', times: 3 },
    { id: 'twice', times: 2 },
    { id: 'once', times: 1 },
  ]);
});

test('a card missed then learnt still shows up', () => {
  // You got it eventually, but it is exactly what is worth revisiting.
  const summary = summarise(logOf(['être|present|0', 0], ['être|present|0', 1], ['être|present|0', 1]));
  assert.deepEqual(summary.missed, [{ id: 'être|present|0', times: 1 }]);
  assert.equal(summary.right, 2);
});

test('the log rolls over with the calendar day', () => {
  const log = logOf(['a', 1], ['b', 0]);
  assert.equal(rollLog(log, '2026-09-07'), log);
  const fresh = rollLog(log, '2026-09-08');
  assert.deepEqual(fresh.entries, []);
  assert.equal(fresh.date, '2026-09-08');
});

test('a malformed or missing log is replaced rather than trusted', () => {
  assert.deepEqual(rollLog(undefined, '2026-09-07').entries, []);
  assert.deepEqual(rollLog({ date: '2026-09-07' }, '2026-09-07').entries, []);
  assert.deepEqual(rollLog({ date: '2026-09-07', entries: 'nope' }, '2026-09-07').entries, []);
});

test('recording never mutates the log it was given', () => {
  const before = newLog('2026-09-07');
  const after = record(before, 'a', 1);
  assert.equal(before.entries.length, 0);
  assert.equal(after.entries.length, 1);
});

test('the log cannot grow without bound', () => {
  let log = newLog('2026-09-07');
  for (let i = 0; i < 2500; i += 1) log = record(log, `card-${i}`, 1);
  assert.equal(log.entries.length, 2000);
  assert.equal(log.entries.at(-1).id, 'card-2499', 'the newest reviews are the ones kept');
});

test('the listing cap is a sensible size', () => {
  assert.ok(MAX_LISTED > 0 && MAX_LISTED <= 30);
});
