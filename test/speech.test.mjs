import test from 'node:test';
import assert from 'node:assert/strict';

import { french } from '../js/subjects/french.js';

const settings = (over = {}) => {
  const s = { ...french.defaults, ...over };
  french.normalise(s);
  return s;
};

test('every French card knows what to say out loud', () => {
  const studies = ['conjugation', 'reading', 'expressions', 'phrases', 'gaps', 'everyday', 'messages'];
  for (const study of studies) {
    const ids = french.cardIds(settings({ study, direction: 'mix' }));
    for (const id of ids.slice(0, 40)) {
      const spec = french.speech(french.parse(id));
      assert.ok(spec?.text?.trim(), `${id} has nothing to say`);
      assert.equal(typeof spec.withPrompt, 'boolean', id);
    }
  }
});

test('the voice never reads out an answer you have not given yet', () => {
  // withPrompt means the French is already on screen before you answer. It
  // must be false wherever producing the French is the question, or the
  // speaker button on the prompt would simply tell you.
  const hidden = [
    'parler|present|0',                 // give the form
    'phrase|combien-ca-coute',          // say it in French
    'day|ce-doit-etre-une-erreur',      // say it in French
    'gap|j-en-ai-trois-en',             // the gap filled in is the answer
  ];
  for (const id of hidden) assert.equal(french.speech(french.parse(id)).withPrompt, false, id);

  const shown = [
    'parler|present|0|r',               // name the verb and tense
    'phrase|combien-ca-coute|r',        // what does it mean
    'day|ce-doit-etre-une-erreur|r',
    'msg|t-as-vu-l-heure',              // the message is the question
    'expr|avoir-le-cafard',             // the sentence is the question
  ];
  for (const id of shown) assert.equal(french.speech(french.parse(id)).withPrompt, true, id);
});

test('what is spoken is the French, in full', () => {
  assert.equal(french.speech(french.parse('parler|present|0')).text, 'je parle');
  assert.equal(
    french.speech(french.parse('day|ce-doit-etre-une-erreur')).text,
    'Ce doit être une erreur.',
  );
  // A gap card says the sentence with the missing word put back, not the
  // blank.
  const gap = french.speech(french.parse('gap|j-en-ai-trois-en'));
  assert.equal(gap.text, 'J’en ai trois.');
  assert.ok(!gap.text.includes('_'), 'the blank is not spoken');

  // A message is spoken as it would be said: nobody pronounces "tkt".
  const message = french.speech(french.parse('msg|tkt-c-est-bon'));
  assert.equal(message.text, 'Ne t’inquiète pas, c’est bon.');

  // A reply card says the reply, not the question it answers.
  assert.equal(
    french.speech(french.parse('phrase|je-peux-vous-aider|a')).text,
    'Non merci, je regarde.',
  );
});

test('a subject with nothing to say says nothing', async () => {
  const { geography } = await import('../js/subjects/geography.js');
  assert.equal(geography.speech, undefined, 'the app asks, and geography does not answer');
});

test('a card can be heard only when the voice says the whole of it', () => {
  const studies = ['conjugation', 'reading', 'expressions', 'phrases', 'gaps', 'everyday', 'messages'];
  for (const study of studies) {
    const ids = french.cardIds(settings({ study, direction: 'mix' }));
    for (const id of ids.slice(0, 80)) {
      const card = french.parse(id);
      if (!french.hearable(card)) continue;
      const spoken = french.speech(card);
      // Nothing is asked about that the voice leaves out, and nothing is
      // spoken that you would not have been shown.
      assert.equal(spoken.withPrompt, true, id);
      assert.equal(french.faces(card).question, spoken.text, id);
    }
  }
});

test('what can be studied by ear, and what cannot', () => {
  const byEar = [
    'parler|present|0|r',               // hear a form, name the verb and tense
    'phrase|combien-ca-coute|r',        // hear it, say what it means
    'day|ce-doit-etre-une-erreur|r',
  ];
  for (const id of byEar) assert.equal(french.hearable(french.parse(id)), true, id);

  const notByEar = [
    'parler|present|0',                 // playing it would be the answer
    'phrase|combien-ca-coute',
    'day|ce-doit-etre-une-erreur',
    'gap|j-en-ai-trois-en',             // you cannot hear a blank
    'expr|avoir-le-cafard',             // nor which words are marked
    'msg|tkt-c-est-bon',                // the voice tidies up the spelling
  ];
  for (const id of notByEar) assert.equal(french.hearable(french.parse(id)), false, id);
});

test('a reading card is not heard: the mark is the question', () => {
  const [id] = french.cardIds(settings({ study: 'reading' }));
  const card = french.parse(id);
  assert.equal(french.speech(card).withPrompt, true, 'the sentence is on screen');
  assert.equal(french.hearable(card), false, 'but which verb is marked is not audible');
});

test('turning listening on leaves a deck with something in it', () => {
  const s = settings({ study: 'phrases', direction: 'produce' });
  assert.equal(french.cardIds(s).filter((id) => french.hearable(french.parse(id))).length, 0);

  french.forListening(s);
  assert.equal(s.direction, 'recognise');
  assert.ok(french.cardIds(s).every((id) => french.hearable(french.parse(id))));

  // A direction that already has something to hear is left alone.
  const mixed = settings({ study: 'phrases', direction: 'mix' });
  french.forListening(mixed);
  assert.equal(mixed.direction, 'mix');
});
