/**
 * Geography: flags and capitals.
 *
 * One subject with several decks, rather than one subject per deck — they
 * share a country list, a set of regions and a sense of what "knowing" means,
 * so splitting them would only mean repeating all three.
 *
 * Flags are images rather than emoji. Emoji flags are drawn by the operating
 * system, so they differ between phones, and several platforms decline to
 * draw them at all and show the two letters instead.
 */

import { COUNTRIES, REGIONS } from './geography-data.js';
import { deaccent } from '../answer.js';

const DECKS = [
  ['flags', 'Flags', '196 flags'],
  ['capitals', 'Capitals', '196 capitals'],
];

/** What each direction is called depends on which deck you are in. */
const DIRECTIONS = {
  flags: [
    ['forward', 'Name the country', 'flag → country'],
    ['reverse', 'Recall the flag', 'country → flag'],
    ['mix', 'Mix both', 'alternates between the two'],
  ],
  capitals: [
    ['forward', 'Name the capital', 'country → capital'],
    ['reverse', 'Name the country', 'capital → country'],
    ['mix', 'Mix both', 'alternates between the two'],
  ],
};

const BY_CODE = new Map(COUNTRIES.map((country) => [country.code, country]));

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

const textNode = (value) => {
  const node = document.createElement('span');
  node.textContent = value;
  return node;
};

export const geography = {
  id: 'geography',
  label: 'Geography',
  hint: 'Flags and capitals',

  defaults: {
    deck: 'flags',
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
    if (!DECKS.some(([id]) => id === s.deck)) s.deck = this.defaults.deck;
    s.regions = (s.regions ?? []).filter((r) => REGIONS.includes(r));
    if (!s.regions.length) s.regions = [...this.defaults.regions];
    if (!DIRECTIONS[s.deck].some(([id]) => id === s.direction)) s.direction = this.defaults.direction;
  },

  filters(s) {
    return [
      {
        id: 'deck',
        legend: 'Deck',
        type: 'radio',
        options: DECKS.map(([value, label, hint]) => ({ value, label, hint })),
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
        options: DIRECTIONS[s.deck].map(([value, label, hint]) => ({ value, label, hint })),
      },
    ];
  },

  cardIds(s) {
    const directions = s.direction === 'mix' ? ['forward', 'reverse'] : [s.direction];
    const ids = [];
    for (const country of COUNTRIES) {
      if (!s.regions.includes(country.region)) continue;
      for (const direction of directions) {
        // Flag card ids are the bare code and code|n, exactly as they were
        // when flags was its own subject, so that history still matches.
        if (s.deck === 'flags') {
          ids.push(direction === 'reverse' ? `${country.code}|n` : country.code);
        } else {
          ids.push(direction === 'reverse' ? `cap|${country.code}|r` : `cap|${country.code}`);
        }
      }
    }
    return ids;
  },

  parse(id) {
    const parts = id.split('|');
    const capitals = parts[0] === 'cap';
    const code = capitals ? parts[1] : parts[0];
    const country = BY_CODE.get(code);
    if (!country) return null;
    const reverse = capitals ? parts[2] === 'r' : parts[1] === 'n';
    return { country, deck: capitals ? 'capitals' : 'flags', direction: reverse ? 'reverse' : 'forward' };
  },

  prompt({ country, deck, direction }) {
    if (deck === 'capitals') {
      return direction === 'reverse'
        ? { pill: 'Which country?', lead: 'Which country has this capital?', nodes: [textNode(country.capital)] }
        : { pill: 'Which capital?', lead: 'What is the capital of', nodes: [textNode(country.name)] };
    }
    return direction === 'reverse'
      ? { pill: 'Which flag?', lead: 'What flag does this country fly?', nodes: [textNode(country.name)] }
      : { pill: 'Which country?', lead: 'Whose flag is this?', nodes: [flagImage(country, 'flag-prompt')] };
  },

  answer({ country, deck, direction }) {
    if (deck === 'capitals') {
      return direction === 'reverse'
        ? { answer: country.name, sub: `capital: ${country.capital} · ${country.region}` }
        : { answer: country.capital, sub: `${country.name} · ${country.region}` };
    }
    return direction === 'reverse'
      ? { answerNodes: [flagImage(country, 'flag-answer')], sub: `${country.name} · ${country.region}` }
      : { answer: country.name, sub: `capital: ${country.capital} · ${country.region}` };
  },

  extra: () => null,

  faces({ country, deck, direction }) {
    if (deck === 'capitals') {
      return direction === 'reverse'
        ? { question: country.capital, answer: country.name }
        : { question: country.name, answer: country.capital };
    }
    return direction === 'reverse'
      ? { question: country.name, answer: '(its flag)' }
      : { question: `${country.name}'s flag`, answer: country.name };
  },

  /** Nobody types a flag, so recalling one is always self-graded. */
  typable: ({ deck, direction }) => !(deck === 'flags' && direction === 'reverse'),

  check(input, { country, deck, direction }) {
    if (deck === 'flags') {
      if (direction === 'reverse') return null;
      return graded(input, [country.name, ...(country.aka ?? [])]);
    }
    return direction === 'reverse'
      ? graded(input, [country.name, ...(country.aka ?? [])])
      : graded(input, [country.capital, ...(country.capitalAka ?? [])]);
  },

  placeholder({ deck, direction }) {
    if (deck === 'flags') return direction === 'reverse' ? '' : 'country…';
    return direction === 'reverse' ? 'country…' : 'capital…';
  },
};
