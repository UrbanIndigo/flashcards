import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

import { geography } from '../js/subjects/geography.js';
import { COUNTRIES, REGIONS } from '../js/subjects/geography-data.js';

const settings = (over = {}) => {
  const s = { ...geography.defaults, ...over };
  geography.normalise(s);
  return s;
};

test('every country has a name, region, capital and flag file', () => {
  assert.ok(COUNTRIES.length > 190, `only ${COUNTRIES.length}`);
  for (const country of COUNTRIES) {
    assert.match(country.code, /^[A-Z]{2}$/, country.code);
    assert.ok(country.name && !/[(),]/.test(country.name), `awkward name: ${country.name}`);
    assert.ok(country.capital, `${country.name} has no capital`);
    assert.ok(REGIONS.includes(country.region), `${country.name}: ${country.region}`);
    assert.match(country.flag, /^[a-z]{2}\.(svg|webp)$/, country.flag);
    assert.ok(
      existsSync(new URL(`../flags/${country.flag}`, import.meta.url)),
      `missing artwork: ${country.flag}`,
    );
  }
});

test('the flag manifest matches the flags actually referenced', () => {
  const manifest = JSON.parse(readFileSync(new URL('../flags/manifest.json', import.meta.url), 'utf8'));
  assert.deepEqual(manifest.slice().sort(), COUNTRIES.map((c) => c.flag).sort());
});

test('the artwork stays small enough to precache', () => {
  // Emoji cost nothing but are drawn differently on every phone; images are
  // the right call, but only if the whole set can go offline sensibly.
  const total = COUNTRIES.reduce(
    (sum, c) => sum + readFileSync(new URL(`../flags/${c.flag}`, import.meta.url)).length, 0,
  );
  assert.ok(total < 900 * 1024, `flag set is ${Math.round(total / 1024)}KB`);
});

test('each deck produces a card per country', () => {
  for (const deck of ['flags', 'capitals']) {
    assert.equal(geography.cardIds(settings({ decks: [deck] })).length, COUNTRIES.length, deck);
    assert.equal(geography.cardIds(settings({ decks: [deck], direction: 'mix' })).length, COUNTRIES.length * 2, deck);
  }
  const europe = geography.cardIds(settings({ regions: ['Europe'] }));
  assert.equal(europe.length, COUNTRIES.filter((c) => c.region === 'Europe').length);
});

test('decks can be studied together', () => {
  const both = geography.cardIds(settings({ decks: ['flags', 'capitals'] }));
  assert.equal(both.length, COUNTRIES.length * 2);
  // Both kinds really are in the one pool, not just counted twice.
  assert.ok(both.includes('PT'), 'a flag card');
  assert.ok(both.includes('cap|PT'), 'a capital card');
  assert.equal(new Set(both).size, both.length, 'no id collides between decks');

  const everything = geography.cardIds(settings({ decks: ['flags', 'capitals'], direction: 'mix' }));
  assert.equal(everything.length, COUNTRIES.length * 4);
  assert.equal(new Set(everything).size, everything.length);
});

test('the direction is named exactly for one deck and described for several', () => {
  const one = geography.filters(settings({ decks: ['capitals'] }))[2].options;
  assert.equal(one[0].label, 'Name the capital');
  assert.equal(one[1].label, 'Name the country');

  const many = geography.filters(settings({ decks: ['flags', 'capitals'] }))[2].options;
  assert.equal(many[0].label, 'Forward');
  assert.match(many[0].hint, /flag → country · country → capital/);
  assert.match(many[1].hint, /country → flag · capital → country/);
});

test('flag card ids are unchanged, so the old history still matches', () => {
  // Flags used to be its own subject; those ids must survive the move.
  const card = geography.parse('PT');
  assert.equal(card.country.code, 'PT');
  assert.equal(card.deck.id, 'flags');
  assert.equal(card.direction, 'forward');
  assert.equal(geography.parse('PT|n').direction, 'reverse');
  assert.ok(geography.cardIds(settings()).includes('PT'));
});

test('capital cards round-trip through their own ids', () => {
  assert.equal(geography.parse('cap|PT').deck.id, 'capitals');
  assert.equal(geography.parse('cap|PT').direction, 'forward');
  assert.equal(geography.parse('cap|PT|r').direction, 'reverse');
  for (const id of geography.cardIds(settings({ decks: ['capitals'], direction: 'mix' }))) {
    assert.ok(geography.parse(id), `unparseable: ${id}`);
  }
  assert.equal(geography.parse('cap|ZZ'), null, 'an unknown country is not invented');
});

test('capitals are graded, with the everyday spellings accepted', () => {
  const card = geography.parse('cap|FR');
  assert.equal(geography.check('Paris', card).level, 'correct');
  assert.equal(geography.check('paris', card).level, 'correct');
  assert.equal(geography.check('Lyon', card).level, 'wrong');
  assert.equal(geography.check('PARIS', card).level, 'correct');
  assert.equal(geography.check('', card).level, 'wrong');
  // Punctuation is not the thing being tested.
  assert.equal(geography.check('Washington DC', geography.parse('cap|US')).level, 'correct');
  assert.equal(geography.check('Washington, D.C.', geography.parse('cap|US')).level, 'correct');
});

test('countries with more than one capital accept any of them', () => {
  // Marking a defensible answer wrong teaches nothing.
  for (const [code, answers] of [
    ['ZA', ['Pretoria', 'Cape Town', 'Bloemfontein']],
    ['BO', ['Sucre', 'La Paz']],
    ['NL', ['Amsterdam', 'The Hague']],
    ['CI', ['Yamoussoukro', 'Abidjan']],
    ['TZ', ['Dodoma', 'Dar es Salaam']],
  ]) {
    for (const answer of answers) {
      assert.equal(
        geography.check(answer, geography.parse(`cap|${code}`)).level, 'correct',
        `${code}: ${answer}`,
      );
    }
  }
});

test('country names accept their everyday aliases in both decks', () => {
  assert.equal(geography.check('USA', geography.parse('US')).level, 'correct');
  assert.equal(geography.check('UK', geography.parse('cap|GB|r')).level, 'correct');
  assert.equal(geography.check('Ivory Coast', geography.parse('CI')).level, 'correct');
});

test('recalling a flag is self-graded; everything else is typed', () => {
  assert.equal(geography.typable(geography.parse('PT|n')), false);
  assert.equal(geography.check('anything', geography.parse('PT|n')), null);
  for (const id of ['PT', 'cap|PT', 'cap|PT|r']) {
    assert.equal(geography.typable(geography.parse(id)), true, id);
  }
});

test('each card describes itself for the recap', () => {
  assert.deepEqual(geography.faces(geography.parse('cap|FR')), { question: 'France', answer: 'Paris' });
  assert.deepEqual(geography.faces(geography.parse('cap|FR|r')), { question: 'Paris', answer: 'France' });
  assert.equal(geography.faces(geography.parse('FR')).answer, 'France');
});

test('settings that no longer make sense fall back rather than emptying the deck', () => {
  assert.deepEqual(settings({ regions: [] }).regions, REGIONS);
  assert.deepEqual(settings({ decks: ['moons'] }).decks, geography.defaults.decks);
  assert.deepEqual(settings({ decks: [] }).decks, geography.defaults.decks);
  assert.equal(settings({ direction: 'sideways' }).direction, 'forward');
});

test('a single deck chosen before decks could be mixed is kept', () => {
  // The setting used to be one radio value; nobody should be reset to flags
  // because they had picked capitals.
  const carried = settings({ deck: 'capitals' });
  assert.deepEqual(carried.decks, ['capitals']);
  assert.equal(carried.deck, undefined, 'the old key is not left lying around');
});

test('history from the old flags subject is carried over, not dropped', () => {
  const store = { 'flashcards.progress.flags.v1': { PT: { reps: 3 } } };
  geography.migrate((k) => store[k] ?? null, (k, v) => { store[k] = v; });
  assert.deepEqual(store['flashcards.progress.geography.v1'], { PT: { reps: 3 } });

  // ...and an existing geography history is never overwritten by it.
  const held = { 'flashcards.progress.flags.v1': { PT: { reps: 3 } }, 'flashcards.progress.geography.v1': { FR: { reps: 9 } } };
  geography.migrate((k) => held[k] ?? null, (k, v) => { held[k] = v; });
  assert.deepEqual(held['flashcards.progress.geography.v1'], { FR: { reps: 9 } });
});

test('punctuation and accents do not decide a geography answer', () => {
  const us = geography.parse('cap|US');
  for (const spelling of ['Washington D.C.', 'Washington, D.C.', 'washington dc', 'Washington']) {
    assert.equal(geography.check(spelling, us).level, 'correct', spelling);
  }
  // The source data is inconsistent about accents — Bogotá arrives accented,
  // Reykjavik does not — so marking them would penalise the better spelling.
  assert.equal(geography.check('Bogota', geography.parse('cap|CO')).level, 'correct');
  assert.equal(geography.check('Bogotá', geography.parse('cap|CO')).level, 'correct');
  assert.equal(geography.check('Reykjavik', geography.parse('cap|IS')).level, 'correct');
  assert.equal(geography.check('Reykjavík', geography.parse('cap|IS')).level, 'correct');
  // Knowing the place is still the bar.
  assert.equal(geography.check('Oslo', geography.parse('cap|IS')).level, 'wrong');
});
