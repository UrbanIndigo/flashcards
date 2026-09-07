import { VERBS, DECKS, verbsForDeck } from './verbs.js';
import {
  conjugate, answerFor, attachPronoun,
  TENSES, TENSE_IDS, PRONOUN_LABELS, PRONOUNS, tenseLabel,
} from './conjugator.js';
import {
  GRADES, TIERS, newCardState, review, isDue, formatDue, tierOf,
} from './scheduler.js';
import { checkAnswer, checkRecognition, interpretationsOf } from './answer.js';
import {
  DAILY_GOALS, DEFAULT_DAILY_NEW, todayKey, rollOver, remainingNew, goalReached,
} from './daily.js';
import { rollLog, record, summarise, accuracy, MAX_LISTED } from './recap.js';
import { ruleFor } from './rules.js';
import { SENTENCES, WORKS } from './sentences.js';

const SETTINGS_KEY = 'conjugaison.settings.v1';
const PROGRESS_KEY = 'conjugaison.progress.v1';
const DAILY_KEY = 'conjugaison.daily.v1';
const LOG_KEY = 'conjugaison.log.v1';

const $ = (id) => document.getElementById(id);

const DEFAULT_SETTINGS = {
  deck: 'core',
  tenses: ['present', 'passe-compose', 'futur'],
  pronouns: [0, 1, 2, 3, 4, 5],
  direction: 'produce', // 'produce' | 'recognise' | 'mix'
  mode: 'reveal',       // 'reveal' | 'type'
  dailyNew: DEFAULT_DAILY_NEW,
};

const DIRECTIONS = [
  ['produce', 'Give the form', 'parler → je parle'],
  ['recognise', 'Name the verb and tense', "j'étais → être, imparfait"],
  ['reading', 'In a sentence', 'Dumas, Hugo, Sue'],
  ['mix', 'Mix both', 'alternates between the first two'],
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
let daily = rollOver(load(DAILY_KEY, {}), todayKey(), settings.dailyNew);
let log = rollLog(load(LOG_KEY, {}), todayKey());

// Guard against a stored deck or tense that no longer exists.
if (!DECKS.some((d) => d.id === settings.deck)) settings.deck = DEFAULT_SETTINGS.deck;
settings.tenses = settings.tenses.filter((t) => TENSE_IDS.includes(t));
if (!settings.tenses.length) settings.tenses = [...DEFAULT_SETTINGS.tenses];
settings.pronouns = settings.pronouns.filter((p) => p >= 0 && p < 6);
if (!settings.pronouns.length) settings.pronouns = [...DEFAULT_SETTINGS.pronouns];
if (!DIRECTIONS.some(([id]) => id === settings.direction)) settings.direction = DEFAULT_SETTINGS.direction;
if (!DAILY_GOALS.includes(settings.dailyNew)) settings.dailyNew = DEFAULT_SETTINGS.dailyNew;

// ------------------------------------------------------------------ cards

// A forward card keeps its three-part id, so review history recorded before
// reverse cards existed still matches; reverse cards get a "|r" suffix and
// are scheduled independently.
const SENTENCE_BY_ID = new Map(SENTENCES.map((sentence) => [sentence.id, sentence]));

const cardId = (inf, tense, person, direction) =>
  `${inf}|${tense}|${person}${direction === 'recognise' ? '|r' : ''}`;

function parseCard(id) {
  if (id.startsWith('sentence|')) {
    const sentence = SENTENCE_BY_ID.get(id.slice('sentence|'.length));
    if (!sentence) return { verb: undefined };
    return {
      verb: VERBS.find((v) => v.inf === sentence.inf),
      tense: sentence.tense,
      person: sentence.person,
      direction: 'reading',
      sentence,
    };
  }
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
  if (settings.direction === 'reading') {
    // Sentence cards are not verb x tense x pronoun combinations, so the
    // pronoun filter has nothing to say about them; deck and tense still do.
    const inDeck = new Set(verbsForDeck(settings.deck).map((v) => v.inf));
    for (const sentence of SENTENCES) {
      if (settings.tenses.includes(sentence.tense) && inDeck.has(sentence.inf)) {
        ids.push(`sentence|${sentence.id}`);
      }
    }
    return ids;
  }
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

function unseen() {
  return pool().filter((id) => !progress[id]);
}

function buildQueue() {
  daily = rollOver(daily, todayKey(), settings.dailyNew);
  const now = Date.now();
  const all = pool();
  const due = all.filter((id) => progress[id] && isDue(progress[id], now));
  // Reviews always come through; only new cards are rationed.
  const fresh = shuffle(unseen()).slice(0, remainingNew(daily));

  if (forceStudy && !due.length && !fresh.length) {
    // Nothing due and nothing new left in the deck: practise it anyway,
    // without touching the schedule's shape.
    return shuffle(all).slice(0, 40);
  }
  return shuffle([...due, ...fresh]);
}

function nextDueAt() {
  const times = pool().map((id) => progress[id]?.due).filter((t) => typeof t === 'number');
  return times.length ? Math.min(...times) : null;
}

function newTodayLabel() {
  return `${daily.introduced}/${daily.allowance}`;
}

// -------------------------------------------------------------- rendering

function renderCard() {
  const card = $('card');
  const empty = $('empty');

  if (!queue.length) queue = buildQueue();

  if (!queue.length) {
    card.hidden = true;
    empty.hidden = false;
    renderEmpty();
    updateStats();
    return;
  }

  empty.hidden = true;
  card.hidden = false;
  answered = false;
  lastVerdict = null;
  current = parseCard(queue[0]);

  const { verb, tense, person, direction } = current;
  const reverse = direction !== 'produce';
  const lead = $('prompt-lead');
  lead.textContent = '';
  $('prompt-main').hidden = direction === 'reading';
  $('prompt-sentence').hidden = direction !== 'reading';

  if (direction === 'reading') {
    const { text, start, end } = current.sentence;
    $('card-tense').textContent = 'In a sentence';
    $('card-gloss').hidden = true;
    lead.textContent = 'Which verb is this, and which tense?';
    const target = document.createElement('mark');
    target.textContent = text.slice(start, end);
    $('prompt-sentence').replaceChildren(text.slice(0, start), target, text.slice(end));
  } else if (reverse) {
    // Naming the tense would give half the answer away, so a reverse card
    // shows the bare form and nothing else.
    $('card-tense').textContent = 'Verb and tense?';
    $('card-gloss').hidden = true;
    lead.textContent = 'Which verb is this, and which tense?';
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
  $('answer-input').placeholder = reverse ? 'verb and tense…' : 'type the form…';
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

/**
 * Two different endings: you have hit the day's target and could choose to
 * go on, or the deck genuinely has nothing left to show you.
 */
/** What a card asks and what it answers, whichever way round it runs. */
function cardFaces({ verb, tense, person, direction, sentence }) {
  const solution = answerFor(verb, tense, person);
  if (direction === 'reading') {
    return {
      question: sentence.text.slice(sentence.start, sentence.end),
      answer: `${verb.inf} · ${tenseLabel(tense).toLowerCase()}`,
    };
  }
  if (direction === 'recognise') return { question: solution, answer: verb.inf };
  return {
    question: `${verb.inf} · ${tenseLabel(tense).toLowerCase()} · ${PRONOUN_LABELS[person]}`,
    answer: solution,
  };
}

function renderRecap() {
  const summary = summarise(log);
  const box = $('recap');
  box.hidden = summary.answered === 0;
  if (box.hidden) return;

  const parts = [
    `${summary.answered} answered`,
    `${summary.right} right (${accuracy(summary)}%)`,
    `${daily.introduced} new`,
  ];
  $('recap-stats').textContent = parts.join(' · ');

  const list = $('recap-list');
  list.innerHTML = '';
  $('recap-title').hidden = summary.missed.length === 0;

  for (const { id, times } of summary.missed.slice(0, MAX_LISTED)) {
    const card = parseCard(id);
    // A deck or tense may have been switched off since; skip what we cannot
    // describe rather than showing a broken row.
    if (!card.verb) continue;
    const { question, answer } = cardFaces(card);
    const row = list.insertRow();
    const asked = row.insertCell();
    asked.textContent = question;
    if (times > 1) {
      const badge = document.createElement('span');
      badge.className = 'times';
      badge.textContent = ` ×${times}`;
      asked.append(badge);
    }
    row.insertCell().textContent = answer;
  }

  const hidden = Math.max(0, summary.missed.length - MAX_LISTED);
  $('recap-more').hidden = hidden === 0;
  $('recap-more').textContent = `and ${hidden} more`;
}

function renderEmpty() {
  const next = nextDueAt();
  const stillNew = unseen().length;
  const hitGoal = goalReached(daily) && stillNew > 0;

  $('add-more').hidden = !hitGoal;
  $('study-anyway').hidden = hitGoal;
  renderRecap();

  if (hitGoal) {
    $('empty-title').textContent = `That is your ${daily.allowance} for today`;
    const dueLine = next && next > Date.now()
      ? ` Your reviews are done too — the next one is back ${formatDue(next)}.`
      : '';
    $('empty-body').textContent =
      `${daily.introduced} new cards done, and ${stillNew} still waiting in this deck.${dueLine}`
      + ' Add more only if you actually want to.';
    return;
  }

  $('empty-title').textContent = 'All caught up';
  $('empty-body').textContent = next
    ? `Nothing is due right now. The next card is back ${formatDue(next)}.`
    : 'Pick a deck or a tense in Settings to start reviewing.';
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
    verdictEl.textContent = verdict.message;
    verdictEl.className = `verdict ${verdict.level}`;
  }

  const sub = $('answer-sub');
  const source = $('answer-source');
  source.hidden = true;

  if (current.direction === 'reading') {
    const { work, chapter } = current.sentence;
    $('answer').textContent = verb.inf;
    sub.textContent = `${tenseLabel(tense)} · ${verb.en}`;
    sub.hidden = false;
    const { title, author } = WORKS[work];
    source.textContent = `${title}${chapter ? `, ch. ${chapter}` : ''} — ${author}`;
    source.hidden = false;
  } else if (current.direction === 'recognise') {
    $('answer').textContent = verb.inf;
    // "je suis" is also suivre; "je finis" is also a passé simple. Naming the
    // other readings is the point, not a footnote — it is what makes a form
    // ambiguous on the page of a book.
    const others = interpretationsOf(answerFor(verb, tense, person), person)
      .filter((o) => !(o.inf === verb.inf && o.tense === tense))
      .map((o) => (o.inf === verb.inf
        ? tenseLabel(o.tense).toLowerCase()
        : `${o.inf} (${tenseLabel(o.tense).toLowerCase()})`));
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
  if (typed && verdict && verdict.level !== 'correct') {
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
  // Why the answer is what it is — the pattern is the transferable part.
  $('rule').textContent = ruleFor(verb, tense, person);

  result.hidden = false;
  renderGrades(verdict);
  $('grades').hidden = false;
  updateStats();
}

function renderGrades(verdict) {
  const box = $('grades');
  // An accent slip is still the wrong form, so it suggests Again rather than
  // waving it through.
  const suggested = { correct: 1, close: 0, wrong: 0 }[verdict?.level] ?? null;

  box.innerHTML = '';
  for (const grade of GRADES) {
    const button = document.createElement('button');
    button.className = `grade grade-${grade.tone}${grade.id === suggested ? ' suggested' : ''}`;
    button.type = 'button';
    button.textContent = grade.label;
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

// ---------------------------------------------------------- progress bar

const segments = {};
const legendCounts = {};

function buildProgressBar() {
  for (const tier of TIERS) {
    const seg = document.createElement('span');
    seg.className = `seg seg-${tier.id}`;
    $('bar').append(seg);
    segments[tier.id] = seg;

    const item = document.createElement('li');
    const dot = document.createElement('span');
    dot.className = `dot dot-${tier.id}`;
    const label = document.createElement('span');
    label.textContent = tier.label;
    const count = document.createElement('b');
    item.append(dot, label, count);
    $('legend').append(item);
    legendCounts[tier.id] = count;
  }
}

function updateProgressBar() {
  const counts = Object.fromEntries(TIERS.map((t) => [t.id, 0]));
  for (const id of pool()) counts[tierOf(progress[id])] += 1;
  const total = TIERS.reduce((sum, t) => sum + counts[t.id], 0);

  $('progress').hidden = total === 0;
  for (const tier of TIERS) {
    const count = counts[tier.id];
    segments[tier.id].hidden = count === 0;
    segments[tier.id].style.width = `${(count / total) * 100}%`;
    legendCounts[tier.id].textContent = count;
  }
  $('bar').setAttribute(
    'aria-label',
    `Deck progress: ${TIERS.map((t) => `${counts[t.id]} ${t.label.toLowerCase()}`).join(', ')}`,
  );
}

function updateStats() {
  $('stat-seen').textContent = session.seen;
  $('stat-correct').textContent = session.seen ? `${session.correct}/${session.seen}` : '0';
  $('stat-new').textContent = newTodayLabel();
  updateProgressBar();
}

// ----------------------------------------------------------------- actions

function grade_(gradeId) {
  if (!answered || !current) return;
  const id = queue.shift();
  // A card counts against the day's allowance when you first answer it, not
  // when it is queued — quitting early does not spend cards you never saw.
  if (!progress[id]) {
    daily.introduced += 1;
    save(DAILY_KEY, daily);
  }
  progress[id] = review(progress[id] ?? newCardState(), gradeId);
  save(PROGRESS_KEY, progress);

  log = record(rollLog(log, todayKey()), id, gradeId);
  save(LOG_KEY, log);

  // In typing mode the answer itself says whether you were right; in reveal
  // mode the only evidence is how you graded yourself.
  session.seen += 1;
  if (lastVerdict ? lastVerdict.level === 'correct' : gradeId >= 1) session.correct += 1;

  // A card that has not graduated comes back before the session ends, far
  // enough down the queue to be a real recall attempt rather than an echo.
  // A card you failed returns sooner than one that just needs its second
  // correct answer.
  if (progress[id].interval === 0) {
    const gap = gradeId === 0 ? 3 : 8;
    queue.splice(Math.min(queue.length, gap), 0, id);
  }

  renderCard();
}

function reveal() {
  if (answered) return;
  if (settings.mode !== 'type') return renderResult(null);
  const check = current.direction === 'produce' ? checkAnswer : checkRecognition;
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

  const goals = $('goal-options');
  goals.innerHTML = '';
  for (const goal of DAILY_GOALS) {
    goals.append(option({
      type: 'radio', name: 'goal', label: String(goal),
      checked: settings.dailyNew === goal,
      onChange: (on) => {
        if (!on) return;
        settings.dailyNew = goal;
        // Apply it to today as well, rather than only from tomorrow.
        daily.allowance = goal;
        save(DAILY_KEY, daily);
        commitSettings();
      },
    }));
  }

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

for (const button of document.querySelectorAll('.add')) {
  button.addEventListener('click', () => {
    daily.allowance += Number(button.dataset.add);
    save(DAILY_KEY, daily);
    forceStudy = false;
    queue = buildQueue();
    renderCard();
  });
}

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
  daily = rollOver(null, todayKey(), settings.dailyNew);
  save(DAILY_KEY, daily);
  log = rollLog(null, todayKey());
  save(LOG_KEY, log);
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

  if (answered && ['1', '2', '3'].includes(event.key)) {
    event.preventDefault();
    grade_(Number(event.key) - 1);
    return;
  }

  // Enter accepts the suggested grade, so a correct typed answer is two keys.
  if (answered && event.key === 'Enter') {
    event.preventDefault();
    grade_({ correct: 1, close: 0, wrong: 0 }[lastVerdict?.level] ?? 1);
    return;
  }

  // Space only reveals when you are not typing into the answer box — a
  // compound tense like "ai parlé" has a space in it, and swallowing that
  // would make the form unanswerable. While typing, Enter submits the form.
  if (!answered && !typing && (event.key === ' ' || event.key === 'Enter')) {
    event.preventDefault();
    reveal();
  }
});

buildAccentBar();
buildProgressBar();
renderSettings();
renderCard();

// Offline support. Registration is best-effort: the app works without it,
// and it cannot be registered from file:// anyway.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
