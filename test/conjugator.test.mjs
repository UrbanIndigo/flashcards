import test from 'node:test';
import assert from 'node:assert/strict';

import { VERBS } from '../js/verbs.js';
import { conjugate, answerFor, TENSE_IDS, PRONOUNS } from '../js/conjugator.js';

const verb = (inf) => {
  const found = VERBS.find((v) => v.inf === inf);
  assert.ok(found, `missing verb: ${inf}`);
  return found;
};

/** Assert the full six-form paradigm of a verb in a tense. */
const paradigm = (inf, tense, expected) =>
  assert.deepEqual(conjugate(verb(inf), tense), expected, `${inf} / ${tense}`);

test('regular -er, -ir and -re paradigms', () => {
  paradigm('parler', 'present', ['parle', 'parles', 'parle', 'parlons', 'parlez', 'parlent']);
  paradigm('finir', 'present', ['finis', 'finis', 'finit', 'finissons', 'finissez', 'finissent']);
  paradigm('vendre', 'present', ['vends', 'vends', 'vend', 'vendons', 'vendez', 'vendent']);
  paradigm('parler', 'imparfait', ['parlais', 'parlais', 'parlait', 'parlions', 'parliez', 'parlaient']);
  paradigm('finir', 'imparfait', ['finissais', 'finissais', 'finissait', 'finissions', 'finissiez', 'finissaient']);
  paradigm('vendre', 'imparfait', ['vendais', 'vendais', 'vendait', 'vendions', 'vendiez', 'vendaient']);
  paradigm('vendre', 'futur', ['vendrai', 'vendras', 'vendra', 'vendrons', 'vendrez', 'vendront']);
  paradigm('finir', 'subjonctif', ['finisse', 'finisses', 'finisse', 'finissions', 'finissiez', 'finissent']);
});

test('-cer and -ger keep their soft consonant only before a, o, u', () => {
  paradigm('manger', 'present', ['mange', 'manges', 'mange', 'mangeons', 'mangez', 'mangent']);
  paradigm('commencer', 'present', ['commence', 'commences', 'commence', 'commençons', 'commencez', 'commencent']);
  // The classic trap: nous mangeons but nous mangions.
  paradigm('manger', 'imparfait', ['mangeais', 'mangeais', 'mangeait', 'mangions', 'mangiez', 'mangeaient']);
  paradigm('commencer', 'imparfait', ['commençais', 'commençais', 'commençait', 'commencions', 'commenciez', 'commençaient']);
  paradigm('manger', 'subjonctif', ['mange', 'manges', 'mange', 'mangions', 'mangiez', 'mangent']);
  assert.equal(answerFor(verb('commencer'), 'futur', 0), 'je commencerai');
});

test('stem-changing -er verbs', () => {
  paradigm('acheter', 'present', ['achète', 'achètes', 'achète', 'achetons', 'achetez', 'achètent']);
  paradigm('appeler', 'present', ['appelle', 'appelles', 'appelle', 'appelons', 'appelez', 'appellent']);
  paradigm('préférer', 'present', ['préfère', 'préfères', 'préfère', 'préférons', 'préférez', 'préfèrent']);
  paradigm('envoyer', 'present', ['envoie', 'envoies', 'envoie', 'envoyons', 'envoyez', 'envoient']);
  // The stem change carries into the future for acheter but not préférer.
  assert.equal(answerFor(verb('acheter'), 'futur', 0), "j'achèterai");
  assert.equal(answerFor(verb('préférer'), 'futur', 0), 'je préférerai');
  assert.equal(answerFor(verb('envoyer'), 'futur', 0), "j'enverrai");
  // ...but never into the imperfect, which is built off the nous stem.
  paradigm('acheter', 'imparfait', ['achetais', 'achetais', 'achetait', 'achetions', 'achetiez', 'achetaient']);
  // Two-stem subjunctive: que j'achète, que nous achetions.
  paradigm('acheter', 'subjonctif', ['achète', 'achètes', 'achète', 'achetions', 'achetiez', 'achètent']);
});

test('irregular présent', () => {
  paradigm('être', 'present', ['suis', 'es', 'est', 'sommes', 'êtes', 'sont']);
  paradigm('avoir', 'present', ['ai', 'as', 'a', 'avons', 'avez', 'ont']);
  paradigm('aller', 'present', ['vais', 'vas', 'va', 'allons', 'allez', 'vont']);
  paradigm('faire', 'present', ['fais', 'fais', 'fait', 'faisons', 'faites', 'font']);
  paradigm('prendre', 'present', ['prends', 'prends', 'prend', 'prenons', 'prenez', 'prennent']);
});

test('irregular future and conditional stems', () => {
  assert.equal(answerFor(verb('être'), 'futur', 0), 'je serai');
  assert.equal(answerFor(verb('avoir'), 'futur', 0), "j'aurai");
  assert.equal(answerFor(verb('aller'), 'futur', 0), "j'irai");
  assert.equal(answerFor(verb('faire'), 'futur', 2), 'il fera');
  assert.equal(answerFor(verb('pouvoir'), 'futur', 3), 'nous pourrons');
  assert.equal(answerFor(verb('vouloir'), 'conditionnel', 0), 'je voudrais');
  assert.equal(answerFor(verb('venir'), 'futur', 5), 'ils viendront');
  assert.equal(answerFor(verb('voir'), 'conditionnel', 1), 'tu verrais');
  assert.equal(answerFor(verb('mourir'), 'futur', 2), 'il mourra');
});

test('imparfait stems come from the nous form, except être', () => {
  assert.equal(answerFor(verb('être'), 'imparfait', 0), "j'étais");
  assert.equal(answerFor(verb('avoir'), 'imparfait', 5), 'ils avaient');
  assert.equal(answerFor(verb('faire'), 'imparfait', 0), 'je faisais');
  assert.equal(answerFor(verb('boire'), 'imparfait', 3), 'nous buvions');
  assert.equal(answerFor(verb('prendre'), 'imparfait', 0), 'je prenais');
});

test('two-stem subjunctives fall out of the general rule', () => {
  paradigm('boire', 'subjonctif', ['boive', 'boives', 'boive', 'buvions', 'buviez', 'boivent']);
  paradigm('prendre', 'subjonctif', ['prenne', 'prennes', 'prenne', 'prenions', 'preniez', 'prennent']);
  paradigm('venir', 'subjonctif', ['vienne', 'viennes', 'vienne', 'venions', 'veniez', 'viennent']);
  paradigm('voir', 'subjonctif', ['voie', 'voies', 'voie', 'voyions', 'voyiez', 'voient']);
  paradigm('recevoir', 'subjonctif', ['reçoive', 'reçoives', 'reçoive', 'recevions', 'receviez', 'reçoivent']);
});

test('genuinely irregular subjunctives', () => {
  paradigm('être', 'subjonctif', ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient']);
  paradigm('avoir', 'subjonctif', ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient']);
  paradigm('aller', 'subjonctif', ['aille', 'ailles', 'aille', 'allions', 'alliez', 'aillent']);
  paradigm('faire', 'subjonctif', ['fasse', 'fasses', 'fasse', 'fassions', 'fassiez', 'fassent']);
  paradigm('pouvoir', 'subjonctif', ['puisse', 'puisses', 'puisse', 'puissions', 'puissiez', 'puissent']);
  paradigm('savoir', 'subjonctif', ['sache', 'saches', 'sache', 'sachions', 'sachiez', 'sachent']);
  paradigm('vouloir', 'subjonctif', ['veuille', 'veuilles', 'veuille', 'voulions', 'vouliez', 'veuillent']);
});

test('passé composé picks the right auxiliary and agreement', () => {
  assert.equal(answerFor(verb('parler'), 'passe-compose', 0), "j'ai parlé");
  assert.equal(answerFor(verb('finir'), 'passe-compose', 1), 'tu as fini');
  assert.equal(answerFor(verb('vendre'), 'passe-compose', 2), 'il a vendu');
  assert.equal(answerFor(verb('prendre'), 'passe-compose', 3), 'nous avons pris');
  assert.equal(answerFor(verb('être'), 'passe-compose', 0), "j'ai été");
  // être verbs agree with the subject.
  assert.equal(answerFor(verb('aller'), 'passe-compose', 0), 'je suis allé');
  assert.equal(answerFor(verb('aller'), 'passe-compose', 3), 'nous sommes allés');
  assert.equal(answerFor(verb('venir'), 'passe-compose', 5), 'ils sont venus');
  assert.equal(answerFor(verb('naître'), 'passe-compose', 4), 'vous êtes nés');
  assert.equal(answerFor(verb('mourir'), 'passe-compose', 2), 'il est mort');
});

test('plus-que-parfait', () => {
  assert.equal(answerFor(verb('parler'), 'plus-que-parfait', 0), "j'avais parlé");
  assert.equal(answerFor(verb('aller'), 'plus-que-parfait', 5), 'ils étaient allés');
  assert.equal(answerFor(verb('avoir'), 'plus-que-parfait', 3), 'nous avions eu');
});

test('irregular past participles', () => {
  const pp = (inf) => conjugate(verb(inf), 'passe-compose')[0].split(' ').pop();
  assert.equal(pp('être'), 'été');
  assert.equal(pp('avoir'), 'eu');
  assert.equal(pp('faire'), 'fait');
  assert.equal(pp('prendre'), 'pris');
  assert.equal(pp('mettre'), 'mis');
  assert.equal(pp('écrire'), 'écrit');
  assert.equal(pp('ouvrir'), 'ouvert');
  assert.equal(pp('vivre'), 'vécu');
  assert.equal(pp('devoir'), 'dû');
});

test("je elides before a vowel, and the subjunctive carries que", () => {
  assert.equal(answerFor(verb('aimer'), 'present', 0), "j'aime");
  assert.equal(answerFor(verb('habiter'), 'present', 0), "j'habite");
  assert.equal(answerFor(verb('parler'), 'present', 0), 'je parle');
  assert.equal(answerFor(verb('écouter'), 'imparfait', 0), "j'écoutais");
  assert.equal(answerFor(verb('parler'), 'subjonctif', 0), 'que je parle');
  assert.equal(answerFor(verb('avoir'), 'subjonctif', 0), "que j'aie");
  assert.equal(answerFor(verb('parler'), 'subjonctif', 2), "qu'il parle");
  assert.equal(answerFor(verb('aller'), 'subjonctif', 5), "qu'ils aillent");
});

test('every verb produces six non-empty forms in every tense', () => {
  for (const v of VERBS) {
    for (const tense of TENSE_IDS) {
      const forms = conjugate(v, tense);
      assert.equal(forms.length, 6, `${v.inf} / ${tense}`);
      forms.forEach((form, i) => {
        assert.ok(
          typeof form === 'string' && form.trim().length > 0,
          `${v.inf} / ${tense} / ${PRONOUNS[i]} is empty`,
        );
        assert.ok(!/undefined|NaN/.test(form), `${v.inf} / ${tense} / ${PRONOUNS[i]} = ${form}`);
      });
    }
  }
});

test('the dataset itself is well formed', () => {
  const seen = new Set();
  for (const v of VERBS) {
    assert.ok(!seen.has(v.inf), `duplicate verb: ${v.inf}`);
    seen.add(v.inf);
    assert.ok(v.en, `${v.inf} has no gloss`);
    assert.ok(v.tags?.length, `${v.inf} has no tags`);
    assert.ok(['er', 'ir', 're', 'irr'].includes(v.group), `${v.inf} has a bad group`);
    if (v.group === 'irr') assert.equal(v.present?.length, 6, `${v.inf} needs six present forms`);
    // An être verb must be tagged as one, so the deck stays honest.
    assert.equal(v.aux === 'être', v.tags.includes('etre'), `${v.inf}: aux and tag disagree`);
  }
});
