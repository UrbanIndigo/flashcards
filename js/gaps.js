/**
 * The little words: en, y, dont, and the rest of the French that has no
 * English to hang itself on.
 *
 * There is no rule you can learn once and apply. *En* is not a word with a
 * translation, it is a hole in the sentence where *de quelque chose* used to
 * be, and the only way it ever becomes automatic is by meeting it a hundred
 * times. So this file is examples: one short sentence per card, one word
 * taken out of it, and the English underneath so you can tell which word
 * belongs in the hole.
 *
 * The square brackets mark the missing word and are stripped when the file
 * loads. `also` is for the gaps where a second answer is genuinely said —
 * marking a learner wrong for writing what French people write would teach
 * the wrong thing.
 *
 * These cards *are* typed, unlike the expressions and phrases: the answer is
 * one or two words out of a closed set, which is short enough to type on a
 * phone and exact enough to mark.
 */

export const PATTERNS = [
  'en', 'y', 'Object pronouns', 'Relative pronouns', 'on', 'Negation',
  'Time', 'à or de', 'c’est or il est', 'Articles', 'Not like English',
];

const RAW = [
  // ------------------------------------------------------------------ en
  {
    s: 'J’[en] ai trois.', en: 'I have three of them.', pattern: 'en',
    note: 'A number on its own needs en: three of what?',
  },
  {
    s: 'Tu veux du café ? Oui, j’[en] veux bien.',
    en: 'Do you want coffee? Yes, I’d like some.', pattern: 'en',
    note: 'en takes over from du, de la and des — English simply drops "some".',
  },
  {
    s: 'Il [en] parle tout le temps.', en: 'He talks about it all the time.',
    pattern: 'en', note: 'parler de quelque chose → en parler.',
  },
  {
    s: 'Je m’[en] souviens très bien.', en: 'I remember it very well.',
    pattern: 'en', note: 'se souvenir de → s’en souvenir.',
  },
  {
    s: 'Elle [en] a besoin.', en: 'She needs it.', pattern: 'en',
    note: 'avoir besoin de → en avoir besoin.',
  },
  {
    s: 'Des amis ? J’[en] ai beaucoup.', en: 'Friends? I have lots.',
    pattern: 'en', note: 'beaucoup de → en … beaucoup.',
  },
  {
    s: 'Il y [en] a encore.', en: 'There’s still some left.', pattern: 'en',
    note: 'y and en together, always in that order.',
  },
  {
    s: 'Qu’est-ce que tu [en] penses ?', en: 'What do you think of it?',
    pattern: 'en', note: 'penser de is to have an opinion — so en, not y.',
  },
  {
    s: 'Je n’[en] veux plus.', en: 'I don’t want any more.', pattern: 'en',
  },
  {
    s: 'Ne m’[en] parle pas !', en: 'Don’t talk to me about it!', pattern: 'en',
    note: 'In a negative order the pronouns stay in front of the verb.',
  },
  {
    s: 'Nous [en] revenons.', en: 'We have just come back from there.',
    pattern: 'en', note: 'en also stands for the place you came from: revenir de.',
  },
  {
    s: 'Il [en] est sorti à midi.', en: 'He came out of it at midday.',
    pattern: 'en', note: 'sortir de → en sortir.',
  },

  // ------------------------------------------------------------------- y
  {
    s: 'J’[y] vais demain.', en: 'I’m going there tomorrow.', pattern: 'y',
    note: 'y is the place you are going to — à, en, chez, dans, all of them.',
  },
  {
    s: 'Tu [y] penses encore ?', en: 'Are you still thinking about it?',
    pattern: 'y', note: 'penser à → y penser. penser de would be en.',
  },
  {
    s: 'Je n’[y] comprends rien.', en: 'I don’t understand any of it.',
    pattern: 'y',
  },
  {
    s: 'On [y] va !', en: 'Let’s go!', pattern: 'y',
  },
  {
    s: 'Elle s’[y] est habituée.', en: 'She got used to it.', pattern: 'y',
    note: 's’habituer à → s’y habituer.',
  },
  {
    s: 'Il [y] répondra plus tard.', en: 'He’ll answer it later.', pattern: 'y',
    note: 'répondre à → y répondre. In French you answer to a thing, you do not answer it.',
  },
  {
    s: 'Je m’[y] attendais.', en: 'I was expecting it.', pattern: 'y',
    note: 's’attendre à → s’y attendre.',
  },
  {
    s: 'N’[y] pense plus.', en: 'Don’t think about it any more.', pattern: 'y',
  },
  {
    s: 'Il [y] a trop de monde.', en: 'There are too many people.', pattern: 'y',
    note: 'The y in il y a is the same y, worn smooth by use.',
  },
  {
    s: 'Vas-[y] !', en: 'Go on!', pattern: 'y',
    note: 'va gets its -s back before y, to keep it sayable.',
  },
  {
    s: 'Je n’[y] crois pas.', en: 'I don’t believe it.', pattern: 'y',
    note: 'croire à quelque chose → y croire.',
  },
  {
    s: 'Nous [y] sommes restés une semaine.', en: 'We stayed there a week.',
    pattern: 'y',
  },

  // ------------------------------------------------------ Object pronouns
  {
    s: 'Je [lui] ai donné mon numéro.', en: 'I gave him my number.',
    pattern: 'Object pronouns',
    note: 'donner à quelqu’un — so lui, which covers him and her alike.',
  },
  {
    s: 'Je [l’]ai vu hier.', en: 'I saw him yesterday.', also: ['le'],
    pattern: 'Object pronouns',
    note: 'voir takes its object directly, so le — elided to l’ before a vowel.',
  },
  {
    s: 'Tu [leur] as écrit ?', en: 'Did you write to them?',
    pattern: 'Object pronouns', note: 'écrire à quelqu’un → leur.',
  },
  {
    s: 'Elle [les] connaît bien.', en: 'She knows them well.',
    pattern: 'Object pronouns',
  },
  {
    s: 'Je [le] lui ai dit.', en: 'I told him so.', pattern: 'Object pronouns',
    note: 'Two pronouns: le before lui. The thing comes before the person here.',
  },
  {
    s: 'Tu me [le] donnes ?', en: 'Will you give it to me?',
    pattern: 'Object pronouns',
    note: 'But me before le. The order flips depending on which pronouns meet.',
  },
  {
    s: 'Il [nous] a téléphoné.', en: 'He phoned us.', pattern: 'Object pronouns',
    note: 'téléphoner à quelqu’un — indirect in French, direct in English.',
  },
  {
    s: 'Je vais [la] chercher.', en: 'I’m going to fetch her.',
    pattern: 'Object pronouns',
    note: 'The pronoun sits in front of the infinitive it belongs to.',
  },
  {
    s: 'Ne [me] parle pas comme ça.', en: 'Don’t talk to me like that.',
    pattern: 'Object pronouns',
  },
  {
    s: 'Passe-[moi] le sel.', en: 'Pass me the salt.', pattern: 'Object pronouns',
    note: 'After a positive order, me becomes moi and goes behind the verb.',
  },

  // ---------------------------------------------------- Relative pronouns
  {
    s: 'Le livre [dont] je parle est épuisé.',
    en: 'The book I’m talking about is out of print.', pattern: 'Relative pronouns',
    note: 'parler de → dont. Any verb with de takes dont.',
  },
  {
    s: 'C’est l’homme [dont] la voiture est rouge.',
    en: 'That’s the man whose car is red.', pattern: 'Relative pronouns',
    note: 'dont is also whose.',
  },
  {
    s: 'Voilà [ce que] je voulais dire.', en: 'That’s what I wanted to say.',
    pattern: 'Relative pronouns',
    note: 'ce que when it is the object of the verb: I wanted to say the thing.',
  },
  {
    s: '[Ce qui] m’étonne, c’est son calme.',
    en: 'What surprises me is how calm he is.', pattern: 'Relative pronouns',
    note: 'ce qui when it is the subject of the verb: the thing surprises me.',
  },
  {
    s: 'Je ne sais pas [ce dont] il a besoin.', en: 'I don’t know what he needs.',
    pattern: 'Relative pronouns', note: 'avoir besoin de, so ce dont.',
  },
  {
    s: 'Le jour [où] je suis arrivé, il pleuvait.',
    en: 'The day I arrived, it was raining.', pattern: 'Relative pronouns',
    note: 'où is when as well as where, once a time word comes before it.',
  },
  {
    s: 'La ville [où] j’habite est petite.', en: 'The town where I live is small.',
    pattern: 'Relative pronouns',
  },
  {
    s: 'C’est la raison pour [laquelle] je suis parti.',
    en: 'That’s the reason why I left.', pattern: 'Relative pronouns',
    note: 'After a preposition, which agrees: lequel, laquelle, lesquels.',
  },
  {
    s: 'Le train [qui] part à huit heures est complet.',
    en: 'The train that leaves at eight is full.', pattern: 'Relative pronouns',
    note: 'qui when a verb follows it; que when a subject follows.',
  },
  {
    s: 'L’ami [que] j’ai vu hier vient de Lyon.',
    en: 'The friend I saw yesterday comes from Lyon.', pattern: 'Relative pronouns',
    note: 'j’ follows, so que — and English leaves it out altogether.',
  },

  // ------------------------------------------------------------------ on
  {
    s: '[On] y va ?', en: 'Shall we go?', pattern: 'on',
    note: 'on is how nous is actually said. The verb stays singular.',
  },
  {
    s: '[On] m’a dit que c’était fermé.', en: 'I was told it was closed.',
    pattern: 'on', note: 'French says somebody told me where English goes passive.',
  },
  {
    s: 'En France, [on] dîne tard.', en: 'In France people eat late.',
    pattern: 'on', note: 'on is also people in general.',
  },
  {
    s: '[On] est arrivés en retard.', en: 'We arrived late.', pattern: 'on',
    note: 'Singular verb, plural agreement — because everyone hears nous.',
  },
  {
    s: '[On] ne sait jamais.', en: 'You never know.', pattern: 'on',
    note: 'The English "you" that means anyone is on.',
  },
  {
    s: 'Ici [on] parle anglais.', en: 'English spoken here.', pattern: 'on',
  },

  // ------------------------------------------------------------ Negation
  {
    s: 'Il ne mange [que] des légumes.', en: 'He only eats vegetables.',
    pattern: 'Negation',
    note: 'ne … que is only — not a negation at all, despite the ne.',
  },
  {
    s: 'Je ne bois [que] de l’eau.', en: 'I only drink water.', pattern: 'Negation',
  },
  {
    s: 'Je n’ai [pas] de voiture.', en: 'I don’t have a car.', pattern: 'Negation',
    note: 'And un becomes de after the negative: pas de voiture, never pas une.',
  },
  {
    s: 'Il n’y a plus [de] pain.', en: 'There’s no bread left.', pattern: 'Negation',
    note: 'du pain becomes de pain once plus gets hold of it.',
  },
  {
    s: 'Elle ne vient [plus].', en: 'She doesn’t come any more.', pattern: 'Negation',
  },
  {
    s: 'Je n’ai [rien] compris.', en: 'I didn’t understand anything.',
    pattern: 'Negation', note: 'rien and pas never appear together.',
  },
  {
    s: 'Il n’y a [personne].', en: 'There’s nobody there.', pattern: 'Negation',
  },
  {
    s: 'Je ne l’ai [jamais] vu.', en: 'I have never seen him.', pattern: 'Negation',
    note: 'In a compound tense the short negatives wrap the auxiliary.',
  },
  {
    s: 'Nous n’avons [aucune] idée.', en: 'We have no idea.', pattern: 'Negation',
    note: 'aucun agrees with what follows, and is always singular.',
  },
  {
    s: 'Personne [ne] m’a prévenu.', en: 'Nobody warned me.', pattern: 'Negation',
    note: 'When personne is the subject the ne still has to be there.',
  },
  {
    s: 'Il n’est pas [encore] parti.', en: 'He hasn’t left yet.', pattern: 'Negation',
  },
  {
    s: 'Ce n’est [ni] l’un ni l’autre.', en: 'It’s neither one nor the other.',
    pattern: 'Negation',
  },

  // ---------------------------------------------------------------- Time
  {
    s: 'J’habite ici [depuis] trois ans.', en: 'I have lived here for three years.',
    pattern: 'Time',
    note: 'Still true now, so French uses the present where English uses "have".',
  },
  {
    s: 'Elle travaille ici [depuis] janvier.', en: 'She has worked here since January.',
    pattern: 'Time', note: 'depuis is both for and since — French does not split them.',
  },
  {
    s: '[Depuis] quand tu attends ?', en: 'How long have you been waiting?',
    pattern: 'Time',
  },
  {
    s: 'Je suis resté [pendant] deux heures.', en: 'I stayed for two hours.',
    pattern: 'Time', note: 'pendant is a finished stretch of time.',
  },
  {
    s: 'Je pars [pour] une semaine.', en: 'I’m going away for a week.',
    pattern: 'Time', note: 'pour is the time you intend, not the time you spent.',
  },
  {
    s: 'Il est parti [il y a] dix minutes.', en: 'He left ten minutes ago.',
    pattern: 'Time', note: 'il y a is ago when a length of time follows it.',
  },
  {
    s: 'Je reviens [dans] cinq minutes.', en: 'I’ll be back in five minutes.',
    pattern: 'Time', note: 'dans is in five minutes’ time.',
  },
  {
    s: 'J’ai fait ça [en] dix minutes.', en: 'I did that in ten minutes.',
    pattern: 'Time', note: 'en is how long it took — the other English "in".',
  },
  {
    s: '[Ça fait] deux ans que j’apprends le français.',
    en: 'I have been learning French for two years.', also: ['il y a'],
    pattern: 'Time', note: 'Ça fait … que, or il y a … que. Same sentence, same present tense.',
  },
  {
    s: 'Il viendra [vers] huit heures.', en: 'He’ll come around eight.',
    pattern: 'Time',
  },

  // ------------------------------------------------------------- à or de
  {
    s: 'J’ai commencé [à] travailler.', en: 'I started working.', pattern: 'à or de',
    note: 'commencer à. There is no logic to learn here, only the pairs.',
  },
  {
    s: 'Il a essayé [de] m’appeler.', en: 'He tried to call me.', pattern: 'à or de',
  },
  {
    s: 'Elle a décidé [de] partir.', en: 'She decided to leave.', pattern: 'à or de',
  },
  {
    s: 'On continue [à] avancer.', en: 'We keep going.', pattern: 'à or de',
  },
  {
    s: 'J’ai oublié [de] fermer la porte.', en: 'I forgot to shut the door.',
    pattern: 'à or de',
  },
  {
    s: 'Il m’a aidé [à] déménager.', en: 'He helped me move.', pattern: 'à or de',
  },
  {
    s: 'J’ai réussi [à] le convaincre.', en: 'I managed to convince him.',
    pattern: 'à or de', note: 'réussir à — you succeed at doing something, never succeed to.',
  },
  {
    s: 'Elle a refusé [de] répondre.', en: 'She refused to answer.', pattern: 'à or de',
  },
  {
    s: 'Il rêve [de] partir.', en: 'He dreams of leaving.', pattern: 'à or de',
  },
  {
    s: 'Nous avons besoin [de] temps.', en: 'We need time.', pattern: 'à or de',
  },
  {
    s: 'Je pense [à] toi.', en: 'I’m thinking of you.', pattern: 'à or de',
    note: 'penser à is to have in mind; penser de is to have an opinion about.',
  },
  {
    s: 'Elle joue [du] piano.', en: 'She plays the piano.', pattern: 'à or de',
    note: 'jouer de an instrument, jouer à a game.',
  },

  // ------------------------------------------------------ c’est or il est
  {
    s: '[C’est] un bon médecin.', en: 'He’s a good doctor.',
    pattern: 'c’est or il est',
    note: 'An article follows, so c’est — even though English says "he".',
  },
  {
    s: '[Il est] médecin.', en: 'He’s a doctor.', pattern: 'c’est or il est',
    note: 'A job with no article takes il est. And French drops the "a".',
  },
  {
    s: 'Quelle heure est-il ? [Il est] huit heures.',
    en: 'What time is it? It’s eight o’clock.', pattern: 'c’est or il est',
  },
  {
    s: '[C’est] elle qui a raison.', en: 'She’s the one who’s right.',
    pattern: 'c’est or il est', note: 'c’est … qui puts the spotlight on someone.',
  },
  {
    s: '[C’est] mon frère.', en: 'That’s my brother.', pattern: 'c’est or il est',
    note: 'A possessive counts as an article: c’est.',
  },
  {
    s: '[Il est] tard.', en: 'It’s late.', pattern: 'c’est or il est',
    note: 'No particular thing is late, so il — the weather and the clock work this way.',
  },
  {
    s: 'Tu as fini ? [C’est] bien.', en: 'Have you finished? That’s good.',
    pattern: 'c’est or il est', note: 'Looking back at something already said: c’est.',
  },
  {
    s: '[Il est] difficile de trouver un taxi ici.',
    en: 'It is hard to find a taxi here.', also: ['c’est'],
    pattern: 'c’est or il est',
    note: 'il est … de … is the careful form; everyone says c’est in speech.',
  },

  // ------------------------------------------------------------ Articles
  {
    s: 'Je voudrais [du] pain.', en: 'I’d like some bread.', pattern: 'Articles',
    note: 'Some of a thing you cannot count: du, de la, des. English can leave it out; French cannot.',
  },
  {
    s: 'Elle boit [de la] limonade.', en: 'She’s drinking lemonade.',
    pattern: 'Articles',
  },
  {
    s: 'Je n’ai pas [de] sœurs.', en: 'I don’t have any sisters.',
    pattern: 'Articles', note: 'After a negative it all collapses to de.',
  },
  {
    s: 'Il y a beaucoup [de] monde.', en: 'There are a lot of people.',
    pattern: 'Articles', note: 'After a quantity too: beaucoup de, trop de, assez de.',
  },
  {
    s: 'Un kilo [de] pommes, s’il vous plaît.', en: 'A kilo of apples, please.',
    pattern: 'Articles',
  },
  {
    s: 'J’aime [le] chocolat.', en: 'I like chocolate.', pattern: 'Articles',
    note: 'Liking a whole class of thing takes the definite article.',
  },
  {
    s: 'Il joue [au] football.', en: 'He plays football.', pattern: 'Articles',
    note: 'à + le = au. No article at all in English.',
  },
  {
    s: 'Je viens [des] États-Unis.', en: 'I’m from the United States.',
    pattern: 'Articles', note: 'de + les = des. Countries keep their article.',
  },

  // ------------------------------------------------------ Not like English
  {
    s: 'Tu [me] manques.', en: 'I miss you.', pattern: 'Not like English',
    note: 'Back to front: the one who is missed is the subject. You are missing, to me.',
  },
  {
    s: 'Ce film [lui] a beaucoup plu.', en: 'He really liked that film.',
    pattern: 'Not like English',
    note: 'plaire works the same way round: the film pleased him.',
  },
  {
    s: 'Il [faut] partir maintenant.', en: 'We have to leave now.',
    pattern: 'Not like English',
    note: 'falloir has no subject but il — it never says who has to.',
  },
  {
    s: 'Je [viens] de manger.', en: 'I have just eaten.', pattern: 'Not like English',
    note: 'venir de is to have just done something.',
  },
  {
    s: 'Elle [est] en train de travailler.', en: 'She’s working right now.',
    pattern: 'Not like English',
    note: 'French has no -ing tense, so it says it in the middle of doing it.',
  },
  {
    s: 'Il [vaut] mieux attendre.', en: 'It’s better to wait.',
    pattern: 'Not like English', note: 'valoir mieux, impersonal again.',
  },
  {
    s: 'J’[ai] froid.', en: 'I’m cold.', pattern: 'Not like English',
    note: 'French has cold rather than being it: avoir froid, faim, soif, peur.',
  },
  {
    s: 'Elle [a] vingt ans.', en: 'She is twenty.', pattern: 'Not like English',
    note: 'You have your years in French.',
  },
  {
    s: 'Il [fait] beau.', en: 'The weather is nice.', pattern: 'Not like English',
    note: 'The weather does rather than is: il fait beau, il fait froid.',
  },
];

/** An id that survives reordering: the sentence itself, slugged. */
const slug = (value) => value.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const MARKED = /\[([^\]]+)\]/;

export const GAPS = RAW.map((entry) => {
  const found = MARKED.exec(entry.s);
  if (!found) throw new Error(`nothing marked in: ${entry.s}`);
  const text = entry.s.replace(MARKED, () => found[1]);
  return {
    ...entry,
    // The sentence and the word taken out of it: the same sentence can be
    // asked twice, once for the y and once for the on.
    id: `${slug(text)}-${slug(found[1])}`,
    gap: found[1],
    // The brackets are how the file is written, not how it reads.
    text,
    start: found.index,
    end: found.index + found[1].length,
  };
});

export const GAP_BY_ID = new Map(GAPS.map((gap) => [gap.id, gap]));

export const gapsForPatterns = (patterns) =>
  GAPS.filter((gap) => patterns.includes(gap.pattern));
