import { VERBS, DECKS, verbsForDeck } from './verbs.js';
import {
  conjugate, answerFor, attachPronoun,
  TENSES, TENSE_IDS, PRONOUN_LABELS, PRONOUNS, tenseLabel,
} from './conjugator.js';
import { GRADES, newCardState, review, isDue, formatDue, previewInterval } from './scheduler.js';
import { checkAnswer, checkRecognition, verbsMatching } from './answer.js';

const SETTINGS_KEY = 'conjugaison.settings.v1';
const PROGRESS_KEY = 'conjugaison.progress.v1';
const NEW_PER_SESSION = 20;

const $ = (id) => document.getElementById(id);

const DEFAULT_SETTINGS = {
  deck: 'core',
  tenses: ['present', 'passe-compose', 'futur'],
  pronouns: [0, 1, 2, 3, 4, 5],
  direction: 'produce', // 'produce' | 'recognise' | 'mix'
  mode: 'reveal',       // 'reveal' | 'type'
};

const DIRECTIONS = [
  ['produce', 'Give the form', 'parler → je parle'],
  ['recognise', 'Name the verb', "j'étais → être"],
  ['mix', 'Mix both', 'alternates between the two'],
];

// ---------------------------------------------------------------- storage

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : { ...fallback };
  } catch {
    return { ...fallback };
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private browsing, a full quota — not worth interrupting a review for */
  }
}

let settings = load(SETTINGS_KEY, DEFAULT_SETTINGS);
let progress = load(PROGRESS_KEY, {});

// Guard against a stored deck or tense that no longer exists.
if (!DECKS.some((d) => d.id === settings.deck)) settings.deck = DEFAULT_SETTINGS.deck;
settings.tenses = settings.tenses.filter((t) => TENSE_IDS.includes(t));
if (!settings.tenses.length) settings.tenses = [...DEFAULT_SETTINGS.tenses];
settings.pronouns = settings.pronouns.filter((p) => p >= 0 && p < 6);
if (!settings.pronouns.length) settings.pronouns = [...DEFAULT_SETTINGS.pronouns];
if (!DIRECTIONS.some(([id]) => id === settings.direction)) settings.direction = DEFAULT_SETTINGS.direction;

// ------------------------------------------------------------------ cards

// A forward card keeps its three-part id, so review history recorded before
// reverse cards existed still matches; reverse cards get a "|r" suffix and
// are scheduled independently.
const cardId = (inf, tense, person, direction) =>
  `${inf}|${tense}|${person}${direction === 'recognise' ? '|r' : ''}`;

function parseCard(id) {
  const [inf, tense, person, reverse] = id.split('|');
  return {
    verb: VERBS.find((v) => v.inf === inf),
    tense,
    person: Number(person),
    direction: reverse === 'r' ? 'recognise' : 'produce',
  };
}

function directions() {
  return settings.direction === 'mix' ? ['produce', 'recognise'] : [settings.direction];
}

function pool() {
  const ids = [];
  for (const verb of verbsForDeck(settings.deck)) {
    for (const tense of settings.tenses) {
      for (const person of settings.pronouns) {
        for (const direction of directions()) ids.push(cardId(verb.inf, tense, person, direction));
      }
    }
  }
  return ids;
}

function shuffle(items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ---------------------------------------------------------------- session

let queue = [];
let current = null;
let answered = false;
let lastVerdict = null;
const session = { seen: 0, correct: 0 };
let forceStudy = false;

function buildQueue() {
  const now = Date.now();
  const all = pool();
  const due = all.filter((id) => progress[id] && isDue(progress[id], now));
  const fresh = all.filter((id) => !progress[id]);

  if (forceStudy && !due.length && !fresh.length) {
    // Nothing is due and nothing is new: practise the whole deck anyway,
    // soonest-due first, without touching the schedule's shape.
    return shuffle(all).slice(0, 40);
  }
  return shuffle([...due, ...shuffle(fresh).slice(0, NEW_PER_SESSION)]);
}

function nextDueAt() {
  const times = pool().map((id) => progress[id]?.due).filter((t) => typeof t === 'number');
  return times.length ? Math.min(...times) : null;
}

function remaining() {
  return queue.length;
}

// -------------------------------------------------------------- rendering

function renderCard() {
  const card = $('card');
  const empty = $('empty');

  if (!queue.length) queue = buildQueue();

  if (!queue.length) {
    card.hidden = true;
    empty.hidden = false;
    const next = nextDueAt();
    $('empty-title').textContent = 'All caught up';
    $('empty-body').textContent = next
      ? `Nothing is due right now. The next card is back ${formatDue(next)}.`
      : 'Pick a deck or a tense in Settings to start reviewing.';
    updateStats();
    return;
  }

  empty.hidden = true;
  card.hidden = false;
  answered = false;
  lastVerdict = null;
  current = parseCard(queue[0]);

  const { verb, tense, person, direction } = current;
  const reverse = direction === 'recognise';
  const lead = $('prompt-lead');
  lead.textContent = '';

  if (reverse) {
    // Naming the tense would give half the answer away, so a reverse card
    // shows the bare form and nothing else.
    $('card-tense').textContent = 'Which verb?';
    $('card-gloss').hidden = true;
    lead.textContent = 'Which verb is this?';
    $('prompt-pronoun').hidden = true;
    $('prompt-sep').hidden = true;
    $('prompt-inf').textContent = answerFor(verb, tense, person);
  } else {
    $('card-tense').textContent = tenseLabel(tense);
    $('card-gloss').hidden = false;
    $('card-gloss').textContent = verb.en;
    const strong = document.createElement('strong');
    strong.id = 'prompt-tense';
    strong.textContent = tenseLabel(tense).toLowerCase();
    lead.append('What is the ', strong, ' of');
    $('prompt-pronoun').hidden = false;
    $('prompt-pronoun').textContent = PRONOUN_LABELS[person];
    $('prompt-sep').hidden = false;
    $('prompt-inf').textContent = verb.inf;
  }

  const typing = settings.mode === 'type';
  $('answer-form').hidden = !typing;
  $('reveal').hidden = typing;
  $('answer-input').placeholder = reverse ? 'infinitive…' : 'type the form…';
  $('answer-sub').hidden = true;
  $('result').hidden = true;
  $('grades').hidden = true;
  $('paradigm').hidden = true;
  $('table-toggle').setAttribute('aria-expanded', 'false');
  $('table-toggle').textContent = 'Show the full table';
  $('answer-note').hidden = true;
  $('answer-input').value = '';

  if (typing) $('answer-input').focus();
  updateStats();
}

function renderResult(verdict) {
  if (answered) return;
  answered = true;
  lastVerdict = verdict;

  const { verb, tense, person } = current;
  const result = $('result');
  const verdictEl = $('verdict');

  if (verdict === null) {
    verdictEl.textContent = '';
    verdictEl.className = 'verdict';
  } else {
    verdictEl.textContent = { correct: 'Correct', close: 'Almost — check the accents', wrong: 'Not quite' }[verdict];
    verdictEl.className = `verdict ${verdict}`;
  }

  const sub = $('answer-sub');
  if (current.direction === 'recognise') {
    $('answer').textContent = verb.inf;
    // "je suis" is also suivre — say so rather than looking arbitrary.
    const others = verbsMatching(answerFor(verb, tense, person), tense, person)
      .filter((inf) => inf !== verb.inf);
    sub.textContent = `${tenseLabel(tense)} · ${verb.en}`
      + (others.length ? ` — also ${others.join(', ')}` : '');
    sub.hidden = false;
  } else {
    $('answer').textContent = answerFor(verb, tense, person);
    sub.hidden = true;
  }

  const note = $('answer-note');
  const typed = $('answer-input').value.trim();
  // Seeing your own spelling next to the right one is the whole lesson when
  // the only thing you missed was an accent.
  if (typed && (verdict === 'wrong' || verdict === 'close')) {
    note.innerHTML = 'you wrote <s></s>';
    note.querySelector('s').textContent = typed;
    note.hidden = false;
  } else {
    note.textContent = '';
    note.hidden = true;
  }

  // Once the answer is out, grading is the only thing left to do.
  $('reveal').hidden = true;
  $('answer-form').hidden = true;
  result.hidden = false;
  renderGrades(verdict);
  $('grades').hidden = false;
  updateStats();
}

function renderGrades(verdict) {
  const box = $('grades');
  const state = progress[queue[0]] ?? newCardState();
  const suggested = { correct: 2, close: 1, wrong: 0 }[verdict] ?? null;

  box.innerHTML = '';
  for (const grade of GRADES) {
    const button = document.createElement('button');
    button.className = `grade${grade.id === suggested ? ' suggested' : ''}`;
    button.type = 'button';
    button.innerHTML = '<b></b><span></span>';
    button.querySelector('b').textContent = grade.label;
    button.querySelector('span').textContent = previewInterval(state, grade.id);
    button.title = grade.hint;
    button.addEventListener('click', () => grade_(grade.id));
    box.append(button);
  }
}

function renderParadigm() {
  const { verb, tense, person } = current;
  const forms = conjugate(verb, tense);
  const table = $('paradigm');
  table.innerHTML = '';
  forms.forEach((form, i) => {
    const row = table.insertRow();
    if (i === person) row.className = 'current';
    row.insertCell().textContent = PRONOUN_LABELS[i];
    row.insertCell().textContent = attachPronoun(form, i, tense);
  });
}

function updateStats() {
  $('stat-seen').textContent = session.seen;
  $('stat-correct').textContent = session.seen ? `${session.correct}/${session.seen}` : '0';
  $('stat-due').textContent = remaining();
}

// ----------------------------------------------------------------- actions

function grade_(gradeId) {
  if (!answered || !current) return;
  const id = queue.shift();
  progress[id] = review(progress[id] ?? newCardState(), gradeId);
  save(PROGRESS_KEY, progress);

  // In typing mode the answer itself says whether you were right; in reveal
  // mode the only evidence is how you graded yourself.
  session.seen += 1;
  if (lastVerdict ? lastVerdict === 'correct' : gradeId >= 2) session.correct += 1;

  // "Again" means it should come back before the session ends, but not
  // immediately — a couple of cards of separation is enough to make it a
  // real recall attempt rather than an echo.
  if (gradeId === 0) queue.splice(Math.min(queue.length, 3), 0, id);

  renderCard();
}

function reveal() {
  if (answered) return;
  if (settings.mode !== 'type') return renderResult(null);
  const check = current.direction === 'recognise' ? checkRecognition : checkAnswer;
  renderResult(check($('answer-input').value, current));
}

// ---------------------------------------------------------------- settings

function option({ type, name, label, hint, checked, onChange }) {
  const wrap = document.createElement('label');
  wrap.className = 'option';
  const input = document.createElement('input');
  input.type = type;
  input.name = name;
  input.checked = checked;
  input.addEventListener('change', () => onChange(input.checked));
  const text = document.createElement('span');
  text.className = 'option-label';
  text.textContent = label;
  wrap.append(input, text);
  if (hint) {
    const hintEl = document.createElement('span');
    hintEl.className = 'option-hint';
    hintEl.textContent = hint;
    wrap.append(hintEl);
  }
  return wrap;
}

/** Keep at least one box ticked, so the deck can never become empty. */
function toggleIn(list, value, on) {
  const next = on ? [...new Set([...list, value])] : list.filter((v) => v !== value);
  return next.length ? next : list;
}

function renderSettings() {
  const decks = $('deck-options');
  decks.innerHTML = '';
  for (const deck of DECKS) {
    const count = verbsForDeck(deck.id).length;
    decks.append(option({
      type: 'radio', name: 'deck', label: deck.label, hint: `${count} verbs`,
      checked: settings.deck === deck.id,
      onChange: (on) => { if (on) { settings.deck = deck.id; commitSettings(); } },
    }));
  }

  const tenses = $('tense-options');
  tenses.innerHTML = '';
  for (const tense of TENSES) {
    tenses.append(option({
      type: 'checkbox', name: 'tense', label: tense.label, hint: tense.hint,
      checked: settings.tenses.includes(tense.id),
      onChange: (on) => { settings.tenses = toggleIn(settings.tenses, tense.id, on); commitSettings(); },
    }));
  }

  const pronouns = $('pronoun-options');
  pronouns.innerHTML = '';
  PRONOUN_LABELS.forEach((label, i) => {
    pronouns.append(option({
      type: 'checkbox', name: 'pronoun', label,
      checked: settings.pronouns.includes(i),
      onChange: (on) => { settings.pronouns = toggleIn(settings.pronouns, i, on); commitSettings(); },
    }));
  });

  const dirs = $('direction-options');
  dirs.innerHTML = '';
  for (const [id, label, hint] of DIRECTIONS) {
    dirs.append(option({
      type: 'radio', name: 'direction', label, hint,
      checked: settings.direction === id,
      onChange: (on) => { if (on) { settings.direction = id; commitSettings(); } },
    }));
  }

  const modes = $('mode-options');
  modes.innerHTML = '';
  for (const [id, label, hint] of [
    ['reveal', 'Think, then reveal', 'Fastest'],
    ['type', 'Type the answer', 'Catches spelling'],
  ]) {
    modes.append(option({
      type: 'radio', name: 'mode', label, hint,
      checked: settings.mode === id,
      onChange: (on) => { if (on) { settings.mode = id; commitSettings(); } },
    }));
  }

  const studied = Object.keys(progress).length;
  $('progress-summary').textContent = studied
    ? `${studied} card${studied === 1 ? '' : 's'} in your review history.`
    : 'No progress saved yet.';
}

function commitSettings() {
  save(SETTINGS_KEY, settings);
  forceStudy = false;
  queue = [];
  renderSettings();
  renderCard();
}

function openSettings(open) {
  $('settings').hidden = !open;
  $('settings-backdrop').hidden = !open;
  $('settings-toggle').setAttribute('aria-expanded', String(open));
  if (open) renderSettings();
}

// ------------------------------------------------------------------ wiring

function buildAccentBar() {
  const bar = $('accents');
  for (const char of ['é', 'è', 'ê', 'à', 'â', 'î', 'ô', 'û', 'ç']) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = char;
    button.tabIndex = -1;
    button.addEventListener('click', () => {
      const input = $('answer-input');
      const { selectionStart: start, selectionEnd: end, value } = input;
      input.value = value.slice(0, start) + char + value.slice(end);
      input.focus();
      input.setSelectionRange(start + 1, start + 1);
    });
    bar.append(button);
  }
}

$('reveal').addEventListener('click', reveal);
$('answer-form').addEventListener('submit', (event) => { event.preventDefault(); reveal(); });

$('table-toggle').addEventListener('click', () => {
  const table = $('paradigm');
  const showing = table.hidden;
  if (showing) renderParadigm();
  table.hidden = !showing;
  $('table-toggle').setAttribute('aria-expanded', String(showing));
  $('table-toggle').textContent = showing ? 'Hide the full table' : 'Show the full table';
});

$('study-anyway').addEventListener('click', () => {
  forceStudy = true;
  queue = buildQueue();
  renderCard();
});

$('settings-toggle').addEventListener('click', () => openSettings($('settings').hidden));
$('settings-close').addEventListener('click', () => openSettings(false));
$('settings-backdrop').addEventListener('click', () => openSettings(false));

$('reset').addEventListener('click', () => {
  if (!confirm('Delete your review history and start over?')) return;
  progress = {};
  save(PROGRESS_KEY, progress);
  session.seen = 0;
  session.correct = 0;
  commitSettings();
});

document.addEventListener('keydown', (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  if (!$('settings').hidden) {
    if (event.key === 'Escape') openSettings(false);
    return;
  }

  const typing = document.activeElement === $('answer-input');

  if (!typing && (event.key.toLowerCase() === 's')) {
    event.preventDefault();
    openSettings(true);
    return;
  }

  if (answered && ['1', '2', '3', '4'].includes(event.key)) {
    event.preventDefault();
    grade_(Number(event.key) - 1);
    return;
  }

  // Enter accepts the suggested grade, so a correct typed answer is two keys.
  if (answered && event.key === 'Enter') {
    event.preventDefault();
    grade_({ correct: 2, close: 1, wrong: 0 }[lastVerdict] ?? 2);
    return;
  }

  if (!answered && (event.key === ' ' || (event.key === 'Enter' && !typing))) {
    event.preventDefault();
    reveal();
  }
});

buildAccentBar();
renderSettings();
renderCard();

// Offline support. Registration is best-effort: the app works without it,
// and it cannot be registered from file:// anyway.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
