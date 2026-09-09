# Conjugaison

A spaced-repetition flashcard app. It began as French verb conjugation and
still does that best, but the material is now pluggable: **French verbs** and
**world geography** ship with it, and a new subject is one file.

It installs to a phone home screen and works with no internet. No build step,
no dependencies, no accounts: plain HTML, CSS and ES modules, with your
progress in the browser's `localStorage`.

## Subjects

| | |
|---|---|
| **French verbs** | 88 verbs across 9 tenses, in both directions, plus reading real sentences from novels |
| **Geography** | 196 countries — **Flags**, **Capitals**, **Outlines** and **Borders** decks, studied singly or together, filterable by region |

A subject can hold several decks when they share their material, and they can
be studied together — ticking Flags, Capitals and Outlines puts every one of
those card kinds in one queue. Each deck is a self-contained definition in
`js/subjects/geography.js`: its two directions, how a card is worded, and
what counts as an answer. Adding another kind of question is one entry in
that list.

A deck need not go both ways. Flags only ask flag → country, and Outlines
only outline → country: the other direction could only ever be graded by
deciding for yourself whether the picture in your head was right, which is
not a question worth asking. Capitals go both ways.

A deck need not cover every country either. Twenty-four are too small to have
an outline worth guessing — Monaco is two square kilometres, and at any scale
its coastline is a squiggle rather than a shape — and forty have no land
border at all, so they are left out of those decks rather than asked as
cards whose answer is always "none". The region counts in Settings follow the
decks you have on: only one country in Oceania has a neighbour.

The Direction control follows from that. With a single deck it names each way
round exactly ("Name the capital"); with several it describes them, listing
what each direction means across the decks you have on; and when there is
only one way round available it does not appear at all, because there is
nothing to choose.

### Flags are images, not emoji

Emoji flags are drawn by the operating system, so they differ between phones,
and several platforms decline to draw them at all and show the two letters
instead. The artwork is `flag-icons` (MIT; the flags themselves are public
symbols), served as **SVG where the design is geometric** and **WebP at
display resolution where it is an illustrated coat of arms**. Twenty-six
flags fall in the second group and account for most of the weight: keeping
them as SVG would cost 1.9MB, and this takes the whole set to about 510KB,
which is small enough to precache for offline use without a visible
difference on screen.

### Outlines and borders

Both come from Natural Earth (public domain), by way of `world-atlas` (ISC),
and are built by `tools/build-atlas.mjs`. Borders fall out of the topology
for free — two countries are neighbours when they share an edge of the map —
which is a better source than a typed list, because it cannot disagree with
the map the outlines are drawn from.

Outlines are projected at build time, so the app ships 170KB of SVG paths
rather than a megabyte of coordinates and a projection library. Each is drawn
with an equal-area projection centred on the country itself, so its shape is
not stretched by where it happens to sit on a world map, and scaled to fill
the frame, because at a common scale Luxembourg would be a full stop next to
Russia. Far-flung territory is left off: fitting French Guiana and Réunion in
the same picture as the hexagon would leave the hexagon too small to read.
What counts as far-flung is a rule rather than a list — a piece stays if it
is close enough to belong to the same picture, like Corsica or Tasmania, or
big enough to be the country whatever the distance, which is what keeps
peninsular Malaysia attached to Borneo.

A borders answer is a list, marked as a set: order does not matter, nor do
the separators, and "Bosnia and Herzegovina" is not split down the middle.
Naming most of a long list is a near miss and says what was missed; naming a
country that is nowhere near is a different mistake and says so.

France is the awkward case. The French Republic really does border Brazil and
Suriname, along French Guiana, but nobody listing the countries around France
means Brazil. Those borders are accepted, never required, and explained when
the answer comes up.

### Capitals

Several countries genuinely have more than one capital, and a few have
moved. Marking a defensible answer wrong teaches nothing, so South Africa
accepts Pretoria, Cape Town or Bloemfontein; Bolivia takes Sucre or La Paz;
the Netherlands takes Amsterdam or The Hague; Kazakhstan still accepts
Nur-Sultan.

Neither punctuation nor accents decide a geography answer, unlike French
where the accent is part of the word being learnt. *Washington, D.C.* and
*Washington DC* are the same answer. Accents are subtler: the source data is
not consistent about them — Colombia's capital arrives as Bogotá and
Iceland's as Reykjavik — so marking them would penalise *Reykjavík*, which is
the better spelling of the two.

Each subject owns its own material, its own settings and its own storage, so
histories never mix and switching between them costs nothing. The daily
allowance is counted per subject too: an evening on geography does not eat
the French twenty.

### Adding a subject

A subject is an object in `js/subjects/`. It says which cards exist, how one
is worded, and what counts as an answer; the app supplies everything else —
the queue, the schedule, the daily allowance, the progress bar and the recap.

```js
export const capitals = {
  id: 'capitals',
  label: 'Capital cities',
  hint: '196 countries',
  defaults: { regions: [...] },
  keys: () => ({ progress: '…', daily: '…', log: '…' }),
  storageKeys: () => [ … ],
  normalise(s) { … },              // clamp anything stale in saved settings
  filters(s) { … },                // the settings groups this subject wants
  cardIds(s) { … },                // which cards exist right now
  parse(id) { … },                 // an id back into a card, or null
  prompt(card) { … },              // { pill, lead, nodes }
  answer(card) { … },              // { answer, sub?, source?, note? }
  faces(card) { … },               // how it reads in the recap
  check(input, card) { … },        // a verdict, or null if not typable
};
```

`js/subjects/geography.js` is the short worked example — four decks, most of
it wording. `js/subjects/french.js` is the awkward one,
since it generates cards rather than listing them.

Country data is rebuilt with:

```sh
node tools/build-geography.mjs > js/subjects/geography-data.js
```

which also writes `flags/manifest.json`, the list the service worker reads at
install time so 196 paths do not have to be pasted into it. Outlines and
borders are rebuilt with:

```sh
npm --prefix /tmp install world-atlas topojson-client d3-geo i18n-iso-countries
node tools/build-atlas.mjs
```

which writes `js/subjects/shapes-data.js` and `js/subjects/borders-data.js`.

## On your phone, offline

The app is a PWA: once it has loaded, a service worker keeps the whole thing
cached, so it runs on the Tube, on a plane, or in a field.

Installing needs HTTPS — a laptop serving on the local network will not
register a service worker — so publish it to GitHub Pages:

1. Merge this branch to `main`.
2. **Settings → Pages → Source: GitHub Actions**, once.
3. Push. `.github/workflows/ci.yml` runs the tests and deploys, and Pages
   gives you a URL like `https://<user>.github.io/flashcards/`.

Then, on the phone, open that URL and:

- **iOS / Safari** — Share → *Add to Home Screen*
- **Android / Chrome** — ⋮ → *Install app* (or *Add to Home Screen*)

It then launches full screen with its own icon, and works with no signal.

### Updates

Each build is cached under its own name and served from that one cache, so
every file in a page load comes from the same version. That is the point: an
earlier design refreshed files independently, and a page could load a new
`index.html` against a stale `app.js` and quietly lose half a feature.

A new build installs alongside the running one and waits, leaving the page
you are looking at intact. When it is ready a small **Update ready — tap to
refresh** button appears; tapping it swaps versions and reloads. Nothing
changes underfoot mid-review.

The service worker is stamped with the commit SHA at deploy time, which is
what makes a new build visible to an already-installed app.

Progress is stored per browser and never leaves the device, so the phone and
the laptop keep separate review schedules.

## Running it locally

ES modules need to be served over HTTP rather than opened from disk:

```sh
npm start          # python3 -m http.server 8000
```

Then open <http://localhost:8000>. Any static file server works.

## Using it

- **Space** reveals the answer, **1**–**3** grade it, **S** opens settings.
- Three buttons, coloured so they can be hit without reading. When each card
  comes back is the scheduler's problem, not yours:

| | | |
|---|---|---|
| **Again** | red | Got it wrong. Returns a few cards later, in the same session. |
| **Got it** | green | Right. Spaces the card out further each time. |
| **Too easy** | blue | Right, and you would rather not see it again — jumps straight to the longest interval there is, a year. |

  *Too easy* retires a card rather than deleting it: if it ever comes round
  again and you miss it, it is relearnt like any other.

- **A new card has to be answered correctly twice** before it starts being
  spaced out in days. One right answer is weak evidence — you may have just
  read it — so the card comes back later in the same session, far enough down
  the queue to be a real recall attempt, and only leaves once you have
  produced it twice. *Again* wipes that progress; *Too easy* skips it. A card
  you lapse on has to be relearnt the same way.

  Half-learnt cards count as **Learning** on the progress bar until they
  graduate.
- **Every answer comes with the rule behind it** — the transferable part:

  > **je parlerai**
  > The whole infinitive (parler-) plus -ai, -as, -a, -ons, -ez, -ont. Same
  > endings for every verb.

  The note is specific to the card rather than generic. *nous mangeons*
  explains the kept e; *je mange* does not, because nothing happened there.
  *nous mangions* points out that the softening only applies before a, o and
  u. An irregular participle is flagged, but only when it really is one —
  *parti* is exactly what the -ir pattern predicts, so calling it irregular
  would be crying wolf.

  Because the conjugator derives forms from rules rather than storing tables,
  the reasoning already exists; the note just says it out loud. A test
  asserts that a compound tense's note always contains the participle printed
  above it, so the explanation cannot drift from the answer.

- **Show the full table** prints the whole six-person paradigm, which is
  usually the fastest way to fix a form you keep missing.
- The **bar along the bottom** breaks the whole selected deck down by how well
  established each card is, so you can see the deck moving over weeks rather
  than only the current session:

| | |
|---|---|
| **Known** | next review 21 days out or more — Anki's threshold for a mature card |
| **Young** | 1 to 20 days: learnt, not yet settled |
| **Learning** | never spaced, or answered *Again* and back to zero |
| **New** | not yet seen |

  A card you answer *Again* drops back to Learning even after many reviews,
  which is the point: the bar should show a verb you have started forgetting,
  not the fact that you once knew it.

### A day's worth

New cards are rationed: **twenty a day** by default. Reviews that fall due are
always shown — that is the whole point of a spaced system — but new material
is not dealt endlessly. When the day's allowance is spent and the reviews are
done, you get a finish line rather than another twenty:

> **That is your 20 for today**
> 20 new cards done, and 312 still waiting in this deck.
> [Add 5] [Add 10] [Add 20]

The two study modes count separately, so an afternoon of reading does not eat
the conjugation allowance. Adding more only extends *today*; tomorrow returns
to the configured goal, so one enthusiastic evening does not silently raise
the bar. A card counts
against the allowance the first time you answer it, not when it is queued, so
quitting halfway does not burn cards you never saw. The **New today** counter
in the header shows where you are.

### Reading novels

Nineteenth-century French uses two tenses that barely exist in speech, which
is why Dumas and Zola can be hard going even when you know the spoken
language:

| | |
|---|---|
| **Passé simple** | *il fut, il eut, il dit, il prit, ils regardèrent* — means exactly what the passé composé means, a finished action, but written rather than spoken |
| **Subjonctif imparfait** | *qu'il fût, qu'elle eût* — where modern French would use the present subjunctive |

Turn both on in Settings, set **Direction** to *Name the verb and tense*, and
even the plain drills become reading practice: the card shows **il but** and
you answer *boire, passé simple* — "he drank". That is the exact skill a novel asks for, since when
reading you never have to produce these forms, only recognise them.

The passé simple has three families of endings (`-ai`, `-is`, `-us`) plus
*venir* and *tenir* on their own (`vins, vint, vinrent`), and the notes point
out that a `-u` participle usually predicts the `-us` stem: *couru → courus*,
*bu → but*. The imperfect subjunctive is built off the passé simple, so
knowing one gives you the other.

### Reading real sentences

Reading is its own mode, not a variation on the drills — set **Study** to
*Reading* in Settings and the card shows a line from a novel with one verb
highlighted:

> Bientôt elle lui avoua qu'elle partageait son amour, quoiqu'il **dût**,
> prévoyait-elle, leur causer de violents chagrins.
>
> → **devoir** · subjonctif imparfait
> *Les Mystères de Paris*, ch. 14 — Eugène Sue

641 sentences from *Le Comte de Monte-Cristo* (Dumas), *Les Mystères de
Paris* (Sue) and *Le Dernier Jour d'un condamné* (Hugo) — all long out of
copyright — built by `tools/extract-sentences.mjs`.

Getting this right is mostly about refusing to guess. A card that highlighted
*la porte* and called it *porter* would teach the opposite of what it is for,
so two filters do the work:

1. **A form only counts when it directly follows a subject pronoun.** That
   rules out every noun homograph in one move — *il entre* is the verb,
   *entre les deux* is not — and it fixes the person for free.
2. **The form must have exactly one reading** across every verb and tense in
   the app. *il vit* is *voir* in the passé simple or *vivre* in the présent,
   and a sentence card cannot mark a defensible answer wrong, so it is
   dropped.

A test re-derives every highlighted span from the conjugator and fails if it
is not exactly the form the card claims, so the corpus cannot drift away from
the rest of the app.

To rebuild from your own texts:

```sh
node tools/extract-sentences.mjs path/to/texts > js/sentences.js
```

Sentence ids are hashes of the sentence, so regenerating the corpus keeps
your review history for any sentence that survives.

### The recap

The finish screen ends with the day's recap:

> 63 answered · 45 right (71%) · 20 new
>
> **Worth another look**
> répondre · passé composé · nous  ×4 — *nous avons répondu*
> mourir · présent · nous — *nous mourons*

The score is the least of it. The useful half is the list of forms you
actually missed with their answers, which is otherwise invisible the moment
the card goes past — ordered most-missed first, because a verb you fumbled
four times deserves attention before one you slipped on once. A card you
missed and then got right still appears; getting there eventually is exactly
what makes it worth revisiting.

Card state records where a verb has got to, not what happened today, so the
recap keeps its own log in `js/recap.js`. It resets with the calendar day.

In **Settings** you can choose:

| | |
|---|---|
| **Study** | Conjugation drills, or reading sentences |
| **Deck** | Core verbs, irregulars, regulars, être verbs, or all 88 |
| **New cards a day** | 5, 10, 20 or 40 |
| **Tenses** | Présent, passé composé, imparfait, futur simple, conditionnel, plus-que-parfait, subjonctif présent, and the two literary tenses below |
| **Pronouns** | Drill only *nous* and *vous* if those are the ones that trip you up (conjugation only) |
| **Direction** | Give the form, name the verb and tense, or mix the two (conjugation only) |
| **How to answer** | Reveal from memory, or type the answer and have it checked |

### Both directions

The default cards go *parler* → **je parle**. Reverse cards go the other way:
they show **j'étais** and ask which verb it is, revealing `être · imparfait ·
to be`. That is the harder and more useful direction, because it is what
reading French actually asks of you.

Reverse cards ask for **both**, because that is what reading needs: knowing
*il but* is *boire* does not help until you also see it is a passé simple.
Type them in either order, in French or English — `boire passé simple`,
`passe simple boire`, `boire past historic` all pass — and getting one half
right says which half:

| | |
|---|---|
| `être imparfait` | Correct |
| `être` | Right verb — name the tense too |
| `être futur` | Right verb — wrong tense |
| `imparfait` | Right tense — wrong verb |

They accept every reading that genuinely fits, because French forms collide
constantly and a book gives you no more context than the card does:

- *je suis* — être **or** suivre, both présent
- *je finis* — finir, présent **or** passé simple
- *il vit* — voir in the passé simple ("he saw") **or** vivre in the présent ("he lives")
- *que je finisse* — both subjunctives at once

The answer side names the other readings rather than hiding them, since the
ambiguity is the thing worth knowing.

The two directions are scheduled separately, so knowing *parler → je parle*
does not claim you can also read it backwards.

Typing mode accepts either the bare form (`ai parlé`) or the whole clause
(`j'ai parlé`), ignores case and stray punctuation, and tells you when the
letters were right but an accent was not — `prefere` for *préfère* is marked
*almost*, not *correct*. There is a row of accent buttons for keyboards that
make `é` awkward.

## How the conjugations are produced

`js/verbs.js` stores the least possible information per verb, and
`js/conjugator.js` derives every tense from it. A regular verb is four fields;
even `boire` only needs its present tense and past participle, because:

- the **imperfect** stem is the *nous* form minus `-ons` (être is the sole
  exception), and
- the **subjunctive** takes its singular and *ils* forms from the *ils*
  present stem and its *nous* / *vous* forms from the imperfect stem — which
  is what makes *que je boive* / *que nous buvions* fall out for free.

Only seven verbs need their subjunctive written out (être, avoir, aller,
faire, pouvoir, savoir, vouloir). Spelling rules are handled rather than
listed, so `-cer` and `-ger` verbs keep their soft consonant only where they
should: *nous mangeons* but *nous mangions*.

Past participles of être verbs agree with the subject. Cards show the
masculine forms (*nous sommes allés*).

## Tests

```sh
npm test
```

`test/conjugator.test.mjs` checks the paradigms that learners actually get
wrong — stem changes, two-stem subjunctives, irregular future stems,
auxiliary choice and agreement — and asserts that all 88 verbs produce six
well-formed forms in all seven tenses. `test/scheduler.test.mjs` covers the
review intervals and `test/answer.test.mjs` the typed-answer matching.

## Adding a verb

Append an entry to `VERBS` in `js/verbs.js`. Regular verbs are one line:

```js
{ inf: 'oublier', en: 'to forget', group: 'er', tags: ['regular'] }
```

An irregular one needs its present tense and past participle, plus a future
stem if that is irregular too:

```js
{
  inf: 'valoir', en: 'to be worth', group: 'irr', tags: ['irregular'],
  present: ['vaux', 'vaux', 'vaut', 'valons', 'valez', 'valent'],
  pp: 'valu', fut: 'vaudr',
}
```

`npm test` will tell you if the entry is malformed or produces an empty form.

## Layout

```
index.html              markup and PWA metadata
sw.js                   offline caching and versioned updates
manifest.webmanifest    home-screen install
css/styles.css
js/verbs.js             the dataset
js/conjugator.js        derives every tense from it
js/scheduler.js         review intervals
js/daily.js             the daily allowance of new cards
js/recap.js             the day's review log and its summary
js/rules.js             the one-line rule behind each answer
js/answer.js            typed-answer matching, both directions
js/app.js               cards, session queue, settings
```

## Not covered

The impératif and reflexive verbs (*se lever*) are out of scope. Verbs that
take either auxiliary depending on meaning (*passer*, *sortir* used
transitively) are listed with only their common one.

Zola is not in the corpus — the texts available to build from were Dumas,
Sue and Hugo. Any directory of French text can be added with the extractor.
