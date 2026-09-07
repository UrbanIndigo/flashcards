/**
 * The rule behind each answer, in one line.
 *
 * The conjugator derives forms rather than storing tables, so the reasoning
 * already exists — this just says it out loud. Seeing "the whole infinitive
 * plus -ai" under every future card is what turns a pile of memorised forms
 * into a pattern you can apply to a verb you have never met.
 */

import { conjugate } from './conjugator.js';

const ENDINGS = {
  er: '-e, -es, -e, -ons, -ez, -ent',
  ir: '-is, -is, -it, -issons, -issez, -issent',
  re: '-s, -s, —, -ons, -ez, -ent',
  imparfait: '-ais, -ais, -ait, -ions, -iez, -aient',
  futur: '-ai, -as, -a, -ons, -ez, -ont',
};

const stemOf = (verb) => verb.inf.slice(0, -2);
const futurStem = (verb) => verb.fut ?? verb.inf.replace(/e$/, '');
const isPlural = (person) => person === 3 || person === 4;

/** The participle, taken from the compound form so it can never disagree. */
function participle(verb) {
  return conjugate(verb, 'passe-compose')[0].split(' ').slice(1).join(' ');
}

/**
 * Whether the participle has to be learnt rather than worked out.
 *
 * Judged against what the -er / -ir / -re patterns predict from the
 * infinitive itself, not the verb's declared group: partir is an irregular
 * verb whose participle, parti, is exactly what you would guess, and
 * flagging that would be crying wolf.
 */
function irregularParticiple(verb) {
  const stem = verb.inf.slice(0, -2);
  const predicted = { er: `${stem}é`, ir: `${stem}i`, re: `${stem}u` }[verb.inf.slice(-2)];
  return predicted === undefined || participle(verb) !== predicted;
}

function present(verb, person) {
  const stem = stemOf(verb);

  if (verb.group === 'irr') {
    return `${verb.inf} is irregular in the present — one to learn by heart.`;
  }
  if (verb.group === 'ir') {
    return `Regular -ir: ${stem}- plus ${ENDINGS.ir}. The -iss- only turns up in the plural.`;
  }
  if (verb.group === 're') {
    return `Regular -re: ${stem}- plus ${ENDINGS.re}. No ending at all for il / elle.`;
  }
  if (verb.stems) {
    return `Stem change: ${verb.stems.strong}- for je, tu, il and ils, but ${verb.stems.weak}- for nous and vous.`;
  }
  if (verb.soften === 'ger' && person === 3) {
    return `-ger verbs keep the e before -ons, to hold the soft g: nous ${conjugate(verb, 'present')[3]}.`;
  }
  if (verb.soften === 'cer' && person === 3) {
    return `-cer verbs take a cedilla before -ons, to hold the soft c: nous ${conjugate(verb, 'present')[3]}.`;
  }
  return `Regular -er: ${stem}- plus ${ENDINGS.er}.`;
}

function imparfait(verb, person) {
  if (verb.inf === 'être') {
    return `être is the only exception: the stem is ét-, then ${ENDINGS.imparfait}.`;
  }
  if (verb.soften && isPlural(person)) {
    const forms = conjugate(verb, 'imparfait');
    return `Softening only happens before a, o and u — so nous ${forms[3]}, but je ${forms[0]}.`;
  }
  return `Take the nous form (nous ${conjugate(verb, 'present')[3]}), drop -ons, add ${ENDINGS.imparfait}.`;
}

/**
 * Where the futur (and so the conditionnel) gets its stem.
 *
 * A stem-changing -er verb is not irregular here: achèter- is just the
 * je-form stem, achèt-, with -er on the end. Calling that irregular would
 * teach the reader to ignore the word when it means something.
 */
function futurStemNote(verb) {
  const stem = futurStem(verb);
  if (verb.stems && verb.fut === `${verb.stems.strong}er`) {
    return { stem, kind: 'stem-change', strong: verb.stems.strong };
  }
  if (verb.fut) return { stem, kind: 'irregular' };
  if (verb.group === 're') return { stem, kind: 're' };
  return { stem, kind: 'regular' };
}

function futur(verb) {
  const { stem, kind, strong } = futurStemNote(verb);
  if (kind === 'irregular') {
    return `Irregular stem ${stem}- — then the usual ${ENDINGS.futur}. Those endings never change.`;
  }
  if (kind === 'stem-change') {
    return `The je-form stem ${strong}- takes -er, giving ${stem}-, plus ${ENDINGS.futur}.`;
  }
  if (kind === 're') {
    return `Infinitive minus its final -e (${stem}-), plus ${ENDINGS.futur}.`;
  }
  return `The whole infinitive (${stem}-) plus ${ENDINGS.futur}. Same endings for every verb.`;
}

function conditionnel(verb) {
  // The endings are the easy half. Where the stem comes from is the part
  // worth saying: for aller, "ir-" appears from nowhere unless the note
  // admits it has to be learnt.
  const { stem, kind, strong } = futurStemNote(verb);
  const endings = `with imparfait endings: ${ENDINGS.imparfait}.`;
  if (kind === 'irregular') {
    return `The futur's irregular stem (${stem}-) — one to know — ${endings}`;
  }
  if (kind === 'stem-change') {
    return `The futur stem (${stem}-), built from the je-form ${strong}-, ${endings}`;
  }
  if (kind === 're') {
    return `The futur stem (${stem}-), the infinitive minus its final -e, ${endings}`;
  }
  return `The futur stem (${stem}-), which is the whole infinitive, ${endings}`;
}

function compound(verb, person, imperfectAux) {
  // Split the real conjugation rather than rebuilding it, so the note can
  // never contradict the answer printed just above it.
  const tense = imperfectAux ? 'plus-que-parfait' : 'passe-compose';
  const [auxForm, ...rest] = conjugate(verb, tense)[person].split(' ');
  const pp = rest.join(' ');

  if (imperfectAux) {
    return `The passé composé with the auxiliary in the imparfait: ${auxForm} ${pp}.`;
  }
  if (verb.aux === 'être') {
    return `être in the present plus the participle, which agrees with the subject — ${
      isPlural(person) ? `plural, so ${pp}` : `singular, so ${pp}`}.`;
  }
  const lead = `avoir in the present plus the participle ${pp}.`;
  return irregularParticiple(verb) ? `${lead} That participle is irregular.` : lead;
}

function subjonctif(verb, person) {
  if (verb.subj) {
    return `${verb.inf} has an irregular subjunctive — one to memorise.`;
  }
  if (isPlural(person)) {
    return `nous and vous borrow the imparfait stem: ${conjugate(verb, 'imparfait')[3].replace(/ions$/, '')}- plus -ions, -iez.`;
  }
  return `From the ils form of the present (ils ${conjugate(verb, 'present')[5]}), drop -ent, add -e, -es, -e, -ent.`;
}

const PS_FAMILY = {
  a: '-ai, -as, -a, -âmes, -âtes, -èrent',
  i: '-is, -is, -it, -îmes, -îtes, -irent',
  u: '-us, -us, -ut, -ûmes, -ûtes, -urent',
  in: '-ins, -ins, -int, -înmes, -întes, -inrent',
};

function passeSimple(verb) {
  // What it *means* matters more here than how it is built: this is the
  // tense that makes nineteenth-century novels hard to read, and the answer
  // is that it means nothing new at all.
  const sense = 'Means the same as the passé composé — a finished action — but written, never spoken.';
  const ps = verb.ps;

  if (!ps) {
    const stem = stemOf(verb);
    const family = verb.group === 'er' ? 'a' : 'i';
    return `${sense} ${stem}- plus ${PS_FAMILY[family]}.`;
  }
  if (ps.type === 'in') {
    return `${sense} venir and tenir take the -ins family: ${conjugate(verb, 'passe-simple')[0]}, ${conjugate(verb, 'passe-simple')[2]}, ${conjugate(verb, 'passe-simple')[5]}.`;
  }
  const hint = ps.type === 'u' && participle(verb).endsWith('u')
    ? ` The participle ${participle(verb)} gives the stem away.`
    : '';
  return `${sense} Irregular stem ${ps.stem}- plus ${PS_FAMILY[ps.type]}.${hint}`;
}

function subjonctifImparfait(verb, person) {
  const tu = conjugate(verb, 'passe-simple')[1];
  const base = `Built from the tu form of the passé simple (tu ${tu}): drop the -s, add -sse, -sses, -ssions, -ssiez, -ssent.`;
  if (person === 2) {
    return `Where modern French uses the present subjunctive. The il form takes a circumflex rather than -sse: ${conjugate(verb, 'subjonctif-imparfait')[2]}.`;
  }
  return `Where modern French uses the present subjunctive. ${base}`;
}

/** A one-line explanation of why this form is what it is. */
export function ruleFor(verb, tense, person) {
  switch (tense) {
    case 'present': return present(verb, person);
    case 'imparfait': return imparfait(verb, person);
    case 'futur': return futur(verb);
    case 'conditionnel': return conditionnel(verb);
    case 'passe-compose': return compound(verb, person, false);
    case 'plus-que-parfait': return compound(verb, person, true);
    case 'subjonctif': return subjonctif(verb, person);
    case 'passe-simple': return passeSimple(verb);
    case 'subjonctif-imparfait': return subjonctifImparfait(verb, person);
    default: throw new Error(`Unknown tense: ${tense}`);
  }
}
