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
import {
  checkAnswer, checkRecognition, interpretationsOf, normalise, deaccent,
} from '../answer.js';
import { ruleFor } from '../rules.js';
import { SENTENCES, WORKS } from '../sentences.js';
import { EXPRESSIONS, EXPRESSION_BY_ID, THEMES, expressionsForThemes } from '../expressions.js';
import { PHRASES, PHRASE_BY_ID, TOPICS, phrasesForTopics } from '../phrases.js';
import { GAPS, GAP_BY_ID, PATTERNS, gapsForPatterns } from '../gaps.js';

const STUDY = [
  ['conjugation', 'Conjugation', 'Drill the forms'],
  ['reading', 'Reading', 'Sentences from novels'],
  ['expressions', 'Expressions', 'Idioms in a sentence'],
  ['phrases', 'Phrases', 'Everyday sentences'],
  ['gaps', 'Little words', 'en, y, dont — fill the gap'],
];

const DIRECTIONS = [
  ['produce', 'Give the form', 'parler → je parle'],
  ['recognise', 'Name the verb and tense', "j'étais → être, imparfait"],
  ['mix', 'Mix both', 'alternates between the two'],
];

// The same setting, since it is the same question — can you produce it, or
// only recognise it — but a phrase needs its own words for it.
const PHRASE_DIRECTIONS = [
  ['produce', 'Say it in French', 'English → French'],
  ['recognise', 'Say what it means', 'French → English'],
  ['mix', 'Mix both', 'alternates between the two'],
];

/** Cards there is no honest way to mark, so you grade them yourself. */
const SELF_GRADED = new Set(['expression', 'phrase', 'phrase-meaning']);

const CORRECT = { level: 'correct', message: 'Correct' };
const ACCENTS = { level: 'close', message: 'Almost — check the accents' };
const WRONG = { level: 'wrong', message: 'Not quite' };

/**
 * A gap is one word out of a closed set, which is short enough to type and
 * exact enough to mark — unlike everything else self-graded here.
 */
function checkGap(input, { gap, also = [] }) {
  const typed = normalise(input ?? '');
  if (!typed) return WRONG;
  const accepted = [gap, ...also].map(normalise);
  if (accepted.includes(typed)) return CORRECT;
  // à and a are different words, so this is worth saying rather than waving
  // through.
  if (accepted.some((answer) => deaccent(answer) === deaccent(typed))) return ACCENTS;
  return WRONG;
}

const SENTENCE_BY_ID = new Map(SENTENCES.map((sentence) => [sentence.id, sentence]));

const DAILY_KEYS = {
  conjugation: 'conjugaison.daily.v1',
  reading: 'conjugaison.daily.reading.v1',
  expressions: 'conjugaison.daily.expressions.v1',
  phrases: 'conjugaison.daily.phrases.v1',
  gaps: 'conjugaison.daily.gaps.v1',
};

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
  hint: 'Conjugation, expressions, phrases and reading',

  defaults: {
    study: 'conjugation',
    deck: 'core',
    tenses: ['present', 'passe-compose', 'futur'],
    pronouns: [0, 1, 2, 3, 4, 5],
    direction: 'produce',
    themes: [...THEMES],
    topics: [...TOPICS],
    patterns: [...PATTERNS],
  },

  keys(s) {
    return {
      progress: 'conjugaison.progress.v1',
      // Each way of studying keeps its own daily tally: they are different
      // activities, and one should not eat the others' allowance.
      daily: DAILY_KEYS[s.study] ?? 'conjugaison.daily.v1',
      log: 'conjugaison.log.v1',
    };
  },

  /** Every key this subject owns, so a reset clears all of it. */
  storageKeys: () => [
    'conjugaison.progress.v1',
    ...Object.values(DAILY_KEYS),
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
    s.themes = (s.themes ?? []).filter((t) => THEMES.includes(t));
    if (!s.themes.length) s.themes = [...this.defaults.themes];
    s.topics = (s.topics ?? []).filter((t) => TOPICS.includes(t));
    if (!s.topics.length) s.topics = [...this.defaults.topics];
    s.patterns = (s.patterns ?? []).filter((p) => PATTERNS.includes(p));
    if (!s.patterns.length) s.patterns = [...this.defaults.patterns];
  },

  filters(s) {
    const reading = s.study === 'reading';
    const study = {
      id: 'study',
      legend: 'Study',
      type: 'radio',
      options: STUDY.map(([value, label, hint]) => ({ value, label, hint })),
    };

    // A little word is learnt by meeting it, not by being told a rule, so
    // the only thing to choose is which ones you are meeting.
    if (s.study === 'gaps') {
      return [study, {
        id: 'patterns',
        legend: 'Patterns',
        type: 'checkbox',
        options: PATTERNS.map((pattern) => ({
          value: pattern,
          label: pattern,
          hint: `${GAPS.filter((g) => g.pattern === pattern).length}`,
        })),
      }];
    }

    // A phrase is asked the other way round by default: you are shown the
    // English and asked for the French, because that is the direction a
    // conversation asks for.
    if (s.study === 'phrases') {
      return [study, {
        id: 'topics',
        legend: 'Topics',
        type: 'checkbox',
        options: TOPICS.map((topic) => ({
          value: topic,
          label: topic,
          hint: `${PHRASES.filter((p) => p.topic === topic).length}`,
        })),
      }, {
        id: 'direction',
        legend: 'Direction',
        type: 'radio',
        options: PHRASE_DIRECTIONS.map(([value, label, hint]) => ({ value, label, hint })),
      }];
    }

    // An expression is not a verb in a tense, so none of the conjugation
    // settings have anything to say about one.
    if (s.study === 'expressions') {
      return [study, {
        id: 'themes',
        legend: 'Themes',
        type: 'checkbox',
        options: THEMES.map((theme) => ({
          value: theme,
          label: theme,
          hint: `${EXPRESSIONS.filter((e) => e.theme === theme).length}`,
        })),
      }];
    }

    return [
      study,
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
    if (s.study === 'gaps') {
      return gapsForPatterns(s.patterns).map((gap) => `gap|${gap.id}`);
    }
    if (s.study === 'expressions') {
      return expressionsForThemes(s.themes).map((expression) => `expr|${expression.id}`);
    }
    if (s.study === 'phrases') {
      const ways = s.direction === 'mix' ? ['produce', 'recognise'] : [s.direction];
      for (const phrase of phrasesForTopics(s.topics)) {
        for (const way of ways) ids.push(`phrase|${phrase.id}${way === 'recognise' ? '|r' : ''}`);
      }
      return ids;
    }
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
    if (id.startsWith('gap|')) {
      const gap = GAP_BY_ID.get(id.slice('gap|'.length));
      return gap ? { direction: 'gap', gap } : null;
    }
    if (id.startsWith('phrase|')) {
      const [, key, mark] = id.split('|');
      const phrase = PHRASE_BY_ID.get(key);
      if (!phrase) return null;
      return { direction: mark === 'r' ? 'phrase-meaning' : 'phrase', phrase };
    }
    if (id.startsWith('expr|')) {
      const expression = EXPRESSION_BY_ID.get(id.slice('expr|'.length));
      // An expression that has since been reworded: the app skips a card it
      // cannot describe rather than inventing one.
      return expression ? { direction: 'expression', expression } : null;
    }
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

    if (direction === 'gap') {
      const { text: sentence, start, end } = card.gap;
      return {
        pill: 'Which word?',
        // The English is not a hint here, it is the question: without it
        // there is no telling whether the hole wants y or le.
        lead: card.gap.en,
        question: true,
        nodes: [text(sentence.slice(0, start)), span('gap', '___'), text(sentence.slice(end))],
      };
    }

    if (direction === 'phrase') {
      return {
        pill: 'In French?',
        lead: 'How would you say this?',
        question: true,
        nodes: [text(card.phrase.en)],
      };
    }

    if (direction === 'phrase-meaning') {
      return {
        pill: 'Everyday phrase',
        lead: 'What does this mean?',
        question: true,
        nodes: [text(card.phrase.fr)],
      };
    }

    if (direction === 'expression') {
      const { text: sentence, start, end } = card.expression;
      const target = document.createElement('mark');
      target.textContent = sentence.slice(start, end);
      return {
        pill: 'Expression',
        lead: 'What does this mean?',
        prose: true,
        nodes: [text(sentence.slice(0, start)), target, text(sentence.slice(end))],
      };
    }

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

    if (direction === 'gap') {
      const { gap: missing, text: sentence, also, note: rule } = card.gap;
      return {
        answer: missing,
        sub: also?.length ? `${sentence} · or ${also.join(', ')}` : sentence,
        note: rule,
      };
    }

    if (direction === 'phrase' || direction === 'phrase-meaning') {
      const { fr, en, alt, register, note: usage } = card.phrase;
      // There is usually more than one way to say it, and knowing the others
      // is most of the point.
      const others = alt?.length ? `or ${alt.join(' · ')}` : '';
      return {
        answer: direction === 'phrase' ? fr : en,
        sub: [register, others].filter(Boolean).join(' · ') || undefined,
        note: usage,
      };
    }

    if (direction === 'expression') {
      const { fr, en, literal, register } = card.expression;
      return {
        answer: en,
        sub: register ? `${fr} · ${register}` : fr,
        // The word-for-word reading is usually the reason it sticks.
        note: literal ? `Literally: ${literal}.` : undefined,
      };
    }

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

  /** The whole six-person paradigm, on request — or the sentence in English. */
  extra(card) {
    // A phrase, or a gap, is already the whole of itself: nothing held back.
    if (['phrase', 'phrase-meaning', 'gap'].includes(card.direction)) return null;

    if (card.direction === 'expression') {
      const line = document.createElement('p');
      line.className = 'translation';
      line.textContent = card.expression.english;
      return { label: 'the sentence in English', node: line };
    }

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
    if (direction === 'expression') {
      return { question: card.expression.fr, answer: card.expression.en };
    }
    if (direction === 'gap') {
      const { text: sentence, start, end, gap: missing } = card.gap;
      return { question: `${sentence.slice(0, start)}___${sentence.slice(end)}`, answer: missing };
    }
    if (direction === 'phrase') return { question: card.phrase.en, answer: card.phrase.fr };
    if (direction === 'phrase-meaning') return { question: card.phrase.fr, answer: card.phrase.en };
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

  /**
   * An expression is shown and graded by you. "Fed up", "sick of it" and
   * "had enough" are the same answer, and there is no honest way to mark the
   * difference, so the card asks rather than tests.
   */
  typable: (card) => !SELF_GRADED.has(card.direction),

  check(input, card) {
    if (SELF_GRADED.has(card.direction)) return null;
    if (card.direction === 'gap') return checkGap(input, card.gap);
    return card.direction === 'produce' ? checkAnswer(input, card) : checkRecognition(input, card);
  },

  placeholder(card) {
    if (card.direction === 'gap') return 'the missing word…';
    return card.direction === 'produce' ? 'type the form…' : 'verb and tense…';
  },
};
