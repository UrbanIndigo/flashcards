/**
 * Geography: flags, capitals, and whatever else gets added.
 *
 * One subject with several decks that can be studied together, rather than
 * one subject per deck — they share a country list, a set of regions and a
 * sense of what "knowing" means, so splitting them would repeat all three.
 *
 * Each deck is a self-contained definition below: its two directions, how a
 * card is worded, and what counts as an answer. Adding another kind of
 * question means adding one entry to DECKS and nothing else.
 *
 * Flags are images rather than emoji. Emoji flags are drawn by the operating
 * system, so they differ between phones, and several platforms decline to
 * draw them at all and show the two letters instead.
 */

import { COUNTRIES, REGIONS } from './geography-data.js';
import { deaccent } from '../answer.js';

const CORRECT = { level: 'correct', message: 'Correct' };
const WRONG = { level: 'wrong', message: 'Not quite' };

/**
 * Neither punctuation nor accents are being tested here, unlike in French
 * where the accent is part of the word you are learning.
 *
 * "Washington, D.C." and "Washington DC" are plainly the same answer. Accents
 * are subtler: the source data is not consistent about them — Colombia's
 * capital arrives as Bogotá and Iceland's as Reykjavik — so marking accents
 * would penalise Reykjavík, which is the more correct spelling of the two.
 * The question is whether you know the place.
 */
const bare = (value) => deaccent(String(value).toLowerCase()).replace(/[^a-z0-9]+/g, '');

function graded(input, accepted) {
  if (!input || !input.trim()) return WRONG;
  return accepted.some((a) => bare(a) === bare(input)) ? CORRECT : WRONG;
}

const countryNames = (country) => [country.name, ...(country.aka ?? [])];
const capitalNames = (country) => [country.capital, ...(country.capitalAka ?? [])];

function textNode(value) {
  const node = document.createElement('span');
  node.textContent = value;
  return node;
}

/** The variable part of a question, so the eye lands on it first. */
function strong(value) {
  const node = document.createElement('strong');
  node.textContent = value;
  return node;
}

function flagImage(country, className) {
  const img = document.createElement('img');
  img.className = className;
  img.src = `flags/${country.flag}`;
  // Naming the country in the alt text would answer the question out loud
  // for anyone using a screen reader.
  img.alt = className === 'flag-answer' ? `Flag of ${country.name}` : 'A national flag';
  img.decoding = 'async';
  return img;
}

/**
 * The decks. `prefix` and `reverseMark` build the card ids: flags use a bare
 * country code and a "|n" suffix, which is what they used when flags was its
 * own subject, so that history still matches. Anything added later gets a
 * prefix of its own.
 */
const DECKS = [
  {
    id: 'flags',
    label: 'Flags',
    hint: '196 flags',
    prefix: '',
    reverseMark: 'n',
    forward: {
      label: 'Name the country',
      hint: 'flag → country',
      placeholder: 'country…',
      prompt: (c) => ({ pill: 'Which country?', lead: 'Whose flag is this?', nodes: [flagImage(c, 'flag-prompt')] }),
      answer: (c) => ({ answer: c.name, sub: `capital: ${c.capital} · ${c.region}` }),
      faces: (c) => ({ question: `${c.name}'s flag`, answer: c.name }),
      check: (input, c) => graded(input, countryNames(c)),
    },
    reverse: {
      label: 'Recall the flag',
      hint: 'country → flag',
      // Nobody types a flag, so this direction is always self-graded.
      placeholder: '',
      prompt: (c) => ({ pill: 'Which flag?', lead: 'What flag does this country fly?', nodes: [textNode(c.name)] }),
      answer: (c) => ({ answerNodes: [flagImage(c, 'flag-answer')], sub: `${c.name} · ${c.region}` }),
      faces: (c) => ({ question: c.name, answer: '(its flag)' }),
      check: null,
    },
  },
  {
    id: 'capitals',
    label: 'Capitals',
    hint: '196 capitals',
    prefix: 'cap',
    reverseMark: 'r',
    forward: {
      label: 'Name the capital',
      hint: 'country → capital',
      placeholder: 'capital…',
      // Asked as a whole sentence rather than a stem and a separate word,
      // with the country picked out as the part that changes.
      prompt: (c) => ({
        pill: 'Which capital?',
        question: true,
        nodes: [textNode('What is the capital of '), strong(c.name), textNode('?')],
      }),
      answer: (c) => ({ answer: c.capital, sub: `${c.name} · ${c.region}` }),
      faces: (c) => ({ question: c.name, answer: c.capital }),
      check: (input, c) => graded(input, capitalNames(c)),
    },
    reverse: {
      label: 'Name the country',
      hint: 'capital → country',
      placeholder: 'country…',
      prompt: (c) => ({
        pill: 'Which country?',
        question: true,
        nodes: [strong(c.capital), textNode(' is the capital of which country?')],
      }),
      answer: (c) => ({ answer: c.name, sub: `capital: ${c.capital} · ${c.region}` }),
      faces: (c) => ({ question: c.capital, answer: c.name }),
      check: (input, c) => graded(input, countryNames(c)),
    },
  },
];

const DECK_BY_ID = new Map(DECKS.map((deck) => [deck.id, deck]));
const BY_CODE = new Map(COUNTRIES.map((country) => [country.code, country]));

const cardId = (deck, code, direction) => [deck.prefix, code, direction === 'reverse' ? deck.reverseMark : '']
  .filter(Boolean).join('|');

const DIRECTIONS = ['forward', 'reverse', 'mix'];

export const geography = {
  id: 'geography',
  label: 'Geography',
  hint: 'Flags and capitals',

  defaults: {
    decks: ['flags'],
    regions: [...REGIONS],
    direction: 'forward',
  },

  keys: () => ({
    progress: 'flashcards.progress.geography.v1',
    daily: 'flashcards.daily.geography.v1',
    log: 'flashcards.log.geography.v1',
  }),

  storageKeys: () => [
    'flashcards.progress.geography.v1',
    'flashcards.daily.geography.v1',
    'flashcards.log.geography.v1',
  ],

  /**
   * Flags used to be their own subject. Its history is carried over rather
   * than dropped — the flag card ids are unchanged, so it still lines up.
   */
  migrate(read, write) {
    const pairs = [
      ['flashcards.progress.flags.v1', 'flashcards.progress.geography.v1'],
      ['flashcards.daily.flags.v1', 'flashcards.daily.geography.v1'],
      ['flashcards.log.flags.v1', 'flashcards.log.geography.v1'],
    ];
    for (const [from, to] of pairs) {
      const old = read(from);
      if (old && !read(to)) write(to, old);
    }
  },

  normalise(s) {
    // A single deck used to be chosen with a radio. That key only exists in
    // settings saved before decks could be mixed, so where it is still
    // present it wins outright — the subject's defaults are merged in before
    // this runs, so `decks` is always set by then and testing for its absence
    // would silently reset anyone who had picked capitals. Removing it means
    // it can only win once.
    if (s.deck) {
      s.decks = [s.deck];
      delete s.deck;
    }

    s.decks = (s.decks ?? []).filter((id) => DECK_BY_ID.has(id));
    if (!s.decks.length) s.decks = [...this.defaults.decks];
    s.regions = (s.regions ?? []).filter((r) => REGIONS.includes(r));
    if (!s.regions.length) s.regions = [...this.defaults.regions];
    if (!DIRECTIONS.includes(s.direction)) s.direction = this.defaults.direction;
  },

  filters(s) {
    const chosen = s.decks.map((id) => DECK_BY_ID.get(id));
    // With one deck the direction can be named exactly; with several it can
    // only be described, so it lists what each way round means.
    const describe = (direction) => (chosen.length === 1
      ? { label: chosen[0][direction].label, hint: chosen[0][direction].hint }
      : {
        label: direction === 'forward' ? 'Forward' : 'Reverse',
        hint: chosen.map((deck) => deck[direction].hint).join(' · '),
      });

    return [
      {
        id: 'decks',
        legend: 'Decks',
        type: 'checkbox',
        options: DECKS.map((deck) => ({ value: deck.id, label: deck.label, hint: deck.hint })),
      },
      {
        id: 'regions',
        legend: 'Regions',
        type: 'checkbox',
        options: REGIONS.map((region) => ({
          value: region,
          label: region,
          hint: `${COUNTRIES.filter((c) => c.region === region).length}`,
        })),
      },
      {
        id: 'direction',
        legend: 'Direction',
        type: 'radio',
        options: [
          { value: 'forward', ...describe('forward') },
          { value: 'reverse', ...describe('reverse') },
          { value: 'mix', label: 'Mix both', hint: 'alternates between the two' },
        ],
      },
    ];
  },

  cardIds(s) {
    const directions = s.direction === 'mix' ? ['forward', 'reverse'] : [s.direction];
    const ids = [];
    for (const deckId of s.decks) {
      const deck = DECK_BY_ID.get(deckId);
      for (const country of COUNTRIES) {
        if (!s.regions.includes(country.region)) continue;
        for (const direction of directions) ids.push(cardId(deck, country.code, direction));
      }
    }
    return ids;
  },

  parse(id) {
    const parts = id.split('|');
    const prefixed = DECKS.find((d) => d.prefix && d.prefix === parts[0]);
    const deck = prefixed ?? DECK_BY_ID.get('flags');
    const code = prefixed ? parts[1] : parts[0];
    const country = BY_CODE.get(code);
    if (!country) return null;
    const mark = prefixed ? parts[2] : parts[1];
    const direction = mark === deck.reverseMark ? 'reverse' : 'forward';
    return { country, deck, direction, side: deck[direction] };
  },

  prompt: ({ country, side }) => side.prompt(country),
  answer: ({ country, side }) => side.answer(country),
  faces: ({ country, side }) => side.faces(country),
  extra: () => null,

  typable: ({ side }) => side.check !== null,
  check: (input, { country, side }) => (side.check ? side.check(input, country) : null),
  placeholder: ({ side }) => side.placeholder,
};
