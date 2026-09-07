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

function futur(verb) {
  const stem = futurStem(verb);
  if (verb.fut) {
    return `Irregular stem ${stem}-, then the usual ${ENDINGS.futur} — those endings never change.`;
  }
  if (verb.group === 're') {
    return `Infinitive minus its final -e (${stem}-), plus ${ENDINGS.futur}.`;
  }
  return `The whole infinitive (${stem}-) plus ${ENDINGS.futur}. Same endings for every verb.`;
}

function conditionnel(verb) {
  return `The futur stem (${futurStem(verb)}-) with imparfait endings: ${ENDINGS.imparfait}.`;
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
    default: throw new Error(`Unknown tense: ${tense}`);
  }
}
