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
  // The two literary tenses. You will meet these constantly in Dumas, Hugo
  // and Zola, and essentially never in conversation.
  { id: 'passe-simple', label: 'Passé simple', hint: 'je parlai — in books' },
  { id: 'subjonctif-imparfait', label: 'Subjonctif imparfait', hint: "qu'il parlât — in books" },
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
  passeSimple: {
    a: ['ai', 'as', 'a', 'âmes', 'âtes', 'èrent'],
    i: ['is', 'is', 'it', 'îmes', 'îtes', 'irent'],
    u: ['us', 'us', 'ut', 'ûmes', 'ûtes', 'urent'],
    in: ['ins', 'ins', 'int', 'înmes', 'întes', 'inrent'],
  },
};

/**
 * -cer and -ger verbs keep their soft consonant in front of a, o and u:
 * nous commençons, nous mangeons — but nous commencions, nous mangions.
 */
function soften(stem, ending, kind) {
  if (!kind) return stem;
  // Strip the accent first: the passé simple ending -âmes is still an a, and
  // "nous mangeâmes" needs the e just as "nous mangeons" does.
  const hard = ['a', 'o', 'u'].includes(ending.normalize('NFD')[0]);
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
 * The passé simple stem and which family of endings it takes. Regular verbs
 * are derived; the irregulars carry their own in the dataset.
 */
function passeSimpleParts(verb) {
  if (verb.ps) return verb.ps;
  if (verb.group === 'er') return { stem: erStems(verb).weak, type: 'a' };
  return { stem: stemOf(verb), type: 'i' };
}

function passeSimple(verb) {
  const { stem, type } = passeSimpleParts(verb);
  return ENDINGS.passeSimple[type].map((end) => soften(stem, end, verb.soften) + end);
}

const CIRCUMFLEX = { a: 'â', e: 'ê', i: 'î', o: 'ô', u: 'û' };

/** parla -> parlât, fu -> fût, vin -> vînt. */
function circumflexLastVowel(stem) {
  for (let i = stem.length - 1; i >= 0; i -= 1) {
    const accented = CIRCUMFLEX[stem[i]];
    if (accented) return stem.slice(0, i) + accented + stem.slice(i + 1);
  }
  return stem;
}

/**
 * Built off the passé simple, as it always is: take the tu form, drop its
 * -s, and add -sse ... -ssent. The il form takes a circumflex instead.
 */
function subjonctifImparfait(verb) {
  const base = passeSimple(verb)[1].slice(0, -1);
  return [
    `${base}sse`, `${base}sses`, `${circumflexLastVowel(base)}t`,
    `${base}ssions`, `${base}ssiez`, `${base}ssent`,
  ];
}

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
    case 'passe-simple':
      return passeSimple(verb);
    case 'subjonctif-imparfait':
      return subjonctifImparfait(verb);
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
  if (!tense.startsWith('subjonctif')) return clause;
  return `${VOWELISH.test(pronoun) ? "qu'" : 'que '}${clause}`;
}

/** The full answer for one card, e.g. "j'ai parlé". */
export function answerFor(verb, tense, index) {
  return attachPronoun(conjugate(verb, tense)[index], index, tense);
}

export function tenseLabel(id) {
  return TENSES.find((t) => t.id === id)?.label ?? id;
}
