/**
 * French verbs: conjugation drills and reading.
 *
 * Everything specific to French lives here — which cards exist, how a card
 * is worded, and what counts as an answer. The app around it only knows
 * about queues, scheduling and the day's tally.
 *
 * The storage keys are the original ones, so review history recorded before
 * the app grew a second subject is still found.
 */

import { VERBS, DECKS, verbsForDeck } from '../verbs.js';
import {
  conjugate, answerFor, attachPronoun,
  TENSES, TENSE_IDS, PRONOUN_LABELS, tenseLabel,
} from '../conjugator.js';
import { checkAnswer, checkRecognition, interpretationsOf } from '../answer.js';
import { ruleFor } from '../rules.js';
import { SENTENCES, WORKS } from '../sentences.js';

const STUDY = [
  ['conjugation', 'Conjugation', 'Drill the forms'],
  ['reading', 'Reading', 'Sentences from novels'],
];

const DIRECTIONS = [
  ['produce', 'Give the form', 'parler → je parle'],
  ['recognise', 'Name the verb and tense', "j'étais → être, imparfait"],
  ['mix', 'Mix both', 'alternates between the two'],
];

const SENTENCE_BY_ID = new Map(SENTENCES.map((sentence) => [sentence.id, sentence]));

// A forward card keeps its three-part id, so review history recorded before
// reverse cards existed still matches; reverse cards get a "|r" suffix and
// are scheduled independently.
const cardId = (inf, tense, person, direction) =>
  `${inf}|${tense}|${person}${direction === 'recognise' ? '|r' : ''}`;

const text = (value) => document.createTextNode(value);

function span(className, content) {
  const node = document.createElement('span');
  if (className) node.className = className;
  node.textContent = content;
  return node;
}

export const french = {
  id: 'french',
  label: 'French verbs',
  hint: 'Conjugation and reading',

  defaults: {
    study: 'conjugation',
    deck: 'core',
    tenses: ['present', 'passe-compose', 'futur'],
    pronouns: [0, 1, 2, 3, 4, 5],
    direction: 'produce',
  },

  keys(s) {
    return {
      progress: 'conjugaison.progress.v1',
      // Reading and drilling keep separate daily tallies: they are different
      // activities, and one should not eat the other's allowance.
      daily: s.study === 'reading' ? 'conjugaison.daily.reading.v1' : 'conjugaison.daily.v1',
      log: 'conjugaison.log.v1',
    };
  },

  /** Every key this subject owns, so a reset clears all of it. */
  storageKeys: () => [
    'conjugaison.progress.v1',
    'conjugaison.daily.v1',
    'conjugaison.daily.reading.v1',
    'conjugaison.log.v1',
  ],

  /** Worth offering on a phone keyboard; other subjects need no such thing. */
  accents: ['é', 'è', 'ê', 'à', 'â', 'î', 'ô', 'û', 'ç'],

  /** Guard against a stored deck, tense or mode that no longer exists. */
  normalise(s) {
    if (!DECKS.some((d) => d.id === s.deck)) s.deck = this.defaults.deck;
    s.tenses = (s.tenses ?? []).filter((t) => TENSE_IDS.includes(t));
    if (!s.tenses.length) s.tenses = [...this.defaults.tenses];
    s.pronouns = (s.pronouns ?? []).filter((p) => p >= 0 && p < 6);
    if (!s.pronouns.length) s.pronouns = [...this.defaults.pronouns];
    if (!DIRECTIONS.some(([id]) => id === s.direction)) s.direction = this.defaults.direction;
    if (!STUDY.some(([id]) => id === s.study)) s.study = this.defaults.study;
  },

  filters(s) {
    const reading = s.study === 'reading';
    return [
      {
        id: 'study',
        legend: 'Study',
        type: 'radio',
        options: STUDY.map(([value, label, hint]) => ({ value, label, hint })),
      },
      {
        id: 'deck',
        legend: 'Deck',
        type: 'radio',
        options: DECKS.map((deck) => ({
          value: deck.id,
          label: deck.label,
          hint: `${verbsForDeck(deck.id).length} verbs`,
        })),
      },
      {
        id: 'tenses',
        legend: 'Tenses',
        type: 'checkbox',
        options: TENSES.map((tense) => ({ value: tense.id, label: tense.label, hint: tense.hint })),
      },
      // A sentence has already chosen its pronoun and its direction for you.
      ...(reading ? [] : [{
        id: 'pronouns',
        legend: 'Pronouns',
        type: 'checkbox',
        chips: true,
        options: PRONOUN_LABELS.map((label, i) => ({ value: i, label })),
      }, {
        id: 'direction',
        legend: 'Direction',
        type: 'radio',
        options: DIRECTIONS.map(([value, label, hint]) => ({ value, label, hint })),
      }]),
    ];
  },

  cardIds(s) {
    const ids = [];
    if (s.study === 'reading') {
      // Sentence cards are not verb x tense x pronoun combinations, so the
      // pronoun filter has nothing to say about them; deck and tense still do.
      const inDeck = new Set(verbsForDeck(s.deck).map((v) => v.inf));
      for (const sentence of SENTENCES) {
        if (s.tenses.includes(sentence.tense) && inDeck.has(sentence.inf)) {
          ids.push(`sentence|${sentence.id}`);
        }
      }
      return ids;
    }
    const directions = s.direction === 'mix' ? ['produce', 'recognise'] : [s.direction];
    for (const verb of verbsForDeck(s.deck)) {
      for (const tense of s.tenses) {
        for (const person of s.pronouns) {
          for (const direction of directions) ids.push(cardId(verb.inf, tense, person, direction));
        }
      }
    }
    return ids;
  },

  parse(id) {
    if (id.startsWith('sentence|')) {
      const sentence = SENTENCE_BY_ID.get(id.slice('sentence|'.length));
      if (!sentence) return null;
      return {
        verb: VERBS.find((v) => v.inf === sentence.inf),
        tense: sentence.tense,
        person: sentence.person,
        direction: 'reading',
        sentence,
      };
    }
    const [inf, tense, person, reverse] = id.split('|');
    const verb = VERBS.find((v) => v.inf === inf);
    if (!verb || !TENSE_IDS.includes(tense)) return null;
    return {
      verb,
      tense,
      person: Number(person),
      direction: reverse === 'r' ? 'recognise' : 'produce',
    };
  },

  prompt(card) {
    const { verb, tense, person, direction } = card;

    if (direction === 'reading') {
      const { text: sentence, start, end } = card.sentence;
      const target = document.createElement('mark');
      target.textContent = sentence.slice(start, end);
      return {
        pill: 'In a sentence',
        lead: 'Which verb is this, and which tense?',
        prose: true,
        nodes: [text(sentence.slice(0, start)), target, text(sentence.slice(end))],
      };
    }

    if (direction === 'recognise') {
      // Naming the tense would give half the answer away, so a reverse card
      // shows the bare form and nothing else.
      return {
        pill: 'Verb and tense?',
        lead: 'Which verb is this, and which tense?',
        nodes: [text(answerFor(verb, tense, person))],
      };
    }

    const strong = document.createElement('strong');
    strong.textContent = tenseLabel(tense).toLowerCase();
    return {
      pill: tenseLabel(tense),
      gloss: verb.en,
      lead: ['What is the ', strong, ' of'],
      nodes: [span('accent', PRONOUN_LABELS[person]), text(' · '), text(verb.inf)],
    };
  },

  answer(card) {
    const { verb, tense, person, direction } = card;
    const note = ruleFor(verb, tense, person);

    if (direction === 'reading') {
      const { work, chapter } = card.sentence;
      const { title, author } = WORKS[work];
      return {
        answer: verb.inf,
        sub: `${tenseLabel(tense)} · ${verb.en}`,
        source: `${title}${chapter ? `, ch. ${chapter}` : ''} — ${author}`,
        note,
      };
    }

    if (direction === 'recognise') {
      // "je suis" is also suivre; "je finis" is also a passé simple. Naming
      // the other readings is the point, not a footnote — it is what makes a
      // form ambiguous on the page of a book.
      const others = interpretationsOf(answerFor(verb, tense, person), person)
        .filter((o) => !(o.inf === verb.inf && o.tense === tense))
        .map((o) => (o.inf === verb.inf
          ? tenseLabel(o.tense).toLowerCase()
          : `${o.inf} (${tenseLabel(o.tense).toLowerCase()})`));
      return {
        answer: verb.inf,
        sub: `${tenseLabel(tense)} · ${verb.en}`
          + (others.length ? ` — also ${others.join(', ')}` : ''),
        note,
      };
    }

    return { answer: answerFor(verb, tense, person), note };
  },

  /** The whole six-person paradigm, on request. */
  extra(card) {
    const { verb, tense, person } = card;
    const table = document.createElement('table');
    table.className = 'paradigm';
    conjugate(verb, tense).forEach((form, i) => {
      const row = table.insertRow();
      if (i === person) row.className = 'current';
      row.insertCell().textContent = PRONOUN_LABELS[i];
      row.insertCell().textContent = attachPronoun(form, i, tense);
    });
    return { label: 'the full table', node: table };
  },

  faces(card) {
    const { verb, tense, person, direction, sentence } = card;
    if (direction === 'reading') {
      return {
        question: sentence.text.slice(sentence.start, sentence.end),
        answer: `${verb.inf} · ${tenseLabel(tense).toLowerCase()}`,
      };
    }
    if (direction === 'recognise') {
      return { question: answerFor(verb, tense, person), answer: verb.inf };
    }
    return {
      question: `${verb.inf} · ${tenseLabel(tense).toLowerCase()} · ${PRONOUN_LABELS[person]}`,
      answer: answerFor(verb, tense, person),
    };
  },

  check(input, card) {
    return card.direction === 'produce' ? checkAnswer(input, card) : checkRecognition(input, card);
  },

  placeholder(card) {
    return card.direction === 'produce' ? 'type the form…' : 'verb and tense…';
  },
};
