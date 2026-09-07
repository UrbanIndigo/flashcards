import test from 'node:test';
import assert from 'node:assert/strict';

import { VERBS } from '../js/verbs.js';
import { checkAnswer } from '../js/answer.js';

const verb = (inf) => VERBS.find((v) => v.inf === inf);
const card = (inf, tense, person) => ({ verb: verb(inf), tense, person });

test('the bare form is accepted', () => {
  assert.equal(checkAnswer('parle', card('parler', 'present', 0)), 'correct');
  assert.equal(checkAnswer('finissons', card('finir', 'present', 3)), 'correct');
  assert.equal(checkAnswer('ai parlé', card('parler', 'passe-compose', 0)), 'correct');
});

test('the full clause is accepted too', () => {
  assert.equal(checkAnswer('je parle', card('parler', 'present', 0)), 'correct');
  assert.equal(checkAnswer("j'ai parlé", card('parler', 'passe-compose', 0)), 'correct');
  assert.equal(checkAnswer('nous sommes allés', card('aller', 'passe-compose', 3)), 'correct');
  assert.equal(checkAnswer('que je parle', card('parler', 'subjonctif', 0)), 'correct');
});

test('typing is forgiving about case, spacing and smart quotes', () => {
  assert.equal(checkAnswer('  Parle ', card('parler', 'present', 0)), 'correct');
  assert.equal(checkAnswer('J’AI  PARLÉ', card('parler', 'passe-compose', 0)), 'correct');
  assert.equal(checkAnswer('je parle.', card('parler', 'present', 0)), 'correct');
});

test('a missing accent is flagged as close, not correct', () => {
  assert.equal(checkAnswer('prefere', card('préférer', 'present', 0)), 'close');
  assert.equal(checkAnswer('achete', card('acheter', 'present', 0)), 'close');
  assert.equal(checkAnswer('etais', card('être', 'imparfait', 0)), 'close');
  assert.equal(checkAnswer('recois', card('recevoir', 'present', 0)), 'close');
  assert.equal(checkAnswer('ai parle', card('parler', 'passe-compose', 0)), 'close');
  // ...and the properly accented answer is still fully correct.
  assert.equal(checkAnswer('préfère', card('préférer', 'present', 0)), 'correct');
  assert.equal(checkAnswer('reçois', card('recevoir', 'present', 0)), 'correct');
});

test('a wrong form is wrong', () => {
  assert.equal(checkAnswer('parles', card('parler', 'present', 0)), 'wrong');
  assert.equal(checkAnswer('', card('parler', 'present', 0)), 'wrong');
  assert.equal(checkAnswer('   ', card('parler', 'present', 0)), 'wrong');
  // Right verb, wrong tense.
  assert.equal(checkAnswer('parlais', card('parler', 'present', 0)), 'wrong');
  // Right tense, wrong person.
  assert.equal(checkAnswer('parlons', card('parler', 'present', 4)), 'wrong');
});
