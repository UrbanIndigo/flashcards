import test from 'node:test';
import assert from 'node:assert/strict';

import { WORDS, WORD_BY_ID, BANDS, KINDS, wordsFor } from '../js/vocabulary.js';
import { french } from '../js/subjects/french.js';

const settings = (over = {}) => {
  const s = { ...french.defaults, ...over };
  french.normalise(s);
  return s;
};

const card = (id) => french.parse(`w|${id}`);

test('a thousand words, each in one band and one kind', () => {
  assert.equal(WORDS.length, 1000);
  assert.equal(new Set(WORDS.map((w) => w.id)).size, 1000, 'no word twice in the same kind');
  assert.deepEqual(BANDS.map((b) => WORDS.filter((w) => w.band === b.id).length), [250, 350, 400]);
  for (const w of WORDS) {
    assert.ok(KINDS.some((k) => k.id === w.kind), `${w.word}: ${w.kind}`);
    assert.ok(w.en?.trim(), `${w.word} has no meaning`);
    assert.ok(!w.word.includes("'"), `straight apostrophe: ${w.word}`);
    assert.equal(WORD_BY_ID.get(w.id), w);
  }
});

test('every noun carries its gender, and wears it on the card', () => {
  // A noun learnt without its article is a noun half learnt.
  const nouns = WORDS.filter((w) => w.kind === 'n');
  assert.ok(nouns.length > 400, `only ${nouns.length} nouns`);
  for (const noun of nouns) {
    assert.ok(['m', 'f', 'mf', 'm-pl', 'f-pl'].includes(noun.gender), `${noun.word}: ${noun.gender}`);
    // No \b here: it cannot match between ’ and an accented letter, since
    // neither counts as a word character.
    assert.match(noun.shown, /^(le\/la |le |la |les |l’)/, `${noun.word} is shown bare: ${noun.shown}`);
    assert.ok(noun.accepts.length > 0, noun.word);
    // Where the article elides it cannot prove the gender, so the card says
    // it outright and only un/une is accepted.
    if (noun.shown.startsWith('l’')) {
      assert.match(noun.shown, /\((m|f|m\/f)\)$/, `${noun.word} hides its gender: ${noun.shown}`);
      assert.ok(noun.accepts.every((a) => /^(un|une) /.test(a)), noun.accepts.join(' / '));
    }
  }
});

test('an adjective shows its feminine, or says there is nothing to show', () => {
  for (const adj of WORDS.filter((w) => w.kind === 'a')) {
    assert.ok(adj.feminine, adj.word);
    if (adj.feminine === adj.word) {
      assert.equal(adj.shown, adj.word, `${adj.word} should stand alone`);
    } else {
      assert.equal(adj.shown, `${adj.word} (${adj.feminine})`);
      assert.ok(adj.accepts.includes(adj.feminine), `${adj.word}: the feminine is an answer too`);
    }
  }
  assert.equal(WORD_BY_ID.get('grand-a').shown, 'grand (grande)');
  assert.equal(WORD_BY_ID.get('rouge-a').shown, 'rouge');
});

test('the display forms follow the article rules', () => {
  const shown = (id) => WORD_BY_ID.get(id).shown;
  assert.equal(shown('livre-n'), 'le livre');
  assert.equal(shown('maison-n'), 'la maison');
  assert.equal(shown('eau-n'), 'l’eau (f)');
  assert.equal(shown('homme-n'), 'l’homme (m)');
  assert.equal(shown('eleve-n'), 'l’élève (m/f)');
  assert.equal(shown('collegue-n'), 'le/la collègue');
  assert.equal(shown('vacances-n'), 'les vacances (f pl)');
  // h is mute in l'homme but not in le hasard, so the exceptions are listed
  // rather than guessed at.
  const hWords = WORDS.filter((w) => w.kind === 'n' && w.word.startsWith('h'));
  for (const w of hWords) assert.match(w.shown, /^(le|la|l’)/, w.word);
});

test('English to French is marked on the gender, not just the spelling', () => {
  const maison = card('maison-n');
  assert.equal(french.typable(maison), true);
  assert.equal(french.check('la maison', maison).level, 'correct');
  assert.equal(french.check('une maison', maison).level, 'correct');
  assert.deepEqual(french.check('maison', maison), {
    level: 'close', message: 'Right word — which gender?',
  });
  assert.deepEqual(french.check('le maison', maison), {
    level: 'close', message: 'Right word — wrong gender',
  });
  assert.equal(french.check('la table', maison).level, 'wrong');
  assert.equal(french.check('', maison).level, 'wrong');

  // l’eau is how anybody would write it. It does not happen to show the
  // gender, because the article has elided — so it is accepted, and the card
  // names the gender rather than marking correct French wrong.
  const eau = card('eau-n');
  assert.equal(french.check('une eau', eau).level, 'correct');
  assert.deepEqual(french.check('l’eau', eau), { level: 'correct', message: 'Correct — feminine' });
  assert.deepEqual(french.check('l’automne', card('automne-n')), {
    level: 'correct', message: 'Correct — masculine',
  });
  assert.equal(french.check('un eau', eau).message, 'Right word — wrong gender');
  assert.equal(french.check('eau', eau).message, 'Right word — which gender?');

  // An adjective is right in either gender.
  const grand = card('grand-a');
  assert.equal(french.check('grand', grand).level, 'correct');
  assert.equal(french.check('grande', grand).level, 'correct');

  // Accents still count.
  const cafe = card('cafe-n');
  assert.equal(french.check('le café', cafe).level, 'correct');
  assert.equal(french.check('le cafe', cafe).level, 'close');
});

test('French to English is graded by you, since a word has many meanings', () => {
  const back = card('maison-n|r');
  assert.equal(french.typable(back), false);
  assert.equal(french.check('house', back), null);
  assert.equal(french.answer(back).answer, 'house');
  assert.equal(french.answer(back).sub, 'la maison');
});

test('the answer explains the gender rather than only marking it', () => {
  assert.match(french.answer(card('maison-n')).note, /Feminine/);
  assert.match(french.answer(card('livre-n')).note, /Masculine/);
  assert.match(french.answer(card('vacances-n')).note, /plural/);
  assert.match(french.answer(card('rouge-a')).note, /same in the feminine/);
  assert.equal(french.answer(card('parler-v')).note, undefined);
});

test('the voice says the article, and not the note to the eye', () => {
  assert.equal(french.speech(card('maison-n')).text, 'la maison');
  assert.equal(french.speech(card('eau-n')).text, 'une eau', 'never "l’eau (f)"');
  assert.equal(french.speech(card('grand-a')).text, 'grand, grande');
  assert.equal(french.speech(card('parler-v')).text, 'parler');
  // On the way round where the French is the question, it is already shown.
  assert.equal(french.speech(card('maison-n|r')).withPrompt, true);
  assert.equal(french.speech(card('maison-n')).withPrompt, false);
  for (const w of WORDS) {
    const spoken = french.speech(card(w.id)).text;
    assert.ok(!/[()/]/.test(spoken), `${w.word} would be read as "${spoken}"`);
  }
});

test('bands and kinds narrow the deck', () => {
  assert.equal(french.cardIds(settings({ study: 'words' })).length, 1000);
  assert.equal(french.cardIds(settings({ study: 'words', direction: 'mix' })).length, 2000);
  assert.equal(
    french.cardIds(settings({ study: 'words', vocabKinds: ['n'] })).length,
    wordsFor(BANDS.map((b) => b.id), ['n']).length,
  );
  assert.equal(french.cardIds(settings({ study: 'words', vocabBands: ['core'] })).length, 250);
  assert.deepEqual(settings({ vocabKinds: ['q'] }).vocabKinds, french.defaults.vocabKinds);
  assert.deepEqual(settings({ vocabBands: [] }).vocabBands, french.defaults.vocabBands);
  assert.deepEqual(
    french.filters(settings({ study: 'words' })).map((f) => f.id),
    ['study', 'vocabBands', 'vocabKinds', 'direction'],
  );
});

test('each way of studying deals its own cards', () => {
  // Twice now a branch has been pasted into filters() instead of cardIds(),
  // where it is unreachable — and the mode quietly dealt conjugation cards
  // instead, with every test still green.
  const prefix = {
    words: 'w|', messages: 'msg|', everyday: 'day|', gaps: 'gap|',
    phrases: 'phrase|', expressions: 'expr|', reading: 'sentence|',
  };
  for (const [study, starts] of Object.entries(prefix)) {
    const ids = french.cardIds(settings({ study }));
    assert.ok(ids.length > 0, `${study} deals nothing`);
    assert.ok(ids.every((id) => id.startsWith(starts)), `${study} is dealing someone else's cards`);
  }
  // Conjugation is the one with no prefix of its own: verb|tense|person.
  const drills = french.cardIds(settings({ study: 'conjugation' }));
  assert.ok(drills.every((id) => /^[a-zà-ÿ’]+\|[a-z-]+\|\d/.test(id)), drills[0]);
});

test('an article only counts where it is French', () => {
  // l’, les and des prove nothing about the gender, so they are accepted
  // only where they belong: l’ in front of a vowel, les with a noun that is
  // always plural. "les maison" is neither, and neither is "l’maison".
  const maison = card('maison-n');
  for (const typed of ['les maison', 'des maison', 'l’maison']) {
    assert.deepEqual(french.check(typed, maison), {
      level: 'close', message: 'Right word — which gender?',
    }, typed);
  }
  assert.equal(french.check('les vacances', card('vacances-n')).level, 'correct');
  assert.equal(french.check('les automne', card('automne-n')).level, 'close');

  // Before a vowel it is l’, so le or la is the right gender written wrongly
  // — right, and worth a word about it.
  const elided = french.check('le automne', card('automne-n'));
  assert.equal(elided.level, 'correct');
  assert.match(elided.message, /elides: l’automne/);

  // A word that is either gender takes either article.
  const eleve = card('eleve-n');
  for (const typed of ['un élève', 'une élève', 'l’élève']) {
    assert.equal(french.check(typed, eleve).level, 'correct', typed);
  }
});

test('correct French is never marked wrong', () => {
  // Every noun's own display form, typed back, has to be accepted — that is
  // the form the card itself showed you.
  for (const entry of WORDS.filter((w) => w.kind === 'n')) {
    const asShown = entry.shown.replace(/\s*\((m|f|m\/f|m pl|f pl)\)$/, '');
    // "le/la collègue" is two answers shown at once, not one to type back.
    if (asShown.includes('/')) continue;
    const verdict = french.check(asShown, card(entry.id));
    assert.equal(verdict.level, 'correct', `${asShown} → ${verdict.message}`);
  }
});
