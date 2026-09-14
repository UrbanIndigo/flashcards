import test from 'node:test';
import assert from 'node:assert/strict';

import { EXPRESSIONS, EXPRESSION_BY_ID, THEMES, expressionsForThemes } from '../js/expressions.js';
import { french } from '../js/subjects/french.js';

const settings = (over = {}) => {
  const s = { ...french.defaults, ...over };
  french.normalise(s);
  return s;
};

test('every expression is complete and marked in its sentence', () => {
  assert.ok(EXPRESSIONS.length > 80, `only ${EXPRESSIONS.length}`);
  for (const e of EXPRESSIONS) {
    assert.ok(e.fr && e.en, e.id);
    assert.ok(THEMES.includes(e.theme), `${e.id}: ${e.theme}`);
    // The brackets are how the file is written; they must not reach the card.
    assert.ok(!/[[\]]/.test(e.text), `brackets left in: ${e.text}`);
    assert.ok(!/[[\]]/.test(e.english), `brackets left in: ${e.english}`);
    const marked = e.text.slice(e.start, e.end);
    assert.ok(marked.length > 1, `nothing marked in ${e.id}`);
    assert.ok(e.text.includes(marked), e.id);
    assert.match(e.text, /[.!?…]["»]?$/, `unfinished sentence: ${e.text}`);
    assert.match(e.english, /[.!?…]["]?$/, `unfinished translation: ${e.english}`);
  }
});

test('the marked words are the expression, not a stray slice of the sentence', () => {
  // Both are checked bare, since the sentence conjugates and contracts what
  // the dictionary form spells out: "avoir le cafard" arrives as "j'ai le
  // cafard", so the two share their content words rather than their shape.
  const words = (value) => new Set(value.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .split(/[^a-z]+/).filter((w) => w.length > 2));

  // A stem rather than the whole word, since "être crevé" turns up as
  // "étaient crevés".
  const stem = (word) => word.slice(0, 4);
  for (const e of EXPRESSIONS) {
    const marked = [...words(e.text.slice(e.start, e.end))];
    const shared = [...words(e.fr)].filter((w) => marked.some((m) => stem(m) === stem(w)));
    assert.ok(shared.length > 0, `${e.id}: marked "${e.text.slice(e.start, e.end)}"`);
  }
});

test('ids are unique, stable and derived from the expression', () => {
  assert.equal(new Set(EXPRESSIONS.map((e) => e.id)).size, EXPRESSIONS.length);
  assert.equal(new Set(EXPRESSIONS.map((e) => e.fr)).size, EXPRESSIONS.length, 'no duplicates');
  for (const e of EXPRESSIONS) {
    assert.match(e.id, /^[a-z0-9-]+$/, e.id);
    assert.equal(EXPRESSION_BY_ID.get(e.id), e);
  }
});

test('the French is written with the same typography as the rest of the app', () => {
  for (const e of EXPRESSIONS) {
    assert.ok(!e.text.includes("'"), `straight apostrophe: ${e.text}`);
    assert.ok(!e.fr.includes("'"), `straight apostrophe: ${e.fr}`);
    // French puts a space before ? ! : ; and », and it has to be a
    // non-breaking one or a narrow screen will start a line with the
    // question mark.
    assert.ok(!/ [?!:;»]/.test(e.text), `use a non-breaking space: ${e.text}`);
  }
});

test('every theme has enough in it to be worth choosing', () => {
  for (const theme of THEMES) {
    const count = EXPRESSIONS.filter((e) => e.theme === theme).length;
    assert.ok(count >= 10, `${theme} has only ${count}`);
  }
  assert.equal(
    THEMES.reduce((sum, t) => sum + expressionsForThemes([t]).length, 0),
    EXPRESSIONS.length,
    'every expression is in exactly one theme',
  );
});

test('expressions are their own way of studying, with their own cards', () => {
  const ids = french.cardIds(settings({ study: 'expressions' }));
  assert.equal(ids.length, EXPRESSIONS.length);
  assert.ok(ids.every((id) => id.startsWith('expr|')));
  for (const id of ids) assert.ok(french.parse(id), `unparseable: ${id}`);

  // Conjugation settings have nothing to say about an expression.
  const feelings = french.cardIds(settings({ study: 'expressions', themes: ['Feelings'] }));
  assert.equal(feelings.length, expressionsForThemes(['Feelings']).length);
  assert.ok(feelings.length < ids.length);
  const narrowed = french.cardIds(settings({
    study: 'expressions', themes: ['Feelings'], tenses: ['present'], pronouns: [0], deck: 'core',
  }));
  assert.equal(narrowed.length, feelings.length);

  assert.equal(french.parse('expr|nothing-like-this'), null);
});

test('the settings offered follow the way of studying', () => {
  const groups = (study) => french.filters(settings({ study })).map((f) => f.id);
  assert.deepEqual(groups('expressions'), ['study', 'themes']);
  assert.deepEqual(groups('conjugation'), ['study', 'deck', 'tenses', 'pronouns', 'direction']);
  assert.deepEqual(groups('reading'), ['study', 'deck', 'tenses']);
});

test('each way of studying keeps its own daily allowance', () => {
  const keys = ['conjugation', 'reading', 'expressions'].map((study) => french.keys({ study }).daily);
  assert.equal(new Set(keys).size, 3, 'an evening of idioms does not eat the conjugation twenty');
  for (const key of keys) assert.ok(french.storageKeys().includes(key), key);
  // Progress and the recap log are shared: it is all one subject.
  assert.equal(french.keys({ study: 'expressions' }).progress, 'conjugaison.progress.v1');
});

test('an expression card is graded by you, not marked by the app', () => {
  // Translating an idiom has too many right answers to mark.
  const card = french.parse(`expr|${EXPRESSIONS[0].id}`);
  assert.equal(french.typable(card), false);
  assert.equal(french.check('anything at all', card), null);
  // Conjugation cards are still typed.
  assert.equal(french.typable(french.parse('parler|present|0')), true);
});

test('the answer gives the meaning, the dictionary form and the literal reading', () => {
  const cafard = french.parse('expr|avoir-le-cafard');
  const spec = french.answer(cafard);
  assert.match(spec.answer, /down/);
  assert.equal(spec.sub, 'avoir le cafard');
  assert.match(spec.note, /^Literally: to have the cockroach\.$/);

  // The register is worth knowing before you use one of these at work.
  assert.match(french.answer(french.parse('expr|avoir-la-flemme')).sub, /· familier$/);

  for (const e of EXPRESSIONS) {
    const answer = french.answer(french.parse(`expr|${e.id}`));
    assert.ok(answer.answer, e.id);
    assert.ok(answer.sub.startsWith(e.fr), e.id);
  }
});

test('the sentence in English is there when you want it, not before', () => {
  // The point of the card is to work out the meaning from the sentence, so
  // the translation sits behind the same toggle as the conjugation table.
  globalThis.document = {
    createElement: () => ({ className: '', textContent: '' }),
    createTextNode: (value) => ({ textContent: value }),
  };
  const card = french.parse('expr|tomber-dans-les-pommes');
  const extra = french.extra(card);
  assert.equal(extra.label, 'the sentence in English');
  assert.match(extra.node.textContent, /fainted/);

  const prompt = french.prompt(card);
  assert.equal(prompt.pill, 'Expression');
  assert.equal(prompt.prose, true);
  assert.equal(prompt.nodes.map((n) => n.textContent).join(''), card.expression.text);
  // The marked words are the middle node, so the sentence is shown whole.
  assert.equal(prompt.nodes[1].textContent, 'est tombée dans les pommes');
  delete globalThis.document;
});

test('each expression describes itself for the recap', () => {
  for (const e of EXPRESSIONS) {
    assert.deepEqual(french.faces(french.parse(`expr|${e.id}`)), { question: e.fr, answer: e.en });
  }
});

test('a theme that no longer exists falls back rather than emptying the deck', () => {
  assert.deepEqual(settings({ themes: ['Quantum'] }).themes, french.defaults.themes);
  assert.deepEqual(settings({ themes: [] }).themes, french.defaults.themes);
  assert.deepEqual(settings({ themes: ['People'] }).themes, ['People']);
  assert.equal(settings({ study: 'pottery' }).study, 'conjugation');
});
