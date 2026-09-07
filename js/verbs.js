/**
 * Verb dataset.
 *
 * Every entry is the *minimum* information needed to build all supported
 * tenses; everything else is derived in conjugator.js. Fields:
 *
 *   inf     infinitive
 *   en      English gloss
 *   group   'er' | 'ir' | 're' | 'irr'
 *             er  regular -er (parler)
 *             ir  regular -ir with -iss- (finir)
 *             re  regular -re (vendre)
 *             irr present tense given explicitly
 *   present six present-tense forms, required for group 'irr'
 *   stems   { strong, weak } for -er verbs with a stem change (acheter)
 *   soften  'cer' | 'ger' spelling adjustment before a/o/u (commencer, manger)
 *   pp      past participle, when not derivable from the group
 *   aux     'être' for verbs taking être in compound tenses (default 'avoir')
 *   fut     future/conditional stem, when not `infinitive minus trailing -e`
 *   imp     imperfect stem, when not `nous form minus -ons`
 *   subj    six present-subjunctive forms, for the handful that are irregular
 *   tags    deck membership
 */

const CORE = 'core';          // the verbs worth knowing first
const IRR = 'irregular';
const REG = 'regular';
const ETRE = 'etre';          // takes être in the passé composé

export const VERBS = [
  // ---------------------------------------------------------------- irregular
  {
    inf: 'être', en: 'to be', group: 'irr', tags: [CORE, IRR],
    present: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
    pp: 'été', fut: 'ser', imp: 'ét',
    subj: ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'],
  },
  {
    inf: 'avoir', en: 'to have', group: 'irr', tags: [CORE, IRR],
    present: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
    pp: 'eu', fut: 'aur',
    subj: ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'],
  },
  {
    inf: 'aller', en: 'to go', group: 'irr', tags: [CORE, IRR, ETRE],
    present: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'],
    pp: 'allé', aux: 'être', fut: 'ir',
    subj: ['aille', 'ailles', 'aille', 'allions', 'alliez', 'aillent'],
  },
  {
    inf: 'faire', en: 'to do, to make', group: 'irr', tags: [CORE, IRR],
    present: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'],
    pp: 'fait', fut: 'fer',
    subj: ['fasse', 'fasses', 'fasse', 'fassions', 'fassiez', 'fassent'],
  },
  {
    inf: 'pouvoir', en: 'to be able to, can', group: 'irr', tags: [CORE, IRR],
    present: ['peux', 'peux', 'peut', 'pouvons', 'pouvez', 'peuvent'],
    pp: 'pu', fut: 'pourr',
    subj: ['puisse', 'puisses', 'puisse', 'puissions', 'puissiez', 'puissent'],
  },
  {
    inf: 'vouloir', en: 'to want', group: 'irr', tags: [CORE, IRR],
    present: ['veux', 'veux', 'veut', 'voulons', 'voulez', 'veulent'],
    pp: 'voulu', fut: 'voudr',
    subj: ['veuille', 'veuilles', 'veuille', 'voulions', 'vouliez', 'veuillent'],
  },
  {
    inf: 'devoir', en: 'to have to, must', group: 'irr', tags: [CORE, IRR],
    present: ['dois', 'dois', 'doit', 'devons', 'devez', 'doivent'],
    pp: 'dû', fut: 'devr',
  },
  {
    inf: 'savoir', en: 'to know (a fact)', group: 'irr', tags: [CORE, IRR],
    present: ['sais', 'sais', 'sait', 'savons', 'savez', 'savent'],
    pp: 'su', fut: 'saur',
    subj: ['sache', 'saches', 'sache', 'sachions', 'sachiez', 'sachent'],
  },
  {
    inf: 'voir', en: 'to see', group: 'irr', tags: [CORE, IRR],
    present: ['vois', 'vois', 'voit', 'voyons', 'voyez', 'voient'],
    pp: 'vu', fut: 'verr',
  },
  {
    inf: 'venir', en: 'to come', group: 'irr', tags: [CORE, IRR, ETRE],
    present: ['viens', 'viens', 'vient', 'venons', 'venez', 'viennent'],
    pp: 'venu', aux: 'être', fut: 'viendr',
  },
  {
    inf: 'devenir', en: 'to become', group: 'irr', tags: [IRR, ETRE],
    present: ['deviens', 'deviens', 'devient', 'devenons', 'devenez', 'deviennent'],
    pp: 'devenu', aux: 'être', fut: 'deviendr',
  },
  {
    inf: 'revenir', en: 'to come back', group: 'irr', tags: [IRR, ETRE],
    present: ['reviens', 'reviens', 'revient', 'revenons', 'revenez', 'reviennent'],
    pp: 'revenu', aux: 'être', fut: 'reviendr',
  },
  {
    inf: 'tenir', en: 'to hold', group: 'irr', tags: [IRR],
    present: ['tiens', 'tiens', 'tient', 'tenons', 'tenez', 'tiennent'],
    pp: 'tenu', fut: 'tiendr',
  },
  {
    inf: 'prendre', en: 'to take', group: 'irr', tags: [CORE, IRR],
    present: ['prends', 'prends', 'prend', 'prenons', 'prenez', 'prennent'],
    pp: 'pris',
  },
  {
    inf: 'comprendre', en: 'to understand', group: 'irr', tags: [IRR],
    present: ['comprends', 'comprends', 'comprend', 'comprenons', 'comprenez', 'comprennent'],
    pp: 'compris',
  },
  {
    inf: 'apprendre', en: 'to learn', group: 'irr', tags: [IRR],
    present: ['apprends', 'apprends', 'apprend', 'apprenons', 'apprenez', 'apprennent'],
    pp: 'appris',
  },
  {
    inf: 'mettre', en: 'to put', group: 'irr', tags: [CORE, IRR],
    present: ['mets', 'mets', 'met', 'mettons', 'mettez', 'mettent'],
    pp: 'mis',
  },
  {
    inf: 'promettre', en: 'to promise', group: 'irr', tags: [IRR],
    present: ['promets', 'promets', 'promet', 'promettons', 'promettez', 'promettent'],
    pp: 'promis',
  },
  {
    inf: 'dire', en: 'to say, to tell', group: 'irr', tags: [CORE, IRR],
    present: ['dis', 'dis', 'dit', 'disons', 'dites', 'disent'],
    pp: 'dit',
  },
  {
    inf: 'lire', en: 'to read', group: 'irr', tags: [IRR],
    present: ['lis', 'lis', 'lit', 'lisons', 'lisez', 'lisent'],
    pp: 'lu',
  },
  {
    inf: 'écrire', en: 'to write', group: 'irr', tags: [IRR],
    present: ['écris', 'écris', 'écrit', 'écrivons', 'écrivez', 'écrivent'],
    pp: 'écrit',
  },
  {
    inf: 'boire', en: 'to drink', group: 'irr', tags: [IRR],
    present: ['bois', 'bois', 'boit', 'buvons', 'buvez', 'boivent'],
    pp: 'bu',
  },
  {
    inf: 'croire', en: 'to believe', group: 'irr', tags: [IRR],
    present: ['crois', 'crois', 'croit', 'croyons', 'croyez', 'croient'],
    pp: 'cru',
  },
  {
    inf: 'connaître', en: 'to know (be familiar with)', group: 'irr', tags: [IRR],
    present: ['connais', 'connais', 'connaît', 'connaissons', 'connaissez', 'connaissent'],
    pp: 'connu',
  },
  {
    inf: 'partir', en: 'to leave', group: 'irr', tags: [CORE, IRR, ETRE],
    present: ['pars', 'pars', 'part', 'partons', 'partez', 'partent'],
    pp: 'parti', aux: 'être',
  },
  {
    inf: 'sortir', en: 'to go out', group: 'irr', tags: [IRR, ETRE],
    present: ['sors', 'sors', 'sort', 'sortons', 'sortez', 'sortent'],
    pp: 'sorti', aux: 'être',
  },
  {
    inf: 'dormir', en: 'to sleep', group: 'irr', tags: [IRR],
    present: ['dors', 'dors', 'dort', 'dormons', 'dormez', 'dorment'],
    pp: 'dormi',
  },
  {
    inf: 'sentir', en: 'to feel, to smell', group: 'irr', tags: [IRR],
    present: ['sens', 'sens', 'sent', 'sentons', 'sentez', 'sentent'],
    pp: 'senti',
  },
  {
    inf: 'servir', en: 'to serve', group: 'irr', tags: [IRR],
    present: ['sers', 'sers', 'sert', 'servons', 'servez', 'servent'],
    pp: 'servi',
  },
  {
    inf: 'ouvrir', en: 'to open', group: 'irr', tags: [IRR],
    present: ['ouvre', 'ouvres', 'ouvre', 'ouvrons', 'ouvrez', 'ouvrent'],
    pp: 'ouvert',
  },
  {
    inf: 'offrir', en: 'to offer', group: 'irr', tags: [IRR],
    present: ['offre', 'offres', 'offre', 'offrons', 'offrez', 'offrent'],
    pp: 'offert',
  },
  {
    inf: 'courir', en: 'to run', group: 'irr', tags: [IRR],
    present: ['cours', 'cours', 'court', 'courons', 'courez', 'courent'],
    pp: 'couru', fut: 'courr',
  },
  {
    inf: 'mourir', en: 'to die', group: 'irr', tags: [IRR, ETRE],
    present: ['meurs', 'meurs', 'meurt', 'mourons', 'mourez', 'meurent'],
    pp: 'mort', aux: 'être', fut: 'mourr',
  },
  {
    inf: 'naître', en: 'to be born', group: 'irr', tags: [IRR, ETRE],
    present: ['nais', 'nais', 'naît', 'naissons', 'naissez', 'naissent'],
    pp: 'né', aux: 'être',
  },
  {
    inf: 'recevoir', en: 'to receive', group: 'irr', tags: [IRR],
    present: ['reçois', 'reçois', 'reçoit', 'recevons', 'recevez', 'reçoivent'],
    pp: 'reçu', fut: 'recevr',
  },
  {
    inf: 'vivre', en: 'to live', group: 'irr', tags: [IRR],
    present: ['vis', 'vis', 'vit', 'vivons', 'vivez', 'vivent'],
    pp: 'vécu',
  },
  {
    inf: 'suivre', en: 'to follow', group: 'irr', tags: [IRR],
    present: ['suis', 'suis', 'suit', 'suivons', 'suivez', 'suivent'],
    pp: 'suivi',
  },
  {
    inf: 'rire', en: 'to laugh', group: 'irr', tags: [IRR],
    present: ['ris', 'ris', 'rit', 'rions', 'riez', 'rient'],
    pp: 'ri',
  },
  {
    inf: 'conduire', en: 'to drive', group: 'irr', tags: [IRR],
    present: ['conduis', 'conduis', 'conduit', 'conduisons', 'conduisez', 'conduisent'],
    pp: 'conduit',
  },
  {
    inf: 'craindre', en: 'to fear', group: 'irr', tags: [IRR],
    present: ['crains', 'crains', 'craint', 'craignons', 'craignez', 'craignent'],
    pp: 'craint',
  },

  // ------------------------------------------------------------- regular -er
  { inf: 'parler', en: 'to speak', group: 'er', tags: [CORE, REG] },
  { inf: 'aimer', en: 'to like, to love', group: 'er', tags: [CORE, REG] },
  { inf: 'regarder', en: 'to watch', group: 'er', tags: [CORE, REG] },
  { inf: 'écouter', en: 'to listen', group: 'er', tags: [CORE, REG] },
  { inf: 'chercher', en: 'to look for', group: 'er', tags: [REG] },
  { inf: 'trouver', en: 'to find', group: 'er', tags: [REG] },
  { inf: 'donner', en: 'to give', group: 'er', tags: [CORE, REG] },
  { inf: 'penser', en: 'to think', group: 'er', tags: [REG] },
  { inf: 'travailler', en: 'to work', group: 'er', tags: [CORE, REG] },
  { inf: 'habiter', en: 'to live (somewhere)', group: 'er', tags: [REG] },
  { inf: 'jouer', en: 'to play', group: 'er', tags: [REG] },
  { inf: 'demander', en: 'to ask', group: 'er', tags: [REG] },
  { inf: 'montrer', en: 'to show', group: 'er', tags: [REG] },
  { inf: 'porter', en: 'to carry, to wear', group: 'er', tags: [REG] },
  { inf: 'rester', en: 'to stay', group: 'er', tags: [REG, ETRE], aux: 'être' },
  { inf: 'entrer', en: 'to enter', group: 'er', tags: [REG, ETRE], aux: 'être' },
  { inf: 'rentrer', en: 'to go back home', group: 'er', tags: [REG, ETRE], aux: 'être' },
  { inf: 'tomber', en: 'to fall', group: 'er', tags: [REG, ETRE], aux: 'être' },
  { inf: 'arriver', en: 'to arrive', group: 'er', tags: [CORE, REG, ETRE], aux: 'être' },
  { inf: 'monter', en: 'to go up', group: 'er', tags: [REG, ETRE], aux: 'être' },
  { inf: 'retourner', en: 'to return', group: 'er', tags: [REG, ETRE], aux: 'être' },

  // -er verbs with a spelling or stem change
  { inf: 'manger', en: 'to eat', group: 'er', soften: 'ger', tags: [CORE, REG] },
  { inf: 'nager', en: 'to swim', group: 'er', soften: 'ger', tags: [REG] },
  { inf: 'voyager', en: 'to travel', group: 'er', soften: 'ger', tags: [REG] },
  { inf: 'changer', en: 'to change', group: 'er', soften: 'ger', tags: [REG] },
  { inf: 'commencer', en: 'to begin', group: 'er', soften: 'cer', tags: [CORE, REG] },
  { inf: 'lancer', en: 'to throw', group: 'er', soften: 'cer', tags: [REG] },
  {
    inf: 'acheter', en: 'to buy', group: 'er', tags: [CORE, REG],
    stems: { strong: 'achèt', weak: 'achet' }, fut: 'achèter',
  },
  {
    inf: 'appeler', en: 'to call', group: 'er', tags: [REG],
    stems: { strong: 'appell', weak: 'appel' }, fut: 'appeller',
  },
  {
    inf: 'jeter', en: 'to throw', group: 'er', tags: [REG],
    stems: { strong: 'jett', weak: 'jet' }, fut: 'jetter',
  },
  {
    inf: 'lever', en: 'to lift, to raise', group: 'er', tags: [REG],
    stems: { strong: 'lèv', weak: 'lev' }, fut: 'lèver',
  },
  {
    inf: 'préférer', en: 'to prefer', group: 'er', tags: [REG],
    stems: { strong: 'préfèr', weak: 'préfér' },
  },
  {
    inf: 'espérer', en: 'to hope', group: 'er', tags: [REG],
    stems: { strong: 'espèr', weak: 'espér' },
  },
  {
    inf: 'envoyer', en: 'to send', group: 'er', tags: [REG],
    stems: { strong: 'envoi', weak: 'envoy' }, fut: 'enverr',
  },

  // ------------------------------------------------------------- regular -ir
  { inf: 'finir', en: 'to finish', group: 'ir', tags: [CORE, REG] },
  { inf: 'choisir', en: 'to choose', group: 'ir', tags: [CORE, REG] },
  { inf: 'réussir', en: 'to succeed', group: 'ir', tags: [REG] },
  { inf: 'grandir', en: 'to grow', group: 'ir', tags: [REG] },
  { inf: 'obéir', en: 'to obey', group: 'ir', tags: [REG] },
  { inf: 'remplir', en: 'to fill', group: 'ir', tags: [REG] },
  { inf: 'réfléchir', en: 'to think, to reflect', group: 'ir', tags: [REG] },

  // ------------------------------------------------------------- regular -re
  { inf: 'vendre', en: 'to sell', group: 're', tags: [CORE, REG] },
  { inf: 'attendre', en: 'to wait for', group: 're', tags: [CORE, REG] },
  { inf: 'entendre', en: 'to hear', group: 're', tags: [REG] },
  { inf: 'perdre', en: 'to lose', group: 're', tags: [REG] },
  { inf: 'répondre', en: 'to answer', group: 're', tags: [CORE, REG] },
  { inf: 'rendre', en: 'to give back', group: 're', tags: [REG] },
  { inf: 'descendre', en: 'to go down', group: 're', tags: [REG, ETRE], aux: 'être' },
];

/**
 * Passé simple stems for the irregular verbs, as [stem, pattern].
 *
 * The three patterns are the -is, -us and -ins families; regular verbs are
 * derived, so only the irregulars are listed. Kept as one table because that
 * is how they are learnt — and because a verb whose participle is `-u` very
 * often takes the -us pattern (voulu / voulus, couru / courus), which is
 * easier to see in a list than scattered across entries.
 */
const PASSE_SIMPLE = {
  'être': ['f', 'u'],        avoir: ['e', 'u'],         aller: ['all', 'a'],
  faire: ['f', 'i'],         pouvoir: ['p', 'u'],       vouloir: ['voul', 'u'],
  devoir: ['d', 'u'],        savoir: ['s', 'u'],        voir: ['v', 'i'],
  venir: ['v', 'in'],        devenir: ['dev', 'in'],    revenir: ['rev', 'in'],
  tenir: ['t', 'in'],        prendre: ['pr', 'i'],      comprendre: ['compr', 'i'],
  apprendre: ['appr', 'i'],  mettre: ['m', 'i'],        promettre: ['prom', 'i'],
  dire: ['d', 'i'],          lire: ['l', 'u'],          'écrire': ['écriv', 'i'],
  boire: ['b', 'u'],         croire: ['cr', 'u'],       'connaître': ['conn', 'u'],
  partir: ['part', 'i'],     sortir: ['sort', 'i'],     dormir: ['dorm', 'i'],
  sentir: ['sent', 'i'],     servir: ['serv', 'i'],     ouvrir: ['ouvr', 'i'],
  offrir: ['offr', 'i'],     courir: ['cour', 'u'],     mourir: ['mour', 'u'],
  'naître': ['naqu', 'i'],   recevoir: ['reç', 'u'],    vivre: ['véc', 'u'],
  suivre: ['suiv', 'i'],     rire: ['r', 'i'],          conduire: ['conduis', 'i'],
  craindre: ['craign', 'i'],
};

for (const verb of VERBS) {
  const ps = PASSE_SIMPLE[verb.inf];
  if (ps) verb.ps = { stem: ps[0], type: ps[1] };
}

export const DECKS = [
  { id: 'core', label: 'Core verbs', hint: 'The essential everyday verbs', filter: (v) => v.tags.includes(CORE) },
  { id: 'irregular', label: 'Irregular', hint: 'The ones you have to memorise', filter: (v) => v.tags.includes(IRR) },
  { id: 'regular', label: 'Regular', hint: '-er, -ir and -re patterns', filter: (v) => v.tags.includes(REG) },
  { id: 'etre', label: 'Être verbs', hint: 'Take être in compound tenses', filter: (v) => v.tags.includes(ETRE) },
  { id: 'all', label: 'Everything', hint: `All ${VERBS.length} verbs`, filter: () => true },
];

export function verbsForDeck(deckId) {
  const deck = DECKS.find((d) => d.id === deckId) ?? DECKS[0];
  return VERBS.filter(deck.filter);
}
