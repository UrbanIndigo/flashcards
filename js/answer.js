import { conjugate, answerFor, attachPronoun } from './conjugator.js';
import { VERBS } from './verbs.js';

/** Strip accents, so "je prefere" can be recognised as a near miss. */
export const deaccent = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ç/g, 'c');

export const normalise = (s) =>
  s.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[’]/g, "'").replace(/[.!?]+$/, '');

/**
 * Grades a typed answer as 'correct', 'close' (right letters, wrong accents)
 * or 'wrong'.
 *
 * The prompt already supplies the pronoun, so either the bare form
 * ("ai parlé") or the whole clause ("j'ai parlé") is accepted.
 */
export function checkAnswer(input, { verb, tense, person }) {
  if (!input || !input.trim()) return 'wrong';
  const given = normalise(input);
  const accepted = [conjugate(verb, tense)[person], answerFor(verb, tense, person)].map(normalise);
  if (accepted.includes(given)) return 'correct';
  if (accepted.map(deaccent).includes(deaccent(given))) return 'close';
  return 'wrong';
}

/**
 * Every verb that produces exactly this clause in this tense and person.
 *
 * French is full of collisions — "je suis" is both être and suivre — so a
 * reverse card has to accept any verb that genuinely fits the prompt.
 */
export function verbsMatching(clause, tense, person) {
  return VERBS
    .filter((v) => attachPronoun(conjugate(v, tense)[person], person, tense) === clause)
    .map((v) => v.inf);
}

/** Grades a typed infinitive on a reverse card. */
export function checkRecognition(input, { verb, tense, person }) {
  if (!input || !input.trim()) return 'wrong';
  const given = normalise(input);
  const accepted = verbsMatching(answerFor(verb, tense, person), tense, person).map(normalise);
  if (accepted.includes(given)) return 'correct';
  if (accepted.map(deaccent).includes(deaccent(given))) return 'close';
  return 'wrong';
}
