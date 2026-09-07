/**
 * Builds js/sentences.js from a directory of public-domain French texts.
 *
 *   node tools/extract-sentences.mjs <transcripts-dir> > js/sentences.js
 *
 * The hard part is not finding verbs, it is being *sure* about them. A card
 * that highlights "la porte" and calls it porter would teach the opposite of
 * what it is for, so this errs heavily towards precision:
 *
 *   1. A form only counts when it directly follows a subject pronoun. That
 *      rules out every noun homograph in one move — "il entre" is the verb,
 *      "entre les deux" is not — and it fixes the person for free.
 *   2. The form must have exactly one reading across every verb and tense in
 *      the app. "il vit" is voir in the passé simple or vivre in the présent,
 *      and a sentence card cannot mark one of those wrong, so it is dropped.
 *
 * Whatever survives both filters is a sentence whose answer is certain.
 */

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';

import { VERBS } from '../js/verbs.js';
import { conjugate, TENSE_IDS } from '../js/conjugator.js';

const PRONOUNS = {
  je: 0, "j'": 0, tu: 1, il: 2, elle: 2, on: 2, nous: 3, vous: 4, ils: 5, elles: 5,
};

const MIN_LENGTH = 45;
const MAX_LENGTH = 165;
/** Enough variety without 200 cards that all say "il dit". */
const MAX_PER_VERB_TENSE = 2;

const LITERARY = new Set(['passe-simple', 'subjonctif-imparfait']);

/** form -> every reading of it, so we can insist on exactly one. */
function buildIndex() {
  const index = new Map();
  for (const verb of VERBS) {
    for (const tense of TENSE_IDS) {
      conjugate(verb, tense).forEach((form, person) => {
        const key = form.toLowerCase();
        if (!index.has(key)) index.set(key, []);
        index.get(key).push({ inf: verb.inf, tense, person });
      });
    }
  }
  return index;
}

const TITLES = [
  [/^LeComteDeMonteCristo/, 'Le Comte de Monte-Cristo', 'Alexandre Dumas'],
  [/^LesMysteresDeParis/, 'Les Mystères de Paris', 'Eugène Sue'],
  [/^LeDernierJourDunCondamne/, "Le Dernier Jour d'un condamné", 'Victor Hugo'],
];

function sourceOf(file) {
  const name = basename(file, '.txt');
  const match = TITLES.find(([pattern]) => pattern.test(name));
  if (!match) return null;
  const chapter = name.match(/Chap(\d+)|C(\d+)$/);
  return { work: match[1], author: match[2], chapter: chapter ? Number(chapter[1] ?? chapter[2]) : null };
}

/** Sentence boundaries, keeping the terminator. */
function sentences(text) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const index = buildIndex();
const dir = process.argv[2];
const seen = new Set();
const counts = new Map();
const cards = [];

for (const file of readdirSync(dir).sort()) {
  const source = sourceOf(file);
  if (!source) continue;

  for (const sentence of sentences(readFileSync(join(dir, file), 'utf8'))) {
    if (sentence.length < MIN_LENGTH || sentence.length > MAX_LENGTH) continue;
    if (/[«»"]/.test(sentence)) continue; // broken quotation spans read badly out of context

    // Every "pronoun + word" pair in the sentence, with its position.
    const pattern = /\b(je|tu|il|elle|on|nous|vous|ils|elles)\s+([a-zà-öø-ÿ'’-]+)|\bj'([a-zà-öø-ÿ-]+)/gi;
    const hits = [];
    for (const m of sentence.matchAll(pattern)) {
      const pronoun = (m[1] ?? "j'").toLowerCase();
      const word = (m[2] ?? m[3]).toLowerCase().replace(/['’]$/, '');
      const readings = index.get(word);
      if (!readings || readings.length !== 1) continue;      // must be unambiguous
      const [reading] = readings;
      if (reading.person !== PRONOUNS[pronoun]) continue;    // must agree with its pronoun
      const start = m.index + m[0].length - (m[2] ?? m[3]).length;
      hits.push({ ...reading, start, end: start + (m[2] ?? m[3]).length });
    }
    if (!hits.length) continue;

    // Prefer a literary tense — that is what a reader trips over.
    const target = hits.find((h) => LITERARY.has(h.tense)) ?? hits[0];
    const key = `${target.inf}|${target.tense}`;
    if ((counts.get(key) ?? 0) >= MAX_PER_VERB_TENSE) continue;
    if (seen.has(sentence)) continue;

    seen.add(sentence);
    counts.set(key, (counts.get(key) ?? 0) + 1);
    cards.push({
      // Stable across regeneration, so review history survives a rebuild.
      id: createHash('sha1').update(sentence).digest('hex').slice(0, 10),
      text: sentence,
      start: target.start,
      end: target.end,
      inf: target.inf,
      tense: target.tense,
      person: target.person,
      work: source.work,
      chapter: source.chapter,
    });
  }
}

cards.sort((a, b) => (LITERARY.has(b.tense) ? 1 : 0) - (LITERARY.has(a.tense) ? 1 : 0));

const byTense = {};
for (const c of cards) byTense[c.tense] = (byTense[c.tense] ?? 0) + 1;
process.stderr.write(`${cards.length} sentences\n`);
for (const [tense, n] of Object.entries(byTense).sort((a, b) => b[1] - a[1])) {
  process.stderr.write(`  ${tense.padEnd(22)} ${n}\n`);
}

const works = [...new Set(cards.map((c) => c.work))];
const authors = Object.fromEntries(TITLES.map(([, work, author]) => [work, author]));

process.stdout.write(`/**
 * Sentences from public-domain French novels, with one verb identified.
 *
 * Generated by tools/extract-sentences.mjs — do not edit by hand.
 *
 * Only forms that directly follow a subject pronoun and have exactly one
 * reading across every verb and tense in the app are kept, so each card's
 * answer is certain rather than probable.
 */

export const WORKS = ${JSON.stringify(works.map((w) => ({ title: w, author: authors[w] })), null, 2)};

export const SENTENCES = ${JSON.stringify(
  cards.map((c) => ({ ...c, work: works.indexOf(c.work) })), null, 0,
).replace(/\},\{/g, '},\n  {').replace(/^\[/, '[\n  ').replace(/\]$/, ',\n]')};
`);
