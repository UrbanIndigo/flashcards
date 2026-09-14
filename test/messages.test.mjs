import test from 'node:test';
import assert from 'node:assert/strict';

import { MESSAGES, MESSAGE_BY_ID, TAGS, messagesForTags } from '../js/messages.js';
import { french } from '../js/subjects/french.js';

const settings = (over = {}) => {
  const s = { ...french.defaults, ...over };
  french.normalise(s);
  return s;
};

test('every message has the tidy version and the reason it was hard', () => {
  assert.ok(MESSAGES.length >= 50, `only ${MESSAGES.length}`);
  for (const m of MESSAGES) {
    assert.ok(m.msg && m.en && m.tidy && m.note, m.id);
    assert.ok(TAGS.includes(m.tag), `${m.id}: ${m.tag}`);
    assert.notEqual(m.tidy, m.msg, `${m.id} is already tidy, so it teaches nothing`);
    // The tidy version is the same sentence written properly, so it must end
    // like a sentence even though the message need not.
    assert.match(m.tidy, /[.!?…]$/, `unfinished: ${m.tidy}`);
    assert.match(m.en, /[.!?…]$/, `unfinished: ${m.en}`);
    assert.match(m.note, /[.!?]$/, `unfinished note: ${m.note}`);
    assert.ok(!/[*_`]/.test(m.note), `markup in a note: ${m.note}`);
  }
});

test('the messages are written the way messages are written', () => {
  for (const m of MESSAGES) {
    assert.ok(!m.msg.includes("'"), `straight apostrophe: ${m.msg}`);
    assert.ok(!m.tidy.includes("'"), `straight apostrophe: ${m.tidy}`);
    assert.ok(!/ [?!:;»]/.test(m.tidy), `use a non-breaking space: ${m.tidy}`);
  }
  // Most of them should be missing their closing punctuation, because that
  // is the point of the deck.
  const bare = MESSAGES.filter((m) => !/[.!?]$/.test(m.msg));
  assert.ok(bare.length > MESSAGES.length / 2, `only ${bare.length} look like real messages`);
});

test('ids are unique and derived from the message', () => {
  assert.equal(new Set(MESSAGES.map((m) => m.id)).size, MESSAGES.length);
  assert.equal(new Set(MESSAGES.map((m) => m.msg)).size, MESSAGES.length);
  for (const m of MESSAGES) {
    assert.match(m.id, /^[a-z0-9-]+$/, m.id);
    assert.equal(MESSAGE_BY_ID.get(m.id), m);
  }
});

test('every tag has enough in it to be worth studying on its own', () => {
  for (const tag of TAGS) assert.ok(messagesForTags([tag]).length >= 8, `${tag} is thin`);
  assert.equal(
    TAGS.reduce((sum, t) => sum + messagesForTags([t]).length, 0),
    MESSAGES.length,
    'every message has exactly one tag',
  );
});

test('a message is asked one way round only, and graded by you', () => {
  const ids = french.cardIds(settings({ study: 'messages' }));
  assert.equal(ids.length, MESSAGES.length);
  for (const id of ids) assert.ok(french.parse(id), `unparseable: ${id}`);

  // Reading these is the skill. Nobody needs drilling in leaving out their
  // own commas, so there is no other direction and no direction control.
  assert.deepEqual(french.filters(settings({ study: 'messages' })).map((f) => f.id), ['study', 'tags']);
  const card = french.parse(ids[0]);
  assert.equal(french.typable(card), false);
  assert.equal(french.check('anything', card), null);
  assert.equal(french.extra(card), null);
  assert.equal(french.parse('msg|nothing-like-it'), null);
});

test('the answer shows the meaning, the sentence written properly, and why it was hard', () => {
  const card = french.parse('msg|mais-en-vrai-comme-tu-viens-de-lire-le-livre-le-film-va-te-decevoir');
  const spec = french.answer(card);
  assert.match(spec.answer, /since you’ve just read the book/);
  assert.match(spec.sub, /^Mais en vrai, comme tu viens de lire le livre, le film va te décevoir\.$/);
  assert.match(spec.note, /comme at the head of a sentence means since/);

  for (const m of MESSAGES) {
    const c = french.parse(`msg|${m.id}`);
    assert.equal(french.answer(c).answer, m.en, m.id);
    assert.equal(french.answer(c).sub, m.tidy, m.id);
    assert.deepEqual(french.faces(c), { question: m.msg, answer: m.en });
  }
});

test('the message is shown as it arrived, not cleaned up first', () => {
  globalThis.document = {
    createElement: () => ({ className: '', textContent: '' }),
    createTextNode: (value) => ({ textContent: value }),
  };
  const card = french.parse('msg|t-as-vu-l-heure');
  const prompt = french.prompt(card);
  assert.equal(prompt.pill, 'Message');
  assert.equal(prompt.prose, true, 'it reads as prose, not as a headline');
  assert.equal(prompt.nodes.map((n) => n.textContent).join(''), 't’as vu l’heure');
  delete globalThis.document;
});

test('seven ways of studying French, seven daily allowances', () => {
  const studies = ['conjugation', 'reading', 'expressions', 'phrases', 'gaps', 'everyday', 'messages'];
  const keys = studies.map((study) => french.keys({ study }).daily);
  assert.equal(new Set(keys).size, 7);
  for (const key of keys) assert.ok(french.storageKeys().includes(key), key);

  // Choosing a tag here leaves every other mode's settings alone.
  const s = settings({ study: 'messages', tags: ['Texting'], topics: ['Shopping'], bands: ['first'] });
  assert.deepEqual(s.tags, ['Texting']);
  assert.deepEqual(s.topics, ['Shopping']);
  assert.deepEqual(s.bands, ['first']);
  assert.deepEqual(settings({ tags: ['Hieroglyphs'] }).tags, french.defaults.tags);
});
