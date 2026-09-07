# Conjugaison

Flashcards for French verb conjugations. A card asks you for one form —

> What is the **passé composé** of *nous · aller*?

— you recall it, reveal the answer, and say how well you knew it. Cards you
miss come back sooner than cards you know.

No build step, no dependencies, no accounts: it is plain HTML, CSS and ES
modules, and your progress lives in the browser's `localStorage`.

## Running it

ES modules need to be served over HTTP rather than opened from disk:

```sh
npm start          # python3 -m http.server 8000
```

Then open <http://localhost:8000>. Any static file server works, and the
directory can be published to GitHub Pages as-is.

## Using it

- **Space** reveals the answer, **1**–**4** grade it, **S** opens settings.
- **Again / Hard / Good / Easy** — each button shows when the card will next
  come back. *Again* returns it a few cards later, in the same session.
- **Show the full table** prints the whole six-person paradigm, which is
  usually the fastest way to fix a form you keep missing.

In **Settings** you can choose:

| | |
|---|---|
| **Deck** | Core verbs, irregulars, regulars, être verbs, or all 88 |
| **Tenses** | Présent, passé composé, imparfait, futur simple, conditionnel, plus-que-parfait, subjonctif présent |
| **Pronouns** | Drill only *nous* and *vous* if those are the ones that trip you up |
| **How to answer** | Reveal from memory, or type the form and have it checked |

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

## Not covered

The impératif, the passé simple, and reflexive verbs (*se lever*) are out of
scope. Verbs that take either auxiliary depending on meaning (*passer*,
*sortir* used transitively) are listed with only their common one.
