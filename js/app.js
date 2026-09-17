import {
  GRADES, TIERS, newCardState, review, isDue, formatDue, tierOf,
} from './scheduler.js';
import {
  DAILY_GOALS, DEFAULT_DAILY_NEW, todayKey, rollOver, remainingNew, goalReached, introduces,
} from './daily.js';
import { rollLog, record, summarise, accuracy, MAX_LISTED } from './recap.js';
import { SUBJECTS, subjectById } from './subjects/index.js';
import { listen, say, hush, canSpeak } from './speak.js';

const SETTINGS_KEY = 'conjugaison.settings.v1';

const $ = (id) => document.getElementById(id);

/**
 * How you answer a card. Listening is the odd one out: it is less a way of
 * answering than a way of being asked — the French is played and never
 * printed, and you work from the voice alone until you reveal.
 */
const MODES = [
  ['reveal', 'Think, then reveal', 'Fastest'],
  ['type', 'Type the answer', 'Catches spelling'],
  ['listen', 'Listen, no text', 'Plays by itself · reveal to read it'],
];

const DEFAULT_SETTINGS = {
  subject: 'french',
  mode: 'reveal', // 'reveal' | 'type' | 'listen'
  speech: 'auto', // 'auto' | 'tap' | 'off'
  dailyNew: DEFAULT_DAILY_NEW,
  subjects: {},
};

// ---------------------------------------------------------------- storage

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private browsing, a full quota — not worth interrupting a review for */
  }
}

/**
 * Settings used to be flat, because there was only ever one subject. Anything
 * saved in that shape belongs to French, so it is moved rather than dropped.
 */
function migrate(stored) {
  if (!stored) return { ...DEFAULT_SETTINGS, subjects: {} };
  if (stored.subjects) return { ...DEFAULT_SETTINGS, ...stored };
  const { deck, tenses, pronouns, study, direction, ...rest } = stored;
  return {
    ...DEFAULT_SETTINGS,
    ...rest,
    subject: 'french',
    subjects: { french: { deck, tenses, pronouns, study, direction } },
  };
}

let settings = migrate(read(SETTINGS_KEY));
// 'flags' became a deck inside 'geography'; anyone left pointing at it lands
// in the right place rather than being bounced back to French.
if (settings.subject === 'flags') settings.subject = 'geography';
if (!SUBJECTS.some((s) => s.id === settings.subject)) settings.subject = DEFAULT_SETTINGS.subject;
if (!DAILY_GOALS.includes(settings.dailyNew)) settings.dailyNew = DEFAULT_SETTINGS.dailyNew;
if (!MODES.some(([id]) => id === settings.mode)) settings.mode = DEFAULT_SETTINGS.mode;

let subject = subjectById(settings.subject);

/** This subject's own slice of the settings. */
function sub() {
  const existing = settings.subjects[subject.id];
  const state = { ...subject.defaults, ...(existing ?? {}) };
  subject.normalise(state);
  settings.subjects[subject.id] = state;
  return state;
}

let progress;
let daily;
let log;

// The pool of cards these settings describe, worked out once. It is walked
// several times per card — the queue, the day's new cards, the next due
// time, every segment of the progress bar — and while listening each id has
// to be parsed to know whether it can be heard. Cleared whenever the
// settings, the subject or the available voices change.
let cached = null;

function loadSubjectState() {
  cached = null;
  subject = subjectById(settings.subject);
  // A subject that has been reorganised can bring its old history with it.
  subject.migrate?.(read, save);
  const keys = subject.keys(sub());
  progress = read(keys.progress) ?? {};
  daily = rollOver(read(keys.daily), todayKey(), settings.dailyNew);
  log = rollLog(read(keys.log), todayKey());
}

const saveProgress = () => save(subject.keys(sub()).progress, progress);
const saveDaily = () => save(subject.keys(sub()).daily, daily);
const saveLog = () => save(subject.keys(sub()).log, log);

loadSubjectState();
// Write the migrated shape back once, so old flat settings are converted
// rather than re-migrated on every load.
save(SETTINGS_KEY, settings);

// ------------------------------------------------------------------ cards

/**
 * The mode actually in force. Listening needs a voice on this phone and a
 * subject with cards that can be heard, so geography — and a phone with no
 * French installed — quietly falls back to revealing rather than showing an
 * option that would do nothing.
 */
function mode() {
  if (settings.mode === 'listen' && !(canSpeak() && subject.hearable)) return 'reveal';
  return settings.mode;
}

const listening = () => mode() === 'listen';

function pool() {
  if (cached) return cached;
  const ids = subject.cardIds(sub());
  cached = listening()
    ? ids.filter((id) => {
      const card = subject.parse(id);
      return card ? subject.hearable(card) : false;
    })
    : ids;
  return cached;
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
let pendingExtra = null;
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

// -------------------------------------------------------------- rendering

/**
 * The French on the current card, if this phone has a voice for it and you
 * have not turned it off. Listening ignores the silence setting: the sound
 * is the card, and there would be nothing left of it.
 */
function speech() {
  if (!canSpeak() || !current) return null;
  if (settings.speech === 'off' && !listening()) return null;
  const spec = subject.speech?.(current);
  return spec?.text ? spec : null;
}

/**
 * Wires one of the two speaker buttons to a piece of French, or hides it.
 * Safari will not speak until the page has seen a tap, which is the other
 * reason the button is there and not only the automatic reading.
 */
function speakButton(id, text) {
  const button = $(id);
  button.hidden = !text;
  button.onclick = text ? () => say(text) : null;
}

// Safari, and Chrome on Android, will not speak until the page has seen a
// tap. Opening the app straight onto a listening card therefore starts in
// silence however hard it tries, so the card asks for the tap instead of
// pretending to play. One tap anywhere is enough, for the rest of the visit.
let primed = false;
const prime = () => {
  if (primed) return;
  primed = true;
  if (listening()) renderListenNote();
};
document.addEventListener('pointerdown', prime);
document.addEventListener('keydown', prime);

function renderListenNote() {
  $('listen-note').textContent = primed
    ? 'Tap the speaker to hear it again'
    : 'Tap the speaker to hear it';
}

function typingAllowed() {
  return mode() === 'type' && (subject.typable?.(current) ?? true);
}

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
  pendingExtra = null;
  current = subject.parse(queue[0]);

  // A card can outlive the data that described it — a regenerated corpus, a
  // dropped verb. Skip it rather than rendering a broken prompt.
  if (!current) {
    queue.shift();
    renderCard();
    return;
  }

  const spec = subject.prompt(current);
  $('card-tense').textContent = spec.pill;
  $('card-gloss').hidden = !spec.gloss;
  if (spec.gloss) $('card-gloss').textContent = spec.gloss;

  const lead = $('prompt-lead');
  lead.textContent = '';
  if (Array.isArray(spec.lead)) lead.append(...spec.lead);
  else lead.textContent = spec.lead ?? '';
  // A card that asks its question as one sentence has no separate stem, and
  // an empty lead would just leave a gap above it.
  lead.hidden = !spec.lead;

  const body = $('prompt-body');
  const variant = [spec.prose && 'prose', spec.question && 'question'].filter(Boolean).join(' ');
  body.className = `prompt-body${variant ? ` ${variant}` : ''}`;
  body.replaceChildren(...spec.nodes);

  const typing = typingAllowed();
  $('answer-form').hidden = !typing;
  $('reveal').hidden = typing;
  $('answer-input').placeholder = subject.placeholder?.(current) ?? '';
  $('answer-input').value = '';
  $('answer-sub').hidden = true;
  $('answer-source').hidden = true;
  $('answer-note').hidden = true;
  $('result').hidden = true;
  $('grades').hidden = true;
  $('extra').hidden = true;
  $('extra-toggle').hidden = true;
  $('extra-toggle').setAttribute('aria-expanded', 'false');

  // Whatever was being said belongs to the card you have just left.
  hush();
  const spoken = speech();
  // Only where the French is already on screen: on a card that asks you to
  // produce it, a speaker button would read the answer out.
  speakButton('speak-prompt', spoken?.withPrompt ? spoken.text : null);
  speakButton('speak-answer', null);

  // Listening: the French is played instead of printed, and the text stays
  // behind until you have had your go at it. The speaker stops being a
  // footnote on the card and becomes the card.
  const veiled = listening() && Boolean(spoken?.withPrompt);
  body.classList.toggle('veiled', veiled);
  if (veiled) $('card-gloss').hidden = true;
  $('speak-prompt').classList.toggle('big', veiled);
  $('listen-note').hidden = !veiled;
  if (veiled) {
    renderListenNote();
    if (primed) say(spoken.text);
  }

  if (typing) $('answer-input').focus();
  updateStats();
}

function renderRecap() {
  const summary = summarise(log);
  const box = $('recap');
  box.hidden = summary.answered === 0;
  if (box.hidden) return;

  $('recap-stats').textContent = [
    `${summary.answered} answered`,
    `${summary.right} right (${accuracy(summary)}%)`,
    `${daily.introduced} new`,
  ].join(' · ');

  const list = $('recap-list');
  list.innerHTML = '';
  $('recap-title').hidden = summary.missed.length === 0;

  for (const { id, times } of summary.missed.slice(0, MAX_LISTED)) {
    const card = subject.parse(id);
    // A deck or tense may have been switched off since; skip what we cannot
    // describe rather than showing a broken row.
    if (!card) continue;
    const { question, answer } = subject.faces(card);
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

/**
 * Two different endings: you have hit the day's target and could choose to
 * go on, or the deck genuinely has nothing left to show you.
 */
function renderEmpty() {
  const next = nextDueAt();
  const stillNew = unseen().length;
  const hitGoal = goalReached(daily) && stillNew > 0;

  $('add-more').hidden = !hitGoal;
  $('study-anyway').hidden = hitGoal;
  renderRecap();

  // Listening can empty a deck that is not empty: it only has the cards
  // where the French is the question. Saying so beats "all caught up",
  // which would be a lie and no help in fixing it.
  if (listening() && !pool().length && subject.cardIds(sub()).length) {
    $('add-more').hidden = true;
    $('study-anyway').hidden = true;
    $('empty-title').textContent = 'Nothing here to listen to';
    $('empty-body').textContent =
      'Listening only uses cards where the French is the question. It cannot'
      + ' read out a card that asks you to produce it, or a blank, or a word'
      + ' marked on the page. Change Direction in Settings, or study'
      + ' something the voice can ask you.';
    return;
  }

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
    : 'Pick a deck in Settings to start reviewing.';
}

function renderResult(verdict) {
  if (answered) return;
  answered = true;
  lastVerdict = verdict;

  const verdictEl = $('verdict');
  if (verdict === null) {
    verdictEl.textContent = '';
    verdictEl.className = 'verdict';
  } else {
    verdictEl.textContent = verdict.message;
    verdictEl.className = `verdict ${verdict.level}`;
  }

  const spec = subject.answer(current);
  const answer = $('answer');
  answer.textContent = spec.answer;

  $('answer-sub').textContent = spec.sub ?? '';
  $('answer-sub').hidden = !spec.sub;

  // An optional second line: what the other person says back.
  const reply = $('answer-reply');
  reply.textContent = '';
  reply.hidden = !spec.reply;
  if (spec.reply) {
    reply.append(spec.reply.text);
    if (spec.reply.gloss) {
      const gloss = document.createElement('span');
      gloss.className = 'reply-gloss';
      gloss.textContent = spec.reply.gloss;
      reply.append(gloss);
    }
  }
  $('answer-source').textContent = spec.source ?? '';
  $('answer-source').hidden = !spec.source;
  $('rule').textContent = spec.note ?? '';
  $('rule').hidden = !spec.note;

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

  pendingExtra = subject.extra?.(current) ?? null;
  $('extra-toggle').hidden = !pendingExtra;
  if (pendingExtra) $('extra-toggle').textContent = `Show ${pendingExtra.label}`;

  // Once the answer is out, grading is the only thing left to do.
  $('reveal').hidden = true;
  $('answer-form').hidden = true;

  $('result').hidden = false;
  renderGrades(verdict);
  $('grades').hidden = false;

  // What you have been listening to, now in writing: matching the sound to
  // the spelling is half of what the mode is for.
  $('prompt-body').classList.remove('veiled');
  $('speak-prompt').classList.remove('big');
  $('listen-note').hidden = true;

  const spoken = speech();
  speakButton('speak-answer', spoken?.text ?? null);
  // Listening has just played this, and saying it again over the reveal is
  // startling rather than useful; the speaker is there to ask for it.
  if (spoken && settings.speech === 'auto' && !listening()) say(spoken.text);

  updateStats();
}

function renderGrades(verdict) {
  const box = $('grades');
  // A near miss is still not the answer, so it suggests Again rather than
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
  $('stat-new').textContent = `${daily.introduced}/${daily.allowance}`;
  updateProgressBar();
}

// ----------------------------------------------------------------- actions

function grade_(gradeId) {
  if (!answered || !current) return;
  const id = queue.shift();
  // A card counts against the day's allowance when you first answer it, not
  // when it is queued — quitting early does not spend cards you never saw.
  // And a card you knew well enough to retire on sight was never an
  // introduction, so the day owes you another one.
  if (introduces(!progress[id], gradeId)) {
    daily.introduced += 1;
    saveDaily();
  }
  progress[id] = review(progress[id] ?? newCardState(), gradeId);
  saveProgress();

  log = record(rollLog(log, todayKey()), id, gradeId);
  saveLog();

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
  if (!typingAllowed()) return renderResult(null);
  renderResult(subject.check($('answer-input').value, current));
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

/** Keep at least one box ticked, so a deck can never become empty. */
function toggleIn(list, value, on) {
  const next = on ? [...new Set([...list, value])] : list.filter((v) => v !== value);
  return next.length ? next : list;
}

/** Whatever groups the current subject asks for, rendered generically. */
function renderSubjectFilters() {
  const box = $('subject-filters');
  box.innerHTML = '';
  const state = sub();

  for (const filter of subject.filters(state)) {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = filter.legend;
    const options = document.createElement('div');
    options.className = `options${filter.chips ? ' pronouns' : ''}`;

    for (const choice of filter.options) {
      const checked = filter.type === 'radio'
        ? state[filter.id] === choice.value
        : (state[filter.id] ?? []).includes(choice.value);
      options.append(option({
        type: filter.type,
        name: `${subject.id}-${filter.id}`,
        label: choice.label,
        hint: choice.hint,
        checked,
        onChange: (on) => {
          if (filter.type === 'radio') {
            if (!on) return;
            state[filter.id] = choice.value;
          } else {
            state[filter.id] = toggleIn(state[filter.id] ?? [], choice.value, on);
          }
          settings.subjects[subject.id] = state;
          commitSettings();
        },
      }));
    }
    fieldset.append(legend, options);
    box.append(fieldset);
  }
}

function renderSettings() {
  const subjects = $('subject-options');
  subjects.innerHTML = '';
  for (const candidate of SUBJECTS) {
    subjects.append(option({
      type: 'radio', name: 'subject', label: candidate.label, hint: candidate.hint,
      checked: settings.subject === candidate.id,
      onChange: (on) => {
        if (!on) return;
        settings.subject = candidate.id;
        commitSettings();
      },
    }));
  }

  renderSubjectFilters();

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
        saveDaily();
        commitSettings();
      },
    }));
  }

  const modes = $('mode-options');
  modes.innerHTML = '';
  for (const [id, label, hint] of MODES) {
    // Listening is only offered where it can work: this subject must have
    // something to say, and the phone must have a voice to say it with.
    if (id === 'listen' && !(canSpeak() && subject.hearable)) continue;
    modes.append(option({
      type: 'radio', name: 'mode', label, hint,
      // A mode that cannot apply here shows as the reveal it behaves as.
      checked: mode() === id,
      onChange: (on) => {
        if (!on) return;
        settings.mode = id;
        // Leave it on a deck with something in it.
        if (id === 'listen') subject.forListening?.(sub());
        commitSettings();
      },
    }));
  }

  // A phone with no French voice gets no choice to make about French voices,
  // and while listening there is nothing to choose: the card is the sound.
  $('sound').hidden = !canSpeak() || listening();
  const speechOptions = $('speech-options');
  speechOptions.innerHTML = '';
  for (const [id, label, hint] of [
    ['auto', 'Read the answer out', 'as soon as it shows'],
    ['tap', 'Only when I tap', 'the speaker button'],
    ['off', 'Silence', 'no button either'],
  ]) {
    speechOptions.append(option({
      type: 'radio', name: 'speech', label, hint,
      checked: settings.speech === id,
      onChange: (on) => { if (on) { settings.speech = id; commitSettings(); } },
    }));
  }

  const studied = Object.keys(progress).length;

  $('progress-summary').textContent = studied
    ? `${studied} card${studied === 1 ? '' : 's'} in your ${subject.label} history.`
    : `No progress saved for ${subject.label} yet.`;
  $('reset').textContent = `Reset ${subject.label}`;
}

function commitSettings() {
  save(SETTINGS_KEY, settings);
  loadSubjectState();
  buildAccentBar();
  updateTagline();
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
  bar.innerHTML = '';
  const accents = subject.accents ?? [];
  bar.hidden = accents.length === 0;
  for (const char of accents) {
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

// The voice list is usually empty on the first frame and arrives later, so
// the controls and the buttons are put up again once it does. A voice
// turning up is also what makes listening possible, and the pool of cards
// depends on that.
listen(() => {
  cached = null;
  // Which cards exist depends on there being a voice, but only while
  // listening — elsewhere the queue in hand is still the right one.
  if (listening()) queue = [];
  renderSettings();
  renderCard();
});

$('reveal').addEventListener('click', reveal);
$('answer-form').addEventListener('submit', (event) => { event.preventDefault(); reveal(); });

$('extra-toggle').addEventListener('click', () => {
  const box = $('extra');
  const showing = box.hidden;
  if (showing && pendingExtra) box.replaceChildren(pendingExtra.node);
  box.hidden = !showing;
  $('extra-toggle').setAttribute('aria-expanded', String(showing));
  $('extra-toggle').textContent = `${showing ? 'Hide' : 'Show'} ${pendingExtra?.label ?? ''}`;
});

$('study-anyway').addEventListener('click', () => {
  forceStudy = true;
  queue = buildQueue();
  renderCard();
});

for (const button of document.querySelectorAll('.add')) {
  button.addEventListener('click', () => {
    daily.allowance += Number(button.dataset.add);
    saveDaily();
    forceStudy = false;
    queue = buildQueue();
    renderCard();
  });
}

$('settings-toggle').addEventListener('click', () => openSettings($('settings').hidden));
$('settings-close').addEventListener('click', () => openSettings(false));
$('settings-backdrop').addEventListener('click', () => openSettings(false));

$('reset').addEventListener('click', () => {
  if (!confirm(`Delete your ${subject.label} history and start over?`)) return;
  for (const key of subject.storageKeys(sub())) {
    try { localStorage.removeItem(key); } catch { /* nothing to do */ }
  }
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

  // Hearing it again, which is most of the work on a listening card.
  if (!typing && event.key.toLowerCase() === 'r') {
    const spoken = speech();
    if (!spoken || (!answered && !spoken.withPrompt)) return;
    event.preventDefault();
    say(spoken.text);
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

/** The header should say what you are actually studying. */
function updateTagline() {
  $('tagline').textContent = `${subject.label} · ${subject.hint}`;
}

buildAccentBar();
updateTagline();
buildProgressBar();
renderSettings();
renderCard();

// Offline support. Registration is best-effort: the app works without it,
// and it cannot be registered from file:// anyway.
//
// A new build installs alongside the running one and waits, so the page you
// are looking at keeps a consistent set of files. When it is ready, the
// reader is offered the swap rather than having it happen underfoot.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  // A worker claims the page when it first activates, which changes the
  // controller without anything having been updated. Reloading on that would
  // restart the app a second after a first-time visitor opened it, mid-card.
  // Only a change away from a controller we already had is a real update.
  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    reloading = true;
    location.reload();
  });

  const offer = (worker) => {
    const button = $('update');
    button.hidden = false;
    button.onclick = () => {
      button.disabled = true;
      button.textContent = 'Updating…';
      worker.postMessage('skip-waiting');
    };
  };

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('sw.js');
      if (registration.waiting && navigator.serviceWorker.controller) offer(registration.waiting);
      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        installing?.addEventListener('statechange', () => {
          // A first install has no controller and is simply the app going
          // offline-capable; there is nothing to refresh into.
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            offer(installing);
          }
        });
      });
    } catch {
      /* no offline support this time; the app still runs */
    }
  });
}
