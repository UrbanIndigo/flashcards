/**
 * Saying the French out loud, using a voice the phone already has.
 *
 * No audio ships with the app. Every phone has French voices installed at
 * the operating system level — Thomas and Amélie on iOS, Google's on
 * Android — and the browser will lend them to a page for nothing. That
 * matters here more than the quality does: a thousand recorded sentences
 * would be twenty megabytes against the seven hundred kilobytes the whole
 * app currently precaches, and would break the one thing that makes it
 * useful on the Tube.
 *
 * Two things the browsers make awkward, both handled below. The voice list
 * arrives asynchronously, so the first look is usually empty and a
 * `voiceschanged` event follows. And Safari will not speak until the page
 * has seen a tap, which is why the button is the main way in and speaking
 * on reveal is an option rather than the only route.
 *
 * A phone with no French voice installed gets no button at all. An English
 * voice reading "je suis en retard" is worse than silence.
 */

const FRENCH = /^fr($|[-_])/i;

let voice = null;

const engine = () => (typeof speechSynthesis === 'undefined' ? null : speechSynthesis);

function choose() {
  const speech = engine();
  const voices = speech?.getVoices?.() ?? [];
  // A local voice works on a plane; a network one does not.
  voice = voices.find((v) => FRENCH.test(v.lang) && v.localService)
    ?? voices.find((v) => FRENCH.test(v.lang))
    ?? null;
  return voice;
}

/** Whether this phone can say anything in French at all. */
export const canSpeak = () => Boolean(voice);

/**
 * Starts looking for a voice, and calls back if one turns up later — the
 * list is usually empty on the first frame.
 */
export function listen(onReady) {
  const speech = engine();
  if (!speech) return;
  choose();
  speech.addEventListener?.('voiceschanged', () => {
    const had = canSpeak();
    choose();
    if (canSpeak() !== had) onReady?.();
  });
}

export function say(text) {
  const speech = engine();
  if (!speech || !voice || !text) return;
  // Whatever was being said belongs to the card you have just left.
  speech.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  // A shade under normal: these are sentences being studied, not read out.
  utterance.rate = 0.92;
  speech.speak(utterance);
}

export function hush() {
  engine()?.cancel();
}
