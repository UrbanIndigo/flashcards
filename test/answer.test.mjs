import test from 'node:test';
import assert from 'node:assert/strict';

import { VERBS } from '../js/verbs.js';
import { checkAnswer, checkRecognition, verbsMatching } from '../js/answer.js';

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

// ---------------------------------------------------------- reverse cards

test('a reverse card accepts the infinitive', () => {
  assert.equal(checkRecognition('être', card('être', 'imparfait', 0)), 'correct');
  assert.equal(checkRecognition('  ÊTRE ', card('être', 'imparfait', 0)), 'correct');
  assert.equal(checkRecognition('aller', card('aller', 'passe-compose', 3)), 'correct');
  assert.equal(checkRecognition('avoir', card('être', 'imparfait', 0)), 'wrong');
  assert.equal(checkRecognition('', card('être', 'imparfait', 0)), 'wrong');
});

test('a missing accent on an infinitive is a near miss', () => {
  assert.equal(checkRecognition('etre', card('être', 'imparfait', 0)), 'close');
  assert.equal(checkRecognition('preferer', card('préférer', 'present', 0)), 'close');
  assert.equal(checkRecognition('connaitre', card('connaître', 'present', 0)), 'close');
});

test('an ambiguous form accepts either verb', () => {
  // "je suis" is être and suivre; whichever card it came from, both are right.
  assert.equal(checkRecognition('suivre', card('être', 'present', 0)), 'correct');
  assert.equal(checkRecognition('être', card('suivre', 'present', 0)), 'correct');
  assert.deepEqual(verbsMatching('je suis', 'present', 0).sort(), ['suivre', 'être']);
  // ...but an unambiguous one does not become a free pass.
  assert.equal(checkRecognition('suivre', card('être', 'imparfait', 0)), 'wrong');
  assert.deepEqual(verbsMatching("j'étais", 'imparfait', 0), ['être']);
});
