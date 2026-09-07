# Conjugaison

Flashcards for French verb conjugations. A card asks you for one form —

> What is the **passé composé** of *nous · aller*?

— you recall it, reveal the answer, and say how well you knew it. Cards you
miss come back sooner than cards you know.

It installs to a phone home screen and works with no internet. No build step,
no dependencies, no accounts: plain HTML, CSS and ES modules, with your
progress in the browser's `localStorage`.

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
Reopen it on wifi occasionally and any updates are picked up in the
background.

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
- Three buttons, coloured so they can be hit without reading. Each shows when
  the card will next come back:

| | | |
|---|---|---|
| **Again** | red | Got it wrong. Returns a few cards later, in the same session. |
| **Got it** | green | Right. Spaces the card out further each time. |
| **Too easy** | blue | Right, and you would rather not see it again — jumps straight to the longest interval there is, a year. |

  *Too easy* retires a card rather than deleting it: if it ever comes round
  again and you miss it, it is relearnt like any other.
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

In **Settings** you can choose:

| | |
|---|---|
| **Deck** | Core verbs, irregulars, regulars, être verbs, or all 88 |
| **Tenses** | Présent, passé composé, imparfait, futur simple, conditionnel, plus-que-parfait, subjonctif présent |
| **Pronouns** | Drill only *nous* and *vous* if those are the ones that trip you up |
| **Direction** | Give the form, name the verb, or mix the two |
| **How to answer** | Reveal from memory, or type the answer and have it checked |

### Both directions

The default cards go *parler* → **je parle**. Reverse cards go the other way:
they show **j'étais** and ask which verb it is, revealing `être · imparfait ·
to be`. That is the harder and more useful direction, because it is what
reading French actually asks of you.

Reverse cards show only the form — naming the tense would give half of it
away — and they accept any verb that genuinely fits: *je suis* is both *être*
and *suivre*, and either answer is marked correct, with the other named on
the answer side.

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
sw.js                   offline caching
manifest.webmanifest    home-screen install
css/styles.css
js/verbs.js             the dataset
js/conjugator.js        derives every tense from it
js/scheduler.js         review intervals
js/answer.js            typed-answer matching, both directions
js/app.js               cards, session queue, settings
```

## Not covered

The impératif, the passé simple, and reflexive verbs (*se lever*) are out of
scope. Verbs that take either auxiliary depending on meaning (*passer*,
*sortir* used transitively) are listed with only their common one.
