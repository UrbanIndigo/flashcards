/**
 * Flags of the world.
 *
 * A much simpler subject than the French one, which is the point: it shows
 * how little a new subject has to provide. There is no generator here, just
 * a list — the flag itself is derived from the country's two-letter code.
 */

import { COUNTRIES, REGIONS, flagOf } from './flags-data.js';
import { deaccent, normalise } from '../answer.js';

const DIRECTIONS = [
  ['flag', 'Name the country', '🇵🇹 → Portugal'],
  ['name', 'Recall the flag', 'Portugal → 🇵🇹'],
  ['mix', 'Mix both', 'alternates between the two'],
];

const BY_CODE = new Map(COUNTRIES.map((country) => [country.code, country]));

const CORRECT = { level: 'correct', message: 'Correct' };
const ACCENTS = { level: 'close', message: 'Almost — check the spelling' };
const WRONG = { level: 'wrong', message: 'Not quite' };

const big = (content, className) => {
  const node = document.createElement('span');
  if (className) node.className = className;
  node.textContent = content;
  return node;
};

export const flags = {
  id: 'flags',
  label: 'Flags',
  hint: '196 countries',

  defaults: {
    regions: [...REGIONS],
    direction: 'flag',
  },

  keys() {
    return {
      progress: 'flashcards.progress.flags.v1',
      daily: 'flashcards.daily.flags.v1',
      log: 'flashcards.log.flags.v1',
    };
  },

  storageKeys: () => [
    'flashcards.progress.flags.v1',
    'flashcards.daily.flags.v1',
    'flashcards.log.flags.v1',
  ],

  normalise(s) {
    s.regions = (s.regions ?? []).filter((r) => REGIONS.includes(r));
    if (!s.regions.length) s.regions = [...this.defaults.regions];
    if (!DIRECTIONS.some(([id]) => id === s.direction)) s.direction = this.defaults.direction;
  },

  filters() {
    return [
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
        options: DIRECTIONS.map(([value, label, hint]) => ({ value, label, hint })),
      },
    ];
  },

  cardIds(s) {
    const directions = s.direction === 'mix' ? ['flag', 'name'] : [s.direction];
    const ids = [];
    for (const country of COUNTRIES) {
      if (!s.regions.includes(country.region)) continue;
      for (const direction of directions) {
        ids.push(direction === 'name' ? `${country.code}|n` : country.code);
      }
    }
    return ids;
  },

  parse(id) {
    const [code, reverse] = id.split('|');
    const country = BY_CODE.get(code);
    if (!country) return null;
    return { country, direction: reverse === 'n' ? 'name' : 'flag' };
  },

  prompt({ country, direction }) {
    if (direction === 'name') {
      return {
        pill: 'Which flag?',
        lead: 'What flag does this country fly?',
        nodes: [big(country.name)],
      };
    }
    return {
      pill: 'Which country?',
      lead: 'Whose flag is this?',
      nodes: [big(flagOf(country.code), 'flag')],
    };
  },

  answer({ country, direction }) {
    if (direction === 'name') {
      return { answer: flagOf(country.code), big: true, sub: `${country.name} · ${country.region}` };
    }
    return { answer: country.name, sub: country.region };
  },

  extra: () => null,

  faces({ country, direction }) {
    return direction === 'name'
      ? { question: country.name, answer: flagOf(country.code) }
      : { question: flagOf(country.code), answer: country.name };
  },

  /** Nobody types a flag, so that direction is always self-graded. */
  typable: ({ direction }) => direction !== 'name',

  check(input, { country, direction }) {
    if (direction === 'name') return null;
    if (!input || !input.trim()) return WRONG;

    const given = normalise(input);
    const accepted = [country.name, ...(country.aka ?? [])].map(normalise);
    if (accepted.includes(given)) return CORRECT;
    // "cote d'ivoire" for "Côte d'Ivoire" is knowing the country, not a miss.
    if (accepted.map(deaccent).includes(deaccent(given))) return ACCENTS;
    return WRONG;
  },

  placeholder({ direction }) {
    return direction === 'name' ? '' : 'country…';
  },
};
