import test from 'node:test';
import assert from 'node:assert/strict';

import { flags } from '../js/subjects/flags.js';
import { COUNTRIES, REGIONS, flagOf } from '../js/subjects/flags-data.js';

const settings = (over = {}) => {
  const s = { ...flags.defaults, ...over };
  flags.normalise(s);
  return s;
};

test('the dataset is whole and sensibly grouped', () => {
  assert.ok(COUNTRIES.length > 190, `only ${COUNTRIES.length}`);
  const codes = new Set();
  for (const country of COUNTRIES) {
    assert.match(country.code, /^[A-Z]{2}$/, country.code);
    assert.ok(!codes.has(country.code), `duplicate ${country.code}`);
    codes.add(country.code);
    assert.ok(country.name && !/[(),]/.test(country.name), `awkward name: ${country.name}`);
    assert.ok(REGIONS.includes(country.region), `${country.name}: ${country.region}`);
  }
  for (const region of REGIONS) {
    assert.ok(COUNTRIES.some((c) => c.region === region), `${region} is empty`);
  }
});

test('a flag is derived from the code, not stored', () => {
  assert.equal(flagOf('FR'), '🇫🇷');
  assert.equal(flagOf('JP'), '🇯🇵');
  // Two code points, one per letter — which is why the deck is tiny.
  assert.equal([...flagOf('BR')].length, 2);
  for (const country of COUNTRIES) {
    assert.equal([...flagOf(country.code)].length, 2, country.code);
  }
});

test('card counts follow the region and direction settings', () => {
  const all = flags.cardIds(settings());
  assert.equal(all.length, COUNTRIES.length, 'one card per country in one direction');

  const both = flags.cardIds(settings({ direction: 'mix' }));
  assert.equal(both.length, COUNTRIES.length * 2);

  const europe = flags.cardIds(settings({ regions: ['Europe'] }));
  assert.equal(europe.length, COUNTRIES.filter((c) => c.region === 'Europe').length);
});

test('settings that no longer make sense fall back rather than emptying the deck', () => {
  assert.deepEqual(settings({ regions: [] }).regions, REGIONS);
  assert.deepEqual(settings({ regions: ['Atlantis'] }).regions, REGIONS);
  assert.equal(settings({ direction: 'sideways' }).direction, flags.defaults.direction);
});

test('cards round-trip through their ids', () => {
  for (const id of flags.cardIds(settings({ direction: 'mix' }))) {
    const card = flags.parse(id);
    assert.ok(card, `unparseable: ${id}`);
    assert.ok(card.country.name);
    assert.ok(['flag', 'name'].includes(card.direction));
  }
  assert.equal(flags.parse('ZZ'), null, 'an unknown country is not invented');
  assert.equal(flags.parse('PT').direction, 'flag');
  assert.equal(flags.parse('PT|n').direction, 'name');
});

test('typed country names are graded', () => {
  const card = flags.parse('PT');
  assert.equal(flags.check('Portugal', card).level, 'correct');
  assert.equal(flags.check('  portugal ', card).level, 'correct');
  assert.equal(flags.check('Spain', card).level, 'wrong');
  assert.equal(flags.check('', card).level, 'wrong');
});

test('the everyday name and its aliases are both accepted', () => {
  assert.equal(flags.check('United States', flags.parse('US')).level, 'correct');
  assert.equal(flags.check('USA', flags.parse('US')).level, 'correct');
  assert.equal(flags.check('UK', flags.parse('GB')).level, 'correct');
  assert.equal(flags.check('South Korea', flags.parse('KR')).level, 'correct');
  assert.equal(flags.check('Ivory Coast', flags.parse('CI')).level, 'correct');
  assert.equal(flags.check('Czech Republic', flags.parse('CZ')).level, 'correct');
});

test('a missing accent is a near miss, not a failure', () => {
  // Knowing the country is the point; the circumflex is not.
  assert.equal(flags.check("Cote d'Ivoire", flags.parse('CI')).level, 'close');
  assert.equal(flags.check("Côte d'Ivoire", flags.parse('CI')).level, 'correct');
});

test('nobody types a flag, so that direction is self-graded', () => {
  assert.equal(flags.typable(flags.parse('PT|n')), false);
  assert.equal(flags.typable(flags.parse('PT')), true);
  assert.equal(flags.check('anything', flags.parse('PT|n')), null);
});

test('both faces of a card describe themselves for the recap', () => {
  assert.deepEqual(flags.faces(flags.parse('PT')), { question: '🇵🇹', answer: 'Portugal' });
  assert.deepEqual(flags.faces(flags.parse('PT|n')), { question: 'Portugal', answer: '🇵🇹' });
});

test('the subject owns storage keys that cannot collide with French', () => {
  const keys = [...flags.storageKeys(), ...Object.values(flags.keys())];
  for (const key of keys) assert.match(key, /flags/, key);
});
