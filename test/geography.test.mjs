import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

import { geography } from '../js/subjects/geography.js';
import { COUNTRIES, REGIONS } from '../js/subjects/geography-data.js';
import { SHAPES, SHAPE_BOX } from '../js/subjects/shapes-data.js';
import { BORDERS, OVERSEAS } from '../js/subjects/borders-data.js';

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));
const namesFor = (code) => BORDERS[code].map((c) => BY_CODE.get(c).name).sort();

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

test('each deck produces a card per country per direction it has', () => {
  // Flags only go one way: a country → flag card could only ever be
  // self-graded, so it does not exist.
  assert.equal(geography.cardIds(settings({ decks: ['flags'] })).length, COUNTRIES.length);
  assert.equal(geography.cardIds(settings({ decks: ['flags'], direction: 'mix' })).length, COUNTRIES.length);
  assert.equal(geography.cardIds(settings({ decks: ['capitals'] })).length, COUNTRIES.length);
  assert.equal(
    geography.cardIds(settings({ decks: ['capitals'], direction: 'mix' })).length,
    COUNTRIES.length * 2,
  );
  const europe = geography.cardIds(settings({ regions: ['Europe'] }));
  assert.equal(europe.length, COUNTRIES.filter((c) => c.region === 'Europe').length);
});

test('a deck with one direction offers no direction control', () => {
  const flagsOnly = geography.filters(settings({ decks: ['flags'] }));
  assert.equal(flagsOnly.find((f) => f.id === 'direction'), undefined, 'nothing to choose');
  assert.equal(settings({ decks: ['flags'] }).direction, 'forward');
  // A stored direction the deck cannot offer falls back rather than emptying.
  assert.equal(settings({ decks: ['flags'], direction: 'reverse' }).direction, 'forward');
  assert.ok(geography.filters(settings({ decks: ['capitals'] })).some((f) => f.id === 'direction'));
});

test('decks can be studied together', () => {
  const both = geography.cardIds(settings({ decks: ['flags', 'capitals'] }));
  assert.equal(both.length, COUNTRIES.length * 2);
  // Both kinds really are in the one pool, not just counted twice.
  assert.ok(both.includes('PT'), 'a flag card');
  assert.ok(both.includes('cap|PT'), 'a capital card');
  assert.equal(new Set(both).size, both.length, 'no id collides between decks');

  // Flags one way, capitals both: three cards per country, not four.
  const everything = geography.cardIds(settings({ decks: ['flags', 'capitals'], direction: 'mix' }));
  assert.equal(everything.length, COUNTRIES.length * 3);
  assert.equal(new Set(everything).size, everything.length);

  // Reverse with both decks on yields only the deck that has a reverse.
  const reversed = geography.cardIds(settings({ decks: ['flags', 'capitals'], direction: 'reverse' }));
  assert.equal(reversed.length, COUNTRIES.length);
  assert.ok(reversed.every((id) => id.startsWith('cap|')));
});

test('the direction is named exactly for one deck and described for several', () => {
  const one = geography.filters(settings({ decks: ['capitals'] })).find((f) => f.id === 'direction');
  assert.deepEqual(one.options.map((o) => o.label), ['Name the capital', 'Name the country', 'Mix both']);

  const many = geography.filters(settings({ decks: ['flags', 'capitals'] })).find((f) => f.id === 'direction');
  assert.deepEqual(many.options.map((o) => o.label), ['Forward', 'Reverse', 'Mix both']);
  assert.match(many.options[0].hint, /flag → country · country → capital/);
  // Only capitals has a reverse, so only it is named there.
  assert.equal(many.options[1].hint, 'capital → country');
});

test('flag card ids are unchanged, so the old history still matches', () => {
  // Flags used to be its own subject; those ids must survive the move.
  const card = geography.parse('PT');
  assert.equal(card.country.code, 'PT');
  assert.equal(card.deck.id, 'flags');
  assert.equal(card.direction, 'forward');
  assert.ok(geography.cardIds(settings()).includes('PT'));
  // The country → flag direction is gone, so its old ids describe nothing
  // and the app skips them rather than rendering a broken card.
  assert.equal(geography.parse('PT|n'), null);
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

test('every card that exists can be typed', () => {
  // The one direction that could not be typed has been removed rather than
  // left as a card you grade yourself.
  for (const id of geography.cardIds(settings({ decks: ['flags', 'capitals'], direction: 'mix' }))) {
    assert.equal(geography.typable(geography.parse(id)), true, id);
    assert.notEqual(geography.check('something', geography.parse(id)), null, id);
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

test('country outlines are drawn from real geometry, at a size that can ship', () => {
  const codes = Object.keys(SHAPES);
  assert.ok(codes.length > 165, `only ${codes.length} outlines`);
  for (const [code, path] of Object.entries(SHAPES)) {
    assert.ok(BY_CODE.has(code), `outline for an unknown country: ${code}`);
    assert.match(path, /^M-?\d+ -?\d+l[-\d ]+Z/, code);
    // Every coordinate has to land inside the box the SVG declares.
    for (const value of path.match(/-?\d+/g).slice(0, 2)) {
      assert.ok(Number(value) >= 0 && Number(value) <= SHAPE_BOX, `${code}: ${value}`);
    }
  }
  // Precached on a phone alongside half a megabyte of flags, so it has to
  // stay a shape library rather than a map.
  const bytes = readFileSync(new URL('../js/subjects/shapes-data.js', import.meta.url)).length;
  assert.ok(bytes < 220 * 1024, `${Math.round(bytes / 1024)}KB of outlines`);
});

test('countries too small to have an outline are left out of that deck', () => {
  // Monaco is two square kilometres: its outline is a squiggle, not a shape.
  for (const code of ['MC', 'VA', 'SM', 'SG', 'MT', 'MV']) {
    assert.equal(SHAPES[code], undefined, code);
    assert.equal(geography.parse(`map|${code}`), null, code);
  }
  for (const code of ['LU', 'CY', 'JM', 'QA', 'BN']) assert.ok(SHAPES[code], code);
  assert.ok(!geography.cardIds(settings({ decks: ['shapes'] })).includes('map|MC'));
});

test('borders are symmetric, because a border has two sides', () => {
  for (const [code, list] of Object.entries(BORDERS)) {
    assert.equal(new Set(list).size, list.length, `${code} repeats a neighbour`);
    for (const other of list) {
      assert.ok(BY_CODE.has(other), `${code} borders an unknown country: ${other}`);
      assert.ok(BORDERS[other]?.includes(code), `${code} borders ${other} but not the other way`);
    }
  }
  for (const [code, { also }] of Object.entries(OVERSEAS)) {
    for (const other of also) {
      assert.ok(OVERSEAS[other]?.also.includes(code), `${code}-${other} is one-sided`);
      assert.ok(!BORDERS[code]?.includes(other), `${code}-${other} is counted twice`);
    }
  }
});

test('the borders match the map anyone would draw from memory', () => {
  assert.deepEqual(namesFor('PT'), ['Spain']);
  assert.deepEqual(namesFor('GB'), ['Ireland']);
  assert.deepEqual(namesFor('US'), ['Canada', 'Mexico']);
  assert.deepEqual(
    namesFor('FR'),
    ['Andorra', 'Belgium', 'Germany', 'Italy', 'Luxembourg', 'Monaco', 'Spain', 'Switzerland'],
  );
  assert.equal(BORDERS.CN.length, 14);
  assert.equal(BORDERS.RU.length, 14);
  // An island is not asked at all: forty cards whose answer is "none" would
  // only teach you to type "none".
  for (const code of ['JP', 'IS', 'AU', 'NZ', 'MG', 'CU']) {
    assert.equal(BORDERS[code], undefined, code);
    assert.equal(geography.parse(`bd|${code}`), null, code);
  }
});

test('a border through an overseas territory is accepted but never required', () => {
  // France really does border Brazil, along French Guiana. Nobody listing
  // the countries around France means Brazil, and nobody is wrong to.
  const france = geography.parse('bd|FR');
  const full = 'Belgium, Luxembourg, Germany, Switzerland, Italy, Monaco, Spain, Andorra';
  assert.equal(geography.check(full, france).level, 'correct');
  assert.equal(geography.check(`${full}, Brazil, Suriname`, france).level, 'correct');
  assert.equal(geography.check(`${full}, Portugal`, france).level, 'close');
  assert.ok(geography.answer(france).note.includes('French Guiana'));
  assert.equal(geography.check('Brazil, Guyana, France', geography.parse('bd|SR')).level, 'correct');
});

test('a list of neighbours is marked as a set, however it is written', () => {
  const poland = geography.parse('bd|PL');
  const all = 'Germany, Czechia, Slovakia, Ukraine, Belarus, Lithuania, Russia';
  assert.equal(geography.check(all, poland).level, 'correct');
  assert.equal(geography.check(all.split(', ').reverse().join('; '), poland).level, 'correct');
  assert.equal(geography.check(all.replaceAll(', ', '\n'), poland).level, 'correct');
  assert.equal(geography.check(all.toLowerCase(), poland).level, 'correct');
  // The last two written as people write them.
  assert.equal(geography.check(all.replace(', Russia', ' and Russia'), poland).level, 'correct');
  // Aliases work here too.
  assert.equal(geography.check(all.replace('Czechia', 'Czech Republic'), poland).level, 'correct');
});

test('a country whose name contains "and" is not split down the middle', () => {
  const croatia = geography.parse('bd|HR');
  assert.equal(
    geography.check('Slovenia, Hungary, Serbia, Bosnia and Herzegovina, Montenegro', croatia).level,
    'correct',
  );
  assert.equal(
    geography.check('Slovenia and Hungary and Serbia and Bosnia and Herzegovina and Montenegro', croatia).level,
    'correct',
  );
});

test('a partial list of neighbours says what was missed', () => {
  const poland = geography.parse('bd|PL');
  const six = 'Germany, Czechia, Slovakia, Ukraine, Belarus, Lithuania';
  assert.deepEqual(geography.check(six, poland), { level: 'close', message: 'Missed Russia' });
  // Most of a long list is a near miss; two out of seven is not.
  assert.equal(geography.check('Germany, Czechia', poland).level, 'wrong');
  assert.match(geography.check('Germany, Czechia', poland).message, /Missed 5 of them/);
  assert.equal(geography.check('', poland).level, 'wrong');
});

test('naming a country that is nowhere near is a different mistake', () => {
  const portugal = geography.parse('bd|PT');
  assert.deepEqual(
    geography.check('Spain, France', portugal),
    { level: 'close', message: 'Not a neighbour: France' },
  );
  assert.equal(geography.check('France', portugal).level, 'wrong', 'wrong and incomplete');
  assert.match(geography.check('Spain, Atlantis', portugal).message, /Atlantis/);
});

test('all four decks can be studied together without their ids colliding', () => {
  const all = settings({ decks: ['flags', 'capitals', 'shapes', 'borders'], direction: 'mix' });
  const ids = geography.cardIds(all);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(
    ids.length,
    COUNTRIES.length * 3 + Object.keys(SHAPES).length + Object.keys(BORDERS).length,
  );
  for (const id of ids) assert.ok(geography.parse(id), `unparseable: ${id}`);
  // Bangladesh's flag card and the borders prefix are not the same string.
  assert.equal(geography.parse('BD').deck.id, 'flags');
  assert.equal(geography.parse('bd|BD').deck.id, 'borders');
});

test('every card in every deck can be typed and marked', () => {
  const all = settings({ decks: ['flags', 'capitals', 'shapes', 'borders'], direction: 'mix' });
  for (const id of geography.cardIds(all)) {
    const card = geography.parse(id);
    assert.equal(geography.typable(card), true, id);
    assert.notEqual(geography.check('something', card), null, id);
    assert.ok(geography.answer(card).answer, `no answer: ${id}`);
    assert.ok(geography.faces(card).question, `no recap wording: ${id}`);
  }
});

test('the region counts follow the decks that are on', () => {
  const regions = (decks) => Object.fromEntries(
    geography.filters(settings({ decks })).find((f) => f.id === 'regions')
      .options.map((o) => [o.value, Number(o.hint)]),
  );
  const all = COUNTRIES.filter((c) => c.region === 'Oceania').length;
  assert.equal(regions(['flags']).Oceania, all);
  // Papua New Guinea is the only country in Oceania with a land border, and
  // saying so beats an empty session with no explanation.
  assert.equal(regions(['borders']).Oceania, 1);
  assert.equal(regions(['flags', 'borders']).Oceania, all, 'a country counted once, not twice');
});

test('a country whose name wants an article gets one', () => {
  // "This is Republic of the Congo" is not a sentence anybody would write.
  // A question is built out of DOM nodes, which here need only hold text.
  globalThis.document = { createElement: () => ({ textContent: '' }) };
  const asked = (id) => geography.prompt(geography.parse(id)).nodes.map((n) => n.textContent).join('');
  assert.equal(asked('bd|CG'), 'This is the Republic of the Congo. Which countries does it border?');
  assert.equal(asked('bd|GB'), 'This is the United Kingdom. Which countries does it border?');
  assert.equal(asked('bd|FR'), 'This is France. Which countries does it border?');
  assert.equal(asked('cap|NL'), 'What is the capital of the Netherlands?');
  assert.equal(asked('cap|JP'), 'What is the capital of Japan?');
  delete globalThis.document;
});
