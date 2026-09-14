import test from 'node:test';
import assert from 'node:assert/strict';

import { PHRASES, PHRASE_BY_ID, TOPICS, phrasesForTopics } from '../js/phrases.js';
import { french } from '../js/subjects/french.js';

const settings = (over = {}) => {
  const s = { ...french.defaults, ...over };
  french.normalise(s);
  return s;
};

const all = (over = {}) => french.cardIds(settings({ study: 'phrases', ...over }));

// A question and the answer to it are two cards, so a topic is worth more
// than the number of phrases in it.
const cardsIn = (list) => list.length + list.filter((p) => p.reply).length;

test('every phrase has both halves and a topic', () => {
  assert.ok(PHRASES.length > 90, `only ${PHRASES.length}`);
  for (const p of PHRASES) {
    assert.ok(p.en && p.fr, p.id);
    assert.ok(TOPICS.includes(p.topic), `${p.id}: ${p.topic}`);
    assert.match(p.en, /[.!?…]$/, `unfinished English: ${p.en}`);
    assert.match(p.fr, /[.!?…]$/, `unfinished French: ${p.fr}`);
    for (const other of p.alt ?? []) {
      assert.ok(other && other !== p.fr, `${p.id}: pointless alternative`);
      assert.match(other, /[.!?…]$/, `unfinished alternative: ${other}`);
    }
  }
});

test('ids are unique and derived from the French', () => {
  assert.equal(new Set(PHRASES.map((p) => p.id)).size, PHRASES.length);
  assert.equal(new Set(PHRASES.map((p) => p.en)).size, PHRASES.length, 'no phrase asked twice');
  for (const p of PHRASES) {
    assert.match(p.id, /^[a-z0-9-]+$/, p.id);
    assert.equal(PHRASE_BY_ID.get(p.id), p);
  }
});

test('the French is written with the same typography as the rest of the app', () => {
  for (const p of PHRASES) {
    for (const french_ of [p.fr, ...(p.alt ?? [])]) {
      assert.ok(!french_.includes("'"), `straight apostrophe: ${french_}`);
      // French puts a space before ? ! : ; and », and it has to be a
      // non-breaking one or a narrow screen will start a line with it.
      assert.ok(!/ [?!:;»]/.test(french_), `use a non-breaking space: ${french_}`);
    }
  }
});

test('every topic is worth choosing on its own', () => {
  for (const topic of TOPICS) {
    assert.ok(phrasesForTopics([topic]).length >= 10, `${topic} is thin`);
  }
  assert.equal(
    TOPICS.reduce((sum, t) => sum + phrasesForTopics([t]).length, 0),
    PHRASES.length,
    'every phrase is in exactly one topic',
  );
});

test('a phrase is asked English to French by default, since that is the useful way', () => {
  const ids = all();
  assert.equal(ids.length, cardsIn(PHRASES));
  // Not endsWith('r'): plenty of phrases slug to an id ending in one, bonsoir
  // among them. The way round lives in the mark after the id.
  const mark = (id) => id.split('|')[2] ?? '';
  assert.ok(ids.every((id) => !mark(id).endsWith('r')));
  assert.equal(french.parse(ids[0]).direction, 'phrase');
  assert.equal(settings({ study: 'phrases' }).direction, 'produce');

  // Hearing one said to you is the other half of a conversation.
  const back = all({ direction: 'recognise' });
  // "r" for a question, "ar" for the answer to one.
  assert.ok(back.every((id) => mark(id).endsWith('r')));
  assert.ok(back.some((id) => mark(id) === 'ar'), 'answers go both ways too');
  assert.equal(french.parse(back[0]).direction, 'phrase-meaning');

  const both = all({ direction: 'mix' });
  assert.equal(both.length, cardsIn(PHRASES) * 2);
  assert.equal(new Set(both).size, both.length);
  for (const id of both) assert.ok(french.parse(id), `unparseable: ${id}`);
});

test('topics narrow the deck, and conjugation settings do not touch it', () => {
  const shopping = all({ topics: ['Shopping'] });
  assert.equal(shopping.length, cardsIn(phrasesForTopics(['Shopping'])));
  assert.ok(shopping.length < cardsIn(PHRASES));
  assert.equal(
    all({ topics: ['Shopping'], tenses: ['present'], pronouns: [0], deck: 'core' }).length,
    shopping.length,
  );
  assert.equal(french.parse('phrase|not-a-phrase-at-all'), null);
});

test('phrases and expressions keep their own settings and their own tallies', () => {
  // Both are French, both are self-graded, but choosing Shopping should not
  // disturb which expression themes are on.
  const s = settings({ study: 'phrases', topics: ['Shopping'], themes: ['Feelings'] });
  assert.deepEqual(s.topics, ['Shopping']);
  assert.deepEqual(s.themes, ['Feelings']);

  const keys = ['conjugation', 'reading', 'expressions', 'phrases']
    .map((study) => french.keys({ study }).daily);
  assert.equal(new Set(keys).size, 4);
  for (const key of keys) assert.ok(french.storageKeys().includes(key), key);
});

test('the settings offered follow the way of studying', () => {
  const groups = (study) => french.filters(settings({ study })).map((f) => f.id);
  assert.deepEqual(groups('phrases'), ['study', 'topics', 'direction']);
  assert.deepEqual(groups('expressions'), ['study', 'themes']);

  // The direction control says what it means for a phrase rather than a verb.
  const direction = french.filters(settings({ study: 'phrases' })).find((f) => f.id === 'direction');
  assert.deepEqual(direction.options.map((o) => o.label), ['Say it in French', 'Say what it means', 'Mix both']);
  assert.equal(direction.options[0].hint, 'English → French');
});

test('a phrase is graded by you, not marked by the app', () => {
  // Three ways to say the same thing, and no honest way to mark between them.
  for (const id of all({ direction: 'mix' })) {
    const card = french.parse(id);
    assert.equal(french.typable(card), false, id);
    assert.equal(french.check('anything', card), null, id);
    // Nothing is held back behind the extra toggle either.
    assert.equal(french.extra(card), null, id);
  }
});

test('the answer gives the French, the alternatives and the trap', () => {
  const cost = french.parse('phrase|combien-ca-coute');
  const spec = french.answer(cost);
  assert.equal(spec.answer, 'Combien ça coûte ?');
  assert.match(spec.sub, /^or C’est combien \? · Ça coûte combien \?$/);

  // The other way round answers with the English.
  assert.equal(french.answer(french.parse('phrase|combien-ca-coute|r')).answer, 'How much does this cost?');

  // Where there is a trap, the note says so.
  assert.match(french.answer(french.parse('phrase|on-peut-avoir-la-carte')).note, /set meal/);
  assert.match(french.answer(french.parse('phrase|je-suis-desole')).note, /Désolée/);

  for (const p of PHRASES) {
    const answer = french.answer(french.parse(`phrase|${p.id}`));
    assert.equal(answer.answer, p.fr, p.id);
  }
});

test('each phrase describes itself for the recap', () => {
  for (const p of PHRASES) {
    assert.deepEqual(french.faces(french.parse(`phrase|${p.id}`)), { question: p.en, answer: p.fr });
    assert.deepEqual(french.faces(french.parse(`phrase|${p.id}|r`)), { question: p.fr, answer: p.en });
  }
});

test('a topic that no longer exists falls back rather than emptying the deck', () => {
  assert.deepEqual(settings({ topics: ['Astrophysics'] }).topics, french.defaults.topics);
  assert.deepEqual(settings({ topics: [] }).topics, french.defaults.topics);
  assert.deepEqual(settings({ topics: ['Problems'] }).topics, ['Problems']);
});

test('every phrase that is a question comes with an answer to it', () => {
  // Asking is only half of it: the half that happens at speed, in a shop,
  // with someone waiting, is the reply.
  for (const p of PHRASES) {
    const asked = p.fr.endsWith('?');
    assert.equal(Boolean(p.reply), asked, `${p.id}: ${asked ? 'no reply' : 'a reply but not a question'}`);
    if (!asked) continue;
    assert.ok(p.replyEn, `${p.id} has a reply with no English`);
    assert.match(p.reply, /[.!?…]$/, `unfinished reply: ${p.reply}`);
    assert.match(p.replyEn, /[.!?…]$/, `unfinished translation: ${p.replyEn}`);
    assert.ok(!p.reply.includes("'"), `straight apostrophe: ${p.reply}`);
    assert.ok(!/ [?!:;»]/.test(p.reply), `use a non-breaking space: ${p.reply}`);
    assert.notEqual(p.reply, p.fr, `${p.id} answers itself`);
  }
  assert.ok(PHRASES.filter((p) => p.reply).length > 40);
});

test('the reply is shown with the answer, both ways round', () => {
  const cost = french.answer(french.parse('phrase|combien-ca-coute'));
  assert.deepEqual(cost.reply, {
    text: 'Ça fait douze euros cinquante.',
    gloss: 'That’s twelve euros fifty.',
  });
  // The other direction wants it just as much.
  assert.deepEqual(french.answer(french.parse('phrase|combien-ca-coute|r')).reply, cost.reply);

  // A phrase that is not a question has nothing to come back at you.
  assert.equal(french.answer(french.parse('phrase|au-revoir')).reply, undefined);

  for (const p of PHRASES) {
    const spec = french.answer(french.parse(`phrase|${p.id}`));
    assert.equal(Boolean(spec.reply), Boolean(p.reply), p.id);
    if (spec.reply) assert.ok(spec.reply.text && spec.reply.gloss, p.id);
  }
});

test('the answer to a question is a card in its own right', () => {
  // "No thank you, I'm just looking" is the half you actually have to say.
  const reply = french.parse('phrase|je-peux-vous-aider|a');
  assert.equal(reply.side, 'reply');
  assert.equal(french.answer(reply).answer, 'Non merci, je regarde.');
  // Taken from the data rather than retyped: the space before the question
  // mark is a non-breaking one and would not survive being written out here.
  const asked = PHRASES.find((p) => p.id === 'je-peux-vous-aider');
  assert.equal(french.answer(reply).sub, `in reply to: ${asked.fr}`);
  assert.deepEqual(french.faces(reply), {
    question: 'No thank you, I’m just looking.',
    answer: 'Non merci, je regarde.',
  });

  globalThis.document = {
    createElement: () => ({ className: '', textContent: '' }),
    createTextNode: (value) => ({ textContent: value }),
  };
  assert.equal(french.prompt(reply).lead, 'How would you answer?');
  assert.equal(french.prompt(reply).nodes[0].textContent, 'No thank you, I’m just looking.');
  // And the other way round, it is a thing said to you.
  const heard = french.parse('phrase|je-peux-vous-aider|ar');
  assert.equal(heard.side, 'reply');
  assert.equal(french.prompt(heard).pill, 'The answer you get');
  assert.equal(french.prompt(heard).nodes[0].textContent, 'Non merci, je regarde.');
  assert.equal(french.answer(heard).answer, 'No thank you, I’m just looking.');
  delete globalThis.document;

  // A phrase with nothing to answer has no answer card.
  assert.equal(french.parse('phrase|au-revoir|a'), null);
  assert.ok(!all().includes('phrase|au-revoir|a'));
  assert.equal(french.typable(reply), false);
});
