import test from 'node:test';
import assert from 'node:assert/strict';

import { GAPS, GAP_BY_ID, PATTERNS, gapsForPatterns } from '../js/gaps.js';
import { french } from '../js/subjects/french.js';

const settings = (over = {}) => {
  const s = { ...french.defaults, ...over };
  french.normalise(s);
  return s;
};

const card = (id) => french.parse(`gap|${id}`);

test('every card is one sentence with one word taken out of it', () => {
  assert.ok(GAPS.length > 100, `only ${GAPS.length}`);
  for (const g of GAPS) {
    assert.ok(PATTERNS.includes(g.pattern), `${g.id}: ${g.pattern}`);
    assert.ok(g.en, `${g.id} has no English`);
    assert.ok(!/[[\]]/.test(g.text), `brackets left in: ${g.text}`);
    assert.equal(g.text.slice(g.start, g.end), g.gap, g.id);
    assert.match(g.text, /[.!?…]$/, `unfinished sentence: ${g.text}`);
    assert.match(g.en, /[.!?…]$/, `unfinished English: ${g.en}`);
    // A gap of more than three words is a translation exercise, not a gap.
    assert.ok(g.gap.split(' ').length <= 3, `${g.id}: "${g.gap}" is a sentence`);
  }
});

test('ids name both the sentence and the word removed from it', () => {
  // The same sentence can be asked twice — On y va ? teaches on and y.
  assert.equal(new Set(GAPS.map((g) => g.id)).size, GAPS.length);
  assert.ok(GAP_BY_ID.has('on-y-va-y') && GAP_BY_ID.has('on-y-va-on'));
  for (const g of GAPS) {
    assert.match(g.id, /^[a-z0-9-]+$/, g.id);
    assert.equal(GAP_BY_ID.get(g.id), g);
  }
});

test('the French is written with the same typography as the rest of the app', () => {
  for (const g of GAPS) {
    assert.ok(!g.text.includes("'"), `straight apostrophe: ${g.text}`);
    assert.ok(!/ [?!:;»]/.test(g.text), `use a non-breaking space: ${g.text}`);
  }
});

test('every pattern has enough examples to be learnt by meeting them', () => {
  // The whole premise: nobody learns en from a rule, only from a hundred
  // sentences with en in them.
  for (const pattern of PATTERNS) {
    assert.ok(gapsForPatterns([pattern]).length >= 6, `${pattern} is thin`);
  }
  assert.ok(gapsForPatterns(['en']).length >= 10, 'en is the hardest of them');
  assert.ok(gapsForPatterns(['y']).length >= 10);
  assert.equal(
    PATTERNS.reduce((sum, p) => sum + gapsForPatterns([p]).length, 0),
    GAPS.length,
    'every card is in exactly one pattern',
  );
});

test('the cards exist, parse, and narrow by pattern', () => {
  const ids = french.cardIds(settings({ study: 'gaps' }));
  assert.equal(ids.length, GAPS.length);
  for (const id of ids) assert.ok(french.parse(id), `unparseable: ${id}`);

  const en = french.cardIds(settings({ study: 'gaps', patterns: ['en'] }));
  assert.equal(en.length, gapsForPatterns(['en']).length);
  assert.ok(en.length < ids.length);
  assert.equal(french.parse('gap|not-a-card'), null);
});

test('these ones are typed, because the answer is one word from a closed set', () => {
  const trois = card('j-en-ai-trois-en');
  assert.equal(french.typable(trois), true);
  assert.equal(french.check('en', trois).level, 'correct');
  assert.equal(french.check('EN', trois).level, 'correct');
  assert.equal(french.check(' en ', trois).level, 'correct');
  assert.equal(french.check('y', trois).level, 'wrong');
  assert.equal(french.check('', trois).level, 'wrong');
  assert.equal(french.placeholder(trois), 'the missing word…');

  // Everything else in this subject that cannot be marked is still not typed.
  assert.equal(french.typable(french.parse('expr|avoir-le-cafard')), false);
});

test('an accent is the whole word, so a missing one is a near miss', () => {
  // à and a are different words; ou and où are different words.
  const started = card('j-ai-commence-a-travailler-a');
  assert.equal(french.check('à', started).level, 'correct');
  assert.deepEqual(french.check('a', started), { level: 'close', message: 'Almost — check the accents' });
  assert.equal(french.check('de', started).level, 'wrong');
});

test('a second answer people genuinely say is accepted, not marked wrong', () => {
  const taxi = card('il-est-difficile-de-trouver-un-taxi-ici-il-est');
  assert.equal(french.check('il est', taxi).level, 'correct');
  assert.equal(french.check('c’est', taxi).level, 'correct', 'what everyone actually says');
  assert.equal(french.check("c'est", taxi).level, 'correct', 'typed with a straight apostrophe');
  assert.equal(french.check('elle est', taxi).level, 'wrong');
  assert.match(french.answer(taxi).sub, /or c’est/);
});

test('the question shows the hole and the answer fills it', () => {
  globalThis.document = {
    createElement: () => ({ className: '', textContent: '' }),
    createTextNode: (value) => ({ textContent: value }),
  };
  const missing = card('tu-me-manques-me');
  const prompt = french.prompt(missing);
  assert.equal(prompt.pill, 'Which word?');
  // The English is the question, not a hint: without it there is no telling
  // which pronoun the hole wants.
  assert.equal(prompt.lead, 'I miss you.');
  assert.equal(prompt.nodes.map((n) => n.textContent).join(''), 'Tu ___ manques.');
  delete globalThis.document;

  const spec = french.answer(missing);
  assert.equal(spec.answer, 'me');
  assert.match(spec.sub, /^Tu me manques\.$/);
  assert.match(spec.note, /subject/);
  assert.equal(french.extra(missing), null, 'nothing is held back');

  assert.deepEqual(french.faces(missing), { question: 'Tu ___ manques.', answer: 'me' });
});

test('every card can be asked, marked and recapped', () => {
  for (const id of french.cardIds(settings({ study: 'gaps' }))) {
    const c = french.parse(id);
    assert.equal(french.check(c.gap.gap, c).level, 'correct', id);
    assert.ok(french.answer(c).answer, id);
    assert.ok(french.faces(c).question.includes('___'), id);
  }
});

test('the little words keep their own settings and their own tally', () => {
  const s = settings({ study: 'gaps', patterns: ['en'], topics: ['Shopping'], themes: ['Feelings'] });
  assert.deepEqual(s.patterns, ['en']);
  assert.deepEqual(s.topics, ['Shopping'], 'phrases are left alone');
  assert.deepEqual(s.themes, ['Feelings'], 'expressions are left alone');

  const keys = ['conjugation', 'reading', 'expressions', 'phrases', 'gaps']
    .map((study) => french.keys({ study }).daily);
  assert.equal(new Set(keys).size, 5);
  for (const key of keys) assert.ok(french.storageKeys().includes(key), key);

  assert.deepEqual(french.filters(settings({ study: 'gaps' })).map((f) => f.id), ['study', 'patterns']);
  assert.deepEqual(settings({ patterns: ['Runes'] }).patterns, french.defaults.patterns);
});

test('a note reads as it is written, since nothing renders it', () => {
  // The note goes into the page as plain text, so an asterisk meant as
  // emphasis arrives as an asterisk.
  for (const g of GAPS) {
    if (!g.note) continue;
    assert.ok(!/[*_`]/.test(g.note), `markup in a note: ${g.note}`);
    assert.match(g.note, /[.!?]$/, `unfinished note: ${g.note}`);
  }
});
