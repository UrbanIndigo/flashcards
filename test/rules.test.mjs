import test from 'node:test';
import assert from 'node:assert/strict';

import { VERBS } from '../js/verbs.js';
import { TENSE_IDS, conjugate } from '../js/conjugator.js';
import { ruleFor } from '../js/rules.js';

const verb = (inf) => VERBS.find((v) => v.inf === inf);
const rule = (inf, tense, person = 0) => ruleFor(verb(inf), tense, person);

test('the present names the pattern the verb actually follows', () => {
  assert.match(rule('parler', 'present'), /Regular -er/);
  assert.match(rule('finir', 'present'), /Regular -ir/);
  assert.match(rule('vendre', 'present'), /Regular -re/);
  assert.match(rule('prendre', 'present'), /irregular/);
});

test('spelling and stem changes are called out where they bite', () => {
  // Only the nous form is affected, so only the nous card mentions it.
  assert.match(rule('manger', 'present', 3), /nous mangeons/);
  assert.match(rule('manger', 'present', 0), /Regular -er/);
  assert.match(rule('commencer', 'present', 3), /cedilla.*nous commençons/);
  assert.match(rule('acheter', 'present', 0), /achèt-.*achet-/);
});

test('the imparfait rule points at the nous form it is built from', () => {
  assert.match(rule('faire', 'imparfait'), /nous faisons/);
  assert.match(rule('être', 'imparfait'), /only exception.*ét-/);
  // The softening trap is worth stating on exactly the forms that show it.
  assert.match(rule('manger', 'imparfait', 3), /nous mangions.*je mangeais/);
});

test('the futur separates a regular stem from an irregular one', () => {
  assert.match(rule('parler', 'futur'), /whole infinitive \(parler-\)/);
  assert.match(rule('vendre', 'futur'), /minus its final -e \(vendr-\)/);
  assert.match(rule('être', 'futur'), /Irregular stem ser-/);
  assert.match(rule('conditionnel' in {} ? 'parler' : 'parler', 'conditionnel'), /futur stem \(parler-\).*imparfait endings/);
});

test('compound tenses name the auxiliary and the agreement', () => {
  assert.match(rule('parler', 'passe-compose'), /avoir.*participle parlé/);
  assert.match(rule('aller', 'passe-compose', 3), /être.*agrees.*plural, so allés/);
  assert.match(rule('aller', 'passe-compose', 0), /singular, so allé/);
  assert.match(rule('parler', 'plus-que-parfait'), /auxiliary in the imparfait: avais parlé/);
});

test('an irregular participle is flagged, and a predictable one is not', () => {
  assert.match(rule('prendre', 'passe-compose'), /irregular/);
  assert.match(rule('ouvrir', 'passe-compose'), /irregular/);
  assert.match(rule('devoir', 'passe-compose'), /irregular/);
  // parti is exactly what the -ir pattern predicts, irregular verb or not,
  // so calling it irregular would be crying wolf.
  assert.doesNotMatch(rule('finir', 'passe-compose'), /irregular/);
  assert.doesNotMatch(rule('vendre', 'passe-compose'), /irregular/);
});

test('the subjunctive explains both of its stems', () => {
  assert.match(rule('prendre', 'subjonctif', 0), /ils prennent/);
  assert.match(rule('prendre', 'subjonctif', 3), /imparfait stem: pren-/);
  assert.match(rule('être', 'subjonctif', 0), /irregular subjunctive/);
});

test('every card in the app has a rule, and it never leaks a template hole', () => {
  for (const v of VERBS) {
    for (const tense of TENSE_IDS) {
      for (let person = 0; person < 6; person += 1) {
        const note = ruleFor(v, tense, person);
        assert.ok(note && note.length > 10, `${v.inf}/${tense}/${person}: "${note}"`);
        assert.doesNotMatch(note, /undefined|NaN|\[object/, `${v.inf}/${tense}/${person}`);
        assert.match(note, /\.$/, `${v.inf}/${tense}/${person} should end in a full stop`);
      }
    }
  }
});

test('a compound rule never contradicts the answer above it', () => {
  for (const v of VERBS) {
    for (const tense of ['passe-compose', 'plus-que-parfait']) {
      for (let person = 0; person < 6; person += 1) {
        const form = conjugate(v, tense)[person];
        const participleForm = form.split(' ').slice(1).join(' ');
        assert.ok(
          ruleFor(v, tense, person).includes(participleForm),
          `${v.inf}/${tense}/${person}: rule omits "${participleForm}"`,
        );
      }
    }
  }
});
