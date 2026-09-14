/**
 * Geography: flags, capitals, outlines, borders.
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
import { SHAPES, SHAPE_BOX } from './shapes-data.js';
import { BORDERS, OVERSEAS } from './borders-data.js';
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

const BY_CODE = new Map(COUNTRIES.map((country) => [country.code, country]));
const nameOf = (code) => BY_CODE.get(code).name;
const namesOf = (codes) => codes.map(nameOf).sort((a, b) => a.localeCompare(b));

const BY_NAME = new Map();
for (const country of COUNTRIES) {
  for (const name of countryNames(country)) BY_NAME.set(bare(name), country.code);
}

/** "Andorra, France and Spain", or a count once naming them all stops helping. */
function listed(names) {
  if (names.length > 3) return `${names.length} of them`;
  if (names.length < 2) return names[0];
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

/**
 * Splits a typed list of countries — without splitting Bosnia and
 * Herzegovina down the middle. A chunk that is already a country is left
 * alone, and only one that is not gets broken at "and".
 */
function split(input) {
  const out = [];
  for (const chunk of input.split(/[,;\n/]+/)) {
    const piece = chunk.trim();
    if (!piece) continue;
    if (BY_NAME.has(bare(piece))) {
      out.push(piece);
      continue;
    }
    const parts = piece.split(/\s+and\s+|\s*&\s*/i).map((p) => p.trim()).filter(Boolean);
    // "Serbia and Bosnia and Herzegovina" is two countries, not three: where
    // two pieces spell a country, the "and" between them was never a
    // separator.
    for (let i = 0; i < parts.length; i += 1) {
      const joined = `${parts[i]} and ${parts[i + 1]}`;
      if (i + 1 < parts.length && BY_NAME.has(bare(joined))) {
        out.push(joined);
        i += 1;
      } else {
        out.push(parts[i]);
      }
    }
  }
  return out;
}

/**
 * A list answer, marked as a set: order is not the question, and neither is
 * how you separated them.
 */
function checkBorders(input, country) {
  const required = BORDERS[country.code];
  const allowed = new Set([...required, ...(OVERSEAS[country.code]?.also ?? [])]);
  const answers = split(input ?? '');
  if (!answers.length) return WRONG;

  const found = new Set();
  const wrong = [];
  for (const answer of answers) {
    const code = BY_NAME.get(bare(answer));
    if (code && allowed.has(code)) found.add(code);
    else wrong.push(code ? nameOf(code) : answer);
  }
  const missed = required.filter((code) => !found.has(code));

  if (!missed.length && !wrong.length) return CORRECT;
  if (wrong.length) {
    // Naming a country that is nowhere near is a different mistake from
    // stopping one short, and worth saying out loud.
    return missed.length ? WRONG : { level: 'close', message: `Not a neighbour: ${listed(wrong)}` };
  }
  // Most of a long list is a near miss; a third of it is not.
  const level = found.size * 2 >= required.length ? 'close' : 'wrong';
  return { level, message: `Missed ${listed(namesOf(missed))}` };
}

function textNode(value) {
  const node = document.createElement('span');
  node.textContent = value;
  return node;
}

/**
 * Countries whose name wants an article in a sentence: it is the Netherlands
 * and the United Kingdom, but Spain and Japan.
 */
const ARTICLE = /\b(Republic|Kingdom|States|Emirates|Islands)\b/;
const ALSO_THE = new Set(['Bahamas', 'Comoros', 'Gambia', 'Maldives', 'Netherlands', 'Philippines', 'Seychelles']);
const the = (country) => (ARTICLE.test(country.name) || ALSO_THE.has(country.name) ? 'the ' : '');

/** The variable part of a question, so the eye lands on it first. */
function strong(value) {
  const node = document.createElement('strong');
  node.textContent = value;
  return node;
}

function flagImage(country) {
  const img = document.createElement('img');
  img.className = 'flag-prompt';
  img.src = `flags/${country.flag}`;
  // Naming the country here would answer the question out loud for anyone
  // using a screen reader.
  img.alt = 'A national flag';
  img.decoding = 'async';
  return img;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/** The outline, drawn in the page rather than fetched, so it takes the theme. */
function shapeOutline(country) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'shape-prompt');
  svg.setAttribute('viewBox', `0 0 ${SHAPE_BOX} ${SHAPE_BOX}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'The outline of a country');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', SHAPES[country.code]);
  svg.append(path);
  return svg;
}

const countable = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/**
 * The decks. `prefix` and `reverseMark` build the card ids: flags use a bare
 * country code and a "|n" suffix, which is what they used when flags was its
 * own subject, so that history still matches. Anything added later gets a
 * prefix of its own.
 *
 * `countries` is the deck's own share of the country list. Not every country
 * has an outline worth guessing, and forty of them have no land border at
 * all, so a deck says which ones it can ask about.
 */
const DECKS = [
  {
    id: 'flags',
    label: 'Flags',
    noun: 'flags',
    prefix: '',
    reverseMark: 'n',
    countries: COUNTRIES,
    forward: {
      label: 'Name the country',
      hint: 'flag → country',
      placeholder: 'country…',
      prompt: (c) => ({ pill: 'Which country?', lead: 'Whose flag is this?', nodes: [flagImage(c)] }),
      answer: (c) => ({ answer: c.name, sub: `capital: ${c.capital} · ${c.region}` }),
      faces: (c) => ({ question: `${c.name}'s flag`, answer: c.name }),
      check: (input, c) => graded(input, countryNames(c)),
    },
    // No country → flag direction: it could only ever be self-graded, since
    // there is no way to answer it except by deciding for yourself whether
    // the flag you pictured was right.
  },
  {
    id: 'capitals',
    label: 'Capitals',
    noun: 'capitals',
    prefix: 'cap',
    reverseMark: 'r',
    countries: COUNTRIES,
    forward: {
      label: 'Name the capital',
      hint: 'country → capital',
      placeholder: 'capital…',
      // Asked as a whole sentence rather than a stem and a separate word,
      // with the country picked out as the part that changes.
      prompt: (c) => ({
        pill: 'Which capital?',
        question: true,
        nodes: [textNode(`What is the capital of ${the(c)}`), strong(c.name), textNode('?')],
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
  {
    id: 'shapes',
    label: 'Outlines',
    noun: 'outlines',
    prefix: 'map',
    reverseMark: 'r',
    countries: COUNTRIES.filter((c) => SHAPES[c.code]),
    forward: {
      label: 'Name the country',
      hint: 'outline → country',
      placeholder: 'country…',
      prompt: (c) => ({
        pill: 'Which country?',
        lead: 'What country is this?',
        nodes: [shapeOutline(c)],
      }),
      answer: (c) => ({ answer: c.name, sub: `capital: ${c.capital} · ${c.region}` }),
      faces: (c) => ({ question: `${c.name}'s outline`, answer: c.name }),
      check: (input, c) => graded(input, countryNames(c)),
    },
    // As with flags, drawing one from memory is not something the app could
    // mark.
  },
  {
    id: 'borders',
    label: 'Borders',
    noun: 'countries',
    prefix: 'bd',
    reverseMark: 'r',
    countries: COUNTRIES.filter((c) => BORDERS[c.code]),
    forward: {
      label: 'List the neighbours',
      hint: 'country → its borders',
      placeholder: 'one, another, another…',
      prompt: (c) => ({
        pill: 'Which countries?',
        question: true,
        nodes: [
          textNode(`This is ${the(c)}`), strong(c.name),
          textNode('. Which countries does it border?'),
        ],
      }),
      answer: (c) => ({
        answer: namesOf(BORDERS[c.code]).join(', '),
        sub: countable(BORDERS[c.code].length, 'land border', 'land borders'),
        note: OVERSEAS[c.code]?.note,
      }),
      faces: (c) => ({ question: `${c.name}'s neighbours`, answer: namesOf(BORDERS[c.code]).join(', ') }),
      check: checkBorders,
    },
  },
];

for (const deck of DECKS) {
  deck.has = new Set(deck.countries.map((c) => c.code));
  deck.hint = `${deck.countries.length} ${deck.noun}`;
}

const DECK_BY_ID = new Map(DECKS.map((deck) => [deck.id, deck]));

const cardId = (deck, code, direction) => [deck.prefix, code, direction === 'reverse' ? deck.reverseMark : '']
  .filter(Boolean).join('|');

const DIRECTION_IDS = ['forward', 'reverse'];

/**
 * Which ways round the chosen decks can actually be asked. A deck need not
 * have both, and "mix" only means something when there is more than one.
 */
function availableDirections(decks) {
  const ids = DIRECTION_IDS.filter((id) => decks.some((deck) => deck[id]));
  return ids.length > 1 ? [...ids, 'mix'] : ids;
}

export const geography = {
  id: 'geography',
  label: 'Geography',
  hint: 'Flags, capitals, outlines, borders',

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
    const available = availableDirections(s.decks.map((id) => DECK_BY_ID.get(id)));
    if (!available.includes(s.direction)) [s.direction] = available;
  },

  filters(s) {
    const chosen = s.decks.map((id) => DECK_BY_ID.get(id));
    const available = availableDirections(chosen);

    // With one deck the direction can be named exactly; with several it can
    // only be described, so it lists what each way round means — naming only
    // the decks that actually have that direction.
    const describe = (direction) => {
      const sides = chosen.filter((deck) => deck[direction]).map((deck) => deck[direction]);
      // Naming one direction exactly while describing the other reads as an
      // inconsistency, so the choice turns on how many decks are on rather
      // than on how many happen to have this direction.
      return chosen.length === 1
        ? { label: sides[0].label, hint: sides[0].hint }
        : {
          label: direction === 'forward' ? 'Forward' : 'Reverse',
          hint: sides.map((side) => side.hint).join(' · '),
        };
    };

    const directionGroup = {
      id: 'direction',
      legend: 'Direction',
      type: 'radio',
      options: available.map((direction) => (direction === 'mix'
        ? { value: 'mix', label: 'Mix both', hint: 'alternates between the two' }
        : { value: direction, ...describe(direction) })),
    };

    // How many countries the chosen decks can ask about in a region, which
    // is not the size of the region: only one country in Oceania has a
    // land border.
    const asked = new Set(chosen.flatMap((deck) => deck.countries));

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
          hint: `${[...asked].filter((c) => c.region === region).length}`,
        })),
      },
      // A single way round is not a choice, so the control only appears when
      // there is one to make.
      ...(available.length > 1 ? [directionGroup] : []),
    ];
  },

  cardIds(s) {
    const directions = s.direction === 'mix' ? DIRECTION_IDS : [s.direction];
    const ids = [];
    for (const deckId of s.decks) {
      const deck = DECK_BY_ID.get(deckId);
      for (const direction of directions) {
        if (!deck[direction]) continue;
        for (const country of deck.countries) {
          if (!s.regions.includes(country.region)) continue;
          ids.push(cardId(deck, country.code, direction));
        }
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
    // A country the deck cannot ask about, or a direction it no longer has:
    // the id is history from an older arrangement, and the app skips a card
    // it cannot describe.
    if (!country || !deck.has.has(code)) return null;
    const mark = prefixed ? parts[2] : parts[1];
    const direction = mark === deck.reverseMark ? 'reverse' : 'forward';
    const side = deck[direction];
    if (!side) return null;
    return { country, deck, direction, side };
  },

  prompt: ({ country, side }) => side.prompt(country),
  answer: ({ country, side }) => side.answer(country),
  faces: ({ country, side }) => side.faces(country),
  extra: () => null,

  typable: ({ side }) => side.check !== null,
  check: (input, { country, side }) => (side.check ? side.check(input, country) : null),
  placeholder: ({ side }) => side.placeholder,
};
