import test from 'node:test';
import assert from 'node:assert/strict';

import { VERBS } from '../js/verbs.js';
import { checkAnswer, checkRecognition, verbsMatching, interpretationsOf, tenseNamed } from '../js/answer.js';

const verb = (inf) => VERBS.find((v) => v.inf === inf);
const card = (inf, tense, person) => ({ verb: verb(inf), tense, person });

test('the bare form is accepted', () => {
  assert.equal(checkAnswer('parle', card('parler', 'present', 0)).level, 'correct');
  assert.equal(checkAnswer('finissons', card('finir', 'present', 3)).level, 'correct');
  assert.equal(checkAnswer('ai parlé', card('parler', 'passe-compose', 0)).level, 'correct');
});

test('the full clause is accepted too', () => {
  assert.equal(checkAnswer('je parle', card('parler', 'present', 0)).level, 'correct');
  assert.equal(checkAnswer("j'ai parlé", card('parler', 'passe-compose', 0)).level, 'correct');
  assert.equal(checkAnswer('nous sommes allés', card('aller', 'passe-compose', 3)).level, 'correct');
  assert.equal(checkAnswer('que je parle', card('parler', 'subjonctif', 0)).level, 'correct');
});

test('typing is forgiving about case, spacing and smart quotes', () => {
  assert.equal(checkAnswer('  Parle ', card('parler', 'present', 0)).level, 'correct');
  assert.equal(checkAnswer('J’AI  PARLÉ', card('parler', 'passe-compose', 0)).level, 'correct');
  assert.equal(checkAnswer('je parle.', card('parler', 'present', 0)).level, 'correct');
});

test('a missing accent is flagged as close, not correct', () => {
  assert.equal(checkAnswer('prefere', card('préférer', 'present', 0)).level, 'close');
  assert.equal(checkAnswer('achete', card('acheter', 'present', 0)).level, 'close');
  assert.equal(checkAnswer('etais', card('être', 'imparfait', 0)).level, 'close');
  assert.equal(checkAnswer('recois', card('recevoir', 'present', 0)).level, 'close');
  assert.equal(checkAnswer('ai parle', card('parler', 'passe-compose', 0)).level, 'close');
  // ...and the properly accented answer is still fully correct.
  assert.equal(checkAnswer('préfère', card('préférer', 'present', 0)).level, 'correct');
  assert.equal(checkAnswer('reçois', card('recevoir', 'present', 0)).level, 'correct');
});

test('a wrong form is wrong', () => {
  assert.equal(checkAnswer('parles', card('parler', 'present', 0)).level, 'wrong');
  assert.equal(checkAnswer('', card('parler', 'present', 0)).level, 'wrong');
  assert.equal(checkAnswer('   ', card('parler', 'present', 0)).level, 'wrong');
  // Right verb, wrong tense.
  assert.equal(checkAnswer('parlais', card('parler', 'present', 0)).level, 'wrong');
  // Right tense, wrong person.
  assert.equal(checkAnswer('parlons', card('parler', 'present', 4)).level, 'wrong');
});

// ---------------------------------------------------------- reverse cards

test('a reverse card wants the verb and the tense', () => {
  const etais = card('être', 'imparfait', 0);
  assert.equal(checkRecognition('être imparfait', etais).level, 'correct');
  assert.equal(checkRecognition('imparfait être', etais).level, 'correct', 'order does not matter');
  assert.equal(checkRecognition('être, imparfait', etais).level, 'correct');
  assert.equal(checkRecognition('être imperfect', etais).level, 'correct', 'English names work');
  assert.equal(checkRecognition('', etais).level, 'wrong');
  assert.equal(checkRecognition('xyz', etais).level, 'wrong');
});

test('naming only half of it says which half', () => {
  const etais = card('être', 'imparfait', 0);
  assert.equal(checkRecognition('être', etais).message, 'Right verb — name the tense too');
  assert.equal(checkRecognition('être futur', etais).message, 'Right verb — wrong tense');
  assert.equal(checkRecognition('imparfait', etais).message, 'Right tense — wrong verb');
  assert.equal(checkRecognition('avoir futur', etais).level, 'wrong');
  // Half-right is not right, so it suggests Again rather than waving through.
  assert.equal(checkRecognition('être', etais).level, 'close');
});

test('a missing accent on the verb is a near miss, not a pass', () => {
  assert.equal(checkRecognition('etre imparfait', card('être', 'imparfait', 0)).level, 'close');
  assert.equal(checkRecognition('connaitre present', card('connaître', 'present', 0)).level, 'close');
  assert.equal(checkRecognition('connaître present', card('connaître', 'present', 0)).level, 'correct');
});

test('tense names are matched longest-first', () => {
  // "subjonctif imparfait" must not be read as plain "subjonctif", nor
  // "imperfect subjunctive" as "imperfect".
  assert.equal(tenseNamed('subjonctif imparfait'), 'subjonctif-imparfait');
  assert.equal(tenseNamed('imperfect subjunctive'), 'subjonctif-imparfait');
  assert.equal(tenseNamed('subjonctif'), 'subjonctif');
  assert.equal(tenseNamed('plus-que-parfait'), 'plus-que-parfait', 'hyphens are flattened');
  assert.equal(tenseNamed('passé composé'), 'passe-compose', 'accents are ignored');
  assert.equal(tenseNamed('passe simple'), 'passe-simple');
  assert.equal(tenseNamed('nothing here'), null);

  const finisse = card('finir', 'subjonctif', 0);
  assert.equal(checkRecognition('finir subjonctif', finisse).level, 'correct');
});

test('an ambiguous form accepts every reading that genuinely fits', () => {
  // "je suis" is être and suivre.
  assert.equal(checkRecognition('suivre présent', card('être', 'present', 0)).level, 'correct');
  assert.equal(checkRecognition('être présent', card('suivre', 'present', 0)).level, 'correct');
  // "je finis" is the présent and the passé simple of the same verb.
  assert.deepEqual(
    interpretationsOf('je finis', 0),
    [{ inf: 'finir', tense: 'present' }, { inf: 'finir', tense: 'passe-simple' }],
  );
  assert.equal(checkRecognition('finir passé simple', card('finir', 'present', 0)).level, 'correct');
  assert.equal(checkRecognition('finir présent', card('finir', 'passe-simple', 0)).level, 'correct');
  // "que je finisse" is both subjunctives.
  assert.equal(
    interpretationsOf('que je finisse', 0).length, 2,
    'the two subjunctives collide for regular -ir verbs',
  );
  // ...but an unambiguous form is not a free pass: suivre does not give
  // j'étais, even though the tense named is the right one.
  assert.equal(
    checkRecognition('suivre imparfait', card('être', 'imparfait', 0)).message,
    'Right tense — wrong verb',
  );
  assert.equal(checkRecognition('suivre futur', card('être', 'imparfait', 0)).level, 'wrong');
  assert.deepEqual(interpretationsOf("j'étais", 0), [{ inf: 'être', tense: 'imparfait' }]);
});

test('verbsMatching still answers the narrower question', () => {
  assert.deepEqual(verbsMatching('je suis', 'present', 0).sort(), ['suivre', 'être']);
  assert.deepEqual(verbsMatching("j'étais", 'imparfait', 0), ['être']);
});
