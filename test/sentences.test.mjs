import test from 'node:test';
import assert from 'node:assert/strict';

import { SENTENCES, WORKS } from '../js/sentences.js';
import { VERBS } from '../js/verbs.js';
import { conjugate, TENSE_IDS, PRONOUNS } from '../js/conjugator.js';

const verb = (inf) => VERBS.find((v) => v.inf === inf);

test('the corpus is present and attributed', () => {
  assert.ok(SENTENCES.length > 300, `only ${SENTENCES.length} sentences`);
  assert.ok(WORKS.length > 0);
  for (const work of WORKS) {
    assert.ok(work.title && work.author, JSON.stringify(work));
  }
});

test('every card points at a verb the app can conjugate', () => {
  for (const s of SENTENCES) {
    assert.ok(verb(s.inf), `unknown verb: ${s.inf}`);
    assert.ok(TENSE_IDS.includes(s.tense), `unknown tense: ${s.tense}`);
    assert.ok(s.person >= 0 && s.person < 6, `bad person: ${s.person}`);
    assert.ok(WORKS[s.work], `bad work index: ${s.work}`);
  }
});

/**
 * The one that matters: the highlighted span must actually be the form the
 * card claims. If the extractor ever drifts, this fails rather than quietly
 * teaching the wrong thing.
 */
test('the highlighted span is exactly the stated form', () => {
  for (const s of SENTENCES) {
    const highlighted = s.text.slice(s.start, s.end);
    const expected = conjugate(verb(s.inf), s.tense)[s.person];
    assert.equal(
      highlighted.toLowerCase(),
      expected.toLowerCase(),
      `${s.id}: highlighted "${highlighted}" but claims ${s.inf}/${s.tense}/${PRONOUNS[s.person]} = "${expected}"`,
    );
  }
});

test('every highlighted form has exactly one reading', () => {
  // A sentence card cannot mark a defensible answer wrong, so ambiguous
  // forms must never have got in. "il vit" is voir or vivre; it is out.
  // Checked on the bare form, which is what the extractor matched on — the
  // clause form carries a "qu'" for subjunctives and would never line up.
  for (const s of SENTENCES) {
    const form = s.text.slice(s.start, s.end).toLowerCase();
    const readings = [];
    for (const v of VERBS) {
      for (const tense of TENSE_IDS) {
        if (conjugate(v, tense)[s.person].toLowerCase() === form) readings.push(`${v.inf}/${tense}`);
      }
    }
    assert.deepEqual(readings, [`${s.inf}/${s.tense}`], `${s.id}: "${form}" is ambiguous`);
  }
});

test('ids are unique and stable-looking', () => {
  const ids = new Set();
  for (const s of SENTENCES) {
    assert.match(s.id, /^[0-9a-f]{10}$/, `odd id: ${s.id}`);
    assert.ok(!ids.has(s.id), `duplicate id: ${s.id}`);
    ids.add(s.id);
  }
});

test('sentences are a readable length and not truncated mid-quote', () => {
  for (const s of SENTENCES) {
    assert.ok(s.text.length >= 45 && s.text.length <= 165, `${s.id}: ${s.text.length} chars`);
    assert.doesNotMatch(s.text, /[«»"]/, `${s.id} carries a dangling quotation mark`);
    assert.ok(s.start >= 0 && s.end <= s.text.length && s.start < s.end, `${s.id}: bad span`);
  }
});

test('the literary tenses are well represented', () => {
  const count = (tense) => SENTENCES.filter((s) => s.tense === tense).length;
  assert.ok(count('passe-simple') > 50, `only ${count('passe-simple')} passé simple sentences`);
  assert.ok(count('subjonctif-imparfait') > 10, `only ${count('subjonctif-imparfait')}`);
});
