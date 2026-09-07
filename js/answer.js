import { conjugate, answerFor, attachPronoun, TENSE_IDS, tenseLabel } from './conjugator.js';
import { VERBS } from './verbs.js';

/** Strip accents, so "je prefere" can be recognised as a near miss. */
export const deaccent = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ç/g, 'c');

export const normalise = (s) =>
  s.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[’]/g, "'").replace(/[.!?]+$/, '');

/** Lowercase, unaccented, punctuation flattened to spaces — for loose matching. */
const flatten = (s) => deaccent(s.toLowerCase()).replace(/[^a-z]+/g, ' ').trim();

const tokensOf = (s) => normalise(s).split(/[^a-zà-ÿ']+/i).filter(Boolean);

/**
 * What a learner might reasonably type for each tense, in French or English.
 * Matched longest-first, so "imperfect subjunctive" is not read as
 * "imperfect", and "subjonctif imparfait" is not read as "subjonctif".
 */
const TENSE_ALIASES = {
  present: ['present'],
  'passe-compose': ['passe compose', 'perfect', 'pc'],
  imparfait: ['imparfait', 'imperfect'],
  futur: ['futur simple', 'futur', 'future'],
  conditionnel: ['conditionnel', 'conditional'],
  'plus-que-parfait': ['plus que parfait', 'pluperfect'],
  subjonctif: ['subjonctif present', 'present subjunctive', 'subjonctif', 'subjunctive'],
  'passe-simple': ['passe simple', 'past historic', 'preterite'],
  'subjonctif-imparfait': ['subjonctif imparfait', 'imperfect subjunctive'],
};

/** Which tense, if any, the text names. */
export function tenseNamed(input) {
  const text = flatten(input);
  let best = null;
  for (const [id, aliases] of Object.entries(TENSE_ALIASES)) {
    for (const alias of aliases) {
      if (text.includes(alias) && (!best || alias.length > best.length)) {
        best = { id, length: alias.length };
      }
    }
  }
  return best?.id ?? null;
}

const interpretationCache = new Map();

/**
 * Every verb and tense that would produce exactly this clause.
 *
 * French is full of collisions: "je suis" is être and suivre, "je finis" is
 * the présent and the passé simple, "que je finisse" is both subjunctives.
 * A reverse card has to accept any reading that genuinely fits, and the
 * answer side is a good place to point the ambiguity out.
 */
export function interpretationsOf(clause, person) {
  const key = `${person}|${clause}`;
  if (interpretationCache.has(key)) return interpretationCache.get(key);

  const found = [];
  for (const verb of VERBS) {
    for (const tense of TENSE_IDS) {
      if (attachPronoun(conjugate(verb, tense)[person], person, tense) === clause) {
        found.push({ inf: verb.inf, tense });
      }
    }
  }
  interpretationCache.set(key, found);
  return found;
}

/** Kept for the answer side, which only ever asks about verbs. */
export function verbsMatching(clause, tense, person) {
  return interpretationsOf(clause, person)
    .filter((o) => o.tense === tense)
    .map((o) => o.inf);
}

const CORRECT = { level: 'correct', message: 'Correct' };
const ACCENTS = { level: 'close', message: 'Almost — check the accents' };
const WRONG = { level: 'wrong', message: 'Not quite' };

/**
 * Grades a typed form on a forward card.
 *
 * The prompt already supplies the pronoun, so either the bare form
 * ("ai parlé") or the whole clause ("j'ai parlé") is accepted.
 */
export function checkAnswer(input, { verb, tense, person }) {
  if (!input || !input.trim()) return WRONG;
  const given = normalise(input);
  const accepted = [conjugate(verb, tense)[person], answerFor(verb, tense, person)].map(normalise);
  if (accepted.includes(given)) return CORRECT;
  if (accepted.map(deaccent).includes(deaccent(given))) return ACCENTS;
  return WRONG;
}

/**
 * Grades a reverse card, which asks for the verb *and* the tense — the two
 * things you need when you meet a form in a book.
 */
export function checkRecognition(input, { verb, tense, person }) {
  if (!input || !input.trim()) return WRONG;

  const options = interpretationsOf(answerFor(verb, tense, person), person);
  const infinitives = [...new Set(options.map((o) => o.inf))];
  const tokens = tokensOf(input);
  const loose = tokens.map(deaccent);

  const namedVerb = infinitives.find((inf) => loose.includes(deaccent(normalise(inf))));
  const spelledExactly = namedVerb !== undefined && tokens.includes(normalise(namedVerb));
  const namedTense = tenseNamed(input);

  const tenseFits = namedTense !== null && options.some((o) => o.tense === namedTense);
  const pairFits = namedVerb !== undefined && namedTense !== null
    && options.some((o) => o.inf === namedVerb && o.tense === namedTense);

  if (pairFits) return spelledExactly ? CORRECT : ACCENTS;
  if (namedVerb !== undefined) {
    return namedTense === null
      ? { level: 'close', message: 'Right verb — name the tense too' }
      : { level: 'close', message: 'Right verb — wrong tense' };
  }
  if (tenseFits) return { level: 'close', message: 'Right tense — wrong verb' };
  return WRONG;
}

export { tenseLabel };
