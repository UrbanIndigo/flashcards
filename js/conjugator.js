/**
 * Builds every supported tense from the compact entries in verbs.js.
 *
 * The guiding rule is that nothing is stored that can be derived, because a
 * derived form can't drift out of sync with the rest of the paradigm.
 */

export const PRONOUNS = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];

/** What the learner actually sees on a card. */
export const PRONOUN_LABELS = ['je', 'tu', 'il / elle', 'nous', 'vous', 'ils / elles'];

export const TENSES = [
  { id: 'present', label: 'Présent', hint: 'je parle' },
  { id: 'passe-compose', label: 'Passé composé', hint: "j'ai parlé" },
  { id: 'imparfait', label: 'Imparfait', hint: 'je parlais' },
  { id: 'futur', label: 'Futur simple', hint: 'je parlerai' },
  { id: 'conditionnel', label: 'Conditionnel', hint: 'je parlerais' },
  { id: 'plus-que-parfait', label: 'Plus-que-parfait', hint: "j'avais parlé" },
  { id: 'subjonctif', label: 'Subjonctif présent', hint: 'que je parle' },
];

export const TENSE_IDS = TENSES.map((t) => t.id);

const ENDINGS = {
  present: {
    er: ['e', 'es', 'e', 'ons', 'ez', 'ent'],
    ir: ['is', 'is', 'it', 'issons', 'issez', 'issent'],
    re: ['s', 's', '', 'ons', 'ez', 'ent'],
  },
  imparfait: ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'],
  futur: ['ai', 'as', 'a', 'ons', 'ez', 'ont'],
  conditionnel: ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'],
  subjonctif: ['e', 'es', 'e', 'ions', 'iez', 'ent'],
};

/**
 * -cer and -ger verbs keep their soft consonant in front of a, o and u:
 * nous commençons, nous mangeons — but nous commencions, nous mangions.
 */
function soften(stem, ending, kind) {
  if (!kind) return stem;
  const hard = ['a', 'o', 'u'].includes(ending[0]);
  if (!hard) return stem;
  if (kind === 'ger') return `${stem}e`;
  if (kind === 'cer') return `${stem.slice(0, -1)}ç`;
  return stem;
}

function stemOf(verb) {
  return verb.inf.slice(0, -2);
}

/** Stems used by je/tu/il/ils (strong) and nous/vous (weak). */
function erStems(verb) {
  const base = stemOf(verb);
  return { strong: verb.stems?.strong ?? base, weak: verb.stems?.weak ?? base };
}

function present(verb) {
  if (verb.group === 'irr') return verb.present;
  const endings = ENDINGS.present[verb.group];
  if (verb.group === 'er') {
    const { strong, weak } = erStems(verb);
    return endings.map((end, i) => {
      const stem = [3, 4].includes(i) ? weak : strong;
      return soften(stem, end, verb.soften) + end;
    });
  }
  // Both regular patterns build straight off the bare stem: the -iss- of
  // finir lives in the plural endings, not in the stem.
  return endings.map((end) => stemOf(verb) + end);
}

/** The imperfect stem, which the subjunctive nous/vous forms also borrow. */
function imparfaitStem(verb) {
  if (verb.imp) return verb.imp;
  if (verb.group === 'er') return erStems(verb).weak;
  if (verb.group === 'ir') return `${stemOf(verb)}iss`;
  if (verb.group === 're') return stemOf(verb);
  return present(verb)[3].replace(/ons$/, '');
}

function futurStem(verb) {
  return verb.fut ?? verb.inf.replace(/e$/, '');
}

function pastParticiple(verb) {
  if (verb.pp) return verb.pp;
  if (verb.group === 'er') return `${stemOf(verb)}é`;
  if (verb.group === 'ir') return `${stemOf(verb)}i`;
  return `${stemOf(verb)}u`;
}

function auxOf(verb) {
  return verb.aux === 'être' ? 'être' : 'avoir';
}

function withStem(stem, endings, soften_) {
  return endings.map((end) => soften(stem, end, soften_) + end);
}

function imparfait(verb) {
  return withStem(imparfaitStem(verb), ENDINGS.imparfait, verb.soften);
}

function subjonctif(verb) {
  if (verb.subj) return verb.subj;
  // Standard formation: singular + ils from the ils-present stem, nous/vous
  // from the imperfect stem. This gets boire, prendre, venir, voir and the
  // rest of the two-stem verbs right without listing them.
  const strong = present(verb)[5].replace(/ent$/, '');
  const weak = imparfaitStem(verb);
  return ENDINGS.subjonctif.map((end, i) => {
    const stem = [3, 4].includes(i) ? weak : strong;
    return soften(stem, end, verb.soften) + end;
  });
}

/**
 * Past participles of être verbs agree with the subject. Cards show the
 * masculine forms, so only the plural -s is added.
 */
function agree(pp, index) {
  return [3, 4, 5].includes(index) ? `${pp}s` : pp;
}

function compound(verb, auxForms) {
  const pp = pastParticiple(verb);
  const isEtre = auxOf(verb) === 'être';
  return auxForms.map((aux, i) => `${aux} ${isEtre ? agree(pp, i) : pp}`);
}

const AUX_VERBS = {
  avoir: {
    present: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
    imparfait: ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'],
  },
  être: {
    present: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
    imparfait: ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'],
  },
};

/**
 * All six forms of `verb` in `tense`, bare (no pronoun attached).
 */
export function conjugate(verb, tense) {
  switch (tense) {
    case 'present':
      return present(verb);
    case 'imparfait':
      return imparfait(verb);
    case 'futur':
      return ENDINGS.futur.map((end) => futurStem(verb) + end);
    case 'conditionnel':
      return ENDINGS.conditionnel.map((end) => futurStem(verb) + end);
    case 'subjonctif':
      return subjonctif(verb);
    case 'passe-compose':
      return compound(verb, AUX_VERBS[auxOf(verb)].present);
    case 'plus-que-parfait':
      return compound(verb, AUX_VERBS[auxOf(verb)].imparfait);
    default:
      throw new Error(`Unknown tense: ${tense}`);
  }
}

const VOWELISH = /^[aàâäeéèêëiîïoôöuùûüh]/i;

/** je + aime -> j'aime */
export function attachPronoun(form, index, tense) {
  const pronoun = PRONOUNS[index];
  const elided = pronoun === 'je' && VOWELISH.test(form) ? "j'" : `${pronoun} `;
  const clause = `${elided}${form}`;
  // The subjunctive is only ever met after "que", and learners are taught it
  // that way, so the card shows it that way too.
  if (tense !== 'subjonctif') return clause;
  return `${VOWELISH.test(pronoun) ? "qu'" : 'que '}${clause}`;
}

/** The full answer for one card, e.g. "j'ai parlé". */
export function answerFor(verb, tense, index) {
  return attachPronoun(conjugate(verb, tense)[index], index, tense);
}

export function tenseLabel(id) {
  return TENSES.find((t) => t.id === id)?.label ?? id;
}
