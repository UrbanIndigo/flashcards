import { conjugate, answerFor } from './conjugator.js';

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
