import test from 'node:test';
import assert from 'node:assert/strict';

import { SENTENCES, SENTENCE_BY_ID, sentencesForBands } from '../js/everyday.js';
import { WORDS, BANDS } from '../js/common-words.js';
import { french } from '../js/subjects/french.js';

const settings = (over = {}) => {
  const s = { ...french.defaults, ...over };
  french.normalise(s);
  return s;
};

const bare = (value) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

test('the word list is five hundred words, each in exactly one band', () => {
  assert.equal(WORDS.length, 500);
  assert.equal(new Set(WORDS).size, 500, 'no word twice');
  for (const word of WORDS) assert.ok(word.trim() && word === word.trim(), `"${word}"`);
  // The bands have to tile the list with no gap and no overlap.
  assert.equal(BANDS[0].from, 0);
  assert.equal(BANDS.at(-1).to, WORDS.length);
  BANDS.slice(1).forEach((band, i) => assert.equal(band.from, BANDS[i].to, band.id));
});

test('a thousand sentences: two for every word, and never the same one twice', () => {
  assert.equal(SENTENCES.length, 1000);
  assert.equal(new Set(SENTENCES.map((s) => s.fr)).size, 1000, 'no sentence repeats');
  assert.equal(new Set(SENTENCES.map((s) => s.id)).size, 1000);

  const byWord = new Map();
  for (const s of SENTENCES) byWord.set(s.word, [...(byWord.get(s.word) ?? []), s]);
  assert.equal(byWord.size, WORDS.length);
  for (const word of WORDS) {
    assert.equal(byWord.get(word)?.length, 2, `${word} has lost a sentence`);
  }
});

test('every word is visible in at least one of its own two sentences', () => {
  // The whole claim of this deck is that it covers the five hundred. A word
  // whose examples never show it is a word the deck does not actually teach.
  const byWord = new Map();
  for (const s of SENTENCES) byWord.set(s.word, [...(byWord.get(s.word) ?? []), s.fr]);

  for (const [word, pair] of byWord) {
    // The longest part of the entry, so "se souvenir" is checked on souvenir
    // and "à cause de" on cause; three letters, since French conjugation
    // chews the rest — il fallait is still falloir.
    const core = bare(word).split(/[^a-z]+/).filter(Boolean).sort((a, b) => b.length - a.length)[0];
    const shown = pair.some((fr) => bare(fr).includes(core.slice(0, 3)));
    assert.ok(shown, `${word} never appears: ${pair.join(' / ')}`);
  }
});

test('every sentence is short, finished, and written the French way', () => {
  for (const s of SENTENCES) {
    assert.ok(s.fr && s.en, s.id);
    assert.match(s.fr, /[.!?…]$/, `unfinished: ${s.fr}`);
    assert.match(s.en, /[.!?…]$/, `unfinished: ${s.en}`);
    assert.ok(!s.fr.includes("'"), `straight apostrophe: ${s.fr}`);
    assert.ok(!/ [?!:;»]/.test(s.fr), `use a non-breaking space: ${s.fr}`);
    // Short on purpose: a sentence you can hold in your head.
    assert.ok(s.fr.length <= 60, `too long (${s.fr.length}): ${s.fr}`);
    assert.ok(s.fr.split(' ').length <= 11, `too many words: ${s.fr}`);
  }
});

test('the bands split the thousand and are worth choosing between', () => {
  const counted = BANDS.map((band) => sentencesForBands([band.id]).length);
  assert.deepEqual(counted, [200, 300, 500]);
  assert.equal(counted.reduce((a, b) => a + b, 0), SENTENCES.length);
  for (const s of SENTENCES) assert.ok(BANDS.some((b) => b.id === s.band), s.id);
  // Rank and band agree: the first hundred words are the first band.
  for (const s of sentencesForBands(['first'])) assert.ok(s.rank < 100, s.word);
});

test('a sentence is a card each way round, and graded by you', () => {
  const ids = french.cardIds(settings({ study: 'everyday' }));
  assert.equal(ids.length, 1000);
  for (const id of ids) assert.ok(french.parse(id), `unparseable: ${id}`);

  const both = french.cardIds(settings({ study: 'everyday', direction: 'mix' }));
  assert.equal(both.length, 2000);
  assert.equal(new Set(both).size, 2000);

  const card = french.parse('day|ce-doit-etre-une-erreur');
  assert.equal(card.direction, 'everyday');
  assert.equal(french.typable(card), false, 'a whole sentence has too many right answers to mark');
  assert.equal(french.check('anything', card), null);
  assert.equal(french.extra(card), null);
  assert.equal(french.parse('day|nothing-of-the-sort'), null);
});

test('the answer names the word the sentence was built around', () => {
  const card = french.parse('day|ce-doit-etre-une-erreur');
  assert.equal(french.answer(card).answer, 'Ce doit être une erreur.');
  assert.equal(french.answer(card).sub, 'être · #1 of 500');
  assert.deepEqual(french.faces(card), {
    question: 'That must be a mistake.',
    answer: 'Ce doit être une erreur.',
  });

  const back = french.parse('day|ce-doit-etre-une-erreur|r');
  assert.equal(french.answer(back).answer, 'That must be a mistake.');
  assert.deepEqual(french.faces(back), {
    question: 'Ce doit être une erreur.',
    answer: 'That must be a mistake.',
  });

  for (const id of french.cardIds(settings({ study: 'everyday', direction: 'mix' }))) {
    const c = french.parse(id);
    assert.ok(french.answer(c).answer, id);
    assert.ok(french.faces(c).question, id);
  }
});

test('bands narrow the deck, and the other modes are left alone', () => {
  const first = french.cardIds(settings({ study: 'everyday', bands: ['first'] }));
  assert.equal(first.length, 200);
  const s = settings({ study: 'everyday', bands: ['first'], topics: ['Shopping'], patterns: ['en'] });
  assert.deepEqual(s.topics, ['Shopping']);
  assert.deepEqual(s.patterns, ['en']);
  assert.deepEqual(settings({ bands: ['imaginary'] }).bands, french.defaults.bands);
  assert.deepEqual(settings({ bands: [] }).bands, french.defaults.bands);

  assert.deepEqual(
    french.filters(settings({ study: 'everyday' })).map((f) => f.id),
    ['study', 'bands', 'direction'],
  );
});

test('six ways of studying French, six daily allowances', () => {
  const keys = ['conjugation', 'reading', 'expressions', 'phrases', 'gaps', 'everyday']
    .map((study) => french.keys({ study }).daily);
  assert.equal(new Set(keys).size, 6);
  for (const key of keys) assert.ok(french.storageKeys().includes(key), key);
  // One subject, so one history and one recap.
  assert.equal(french.keys({ study: 'everyday' }).progress, 'conjugaison.progress.v1');
});
