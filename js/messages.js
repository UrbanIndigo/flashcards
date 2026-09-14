/**
 * French as it is actually typed.
 *
 * Everything else in this app is written French — even the phrasebook is
 * tidy. This deck is what arrives on your phone: no commas, half the
 * negatives missing, letters dropped where nobody says them, and two or
 * three filler words per sentence carrying real meaning.
 *
 * The hard part is almost never vocabulary. *Comme tu viens de lire le
 * livre le film va te décevoir* uses eleven words you already know; what
 * defeats you is that the comma marking where one clause ends and the next
 * begins has been left out, so the sentence looks like one long thing.
 *
 * So every card shows the message as it was sent, and the answer shows the
 * same sentence written out properly next to what it means. The note names
 * the one thing that made it hard to read — which is usually punctuation
 * rather than slang.
 *
 * Written for this app, in the register these things are written in.
 */

export const TAGS = [
  'Since and so', 'Fillers', 'Dropped letters', 'No ne', 'Texting',
];

const RAW = [
  // ------------------------------------------------------ Since and so
  {
    msg: 'Mais en vrai comme tu viens de lire le livre le film va te décevoir',
    tidy: 'Mais en vrai, comme tu viens de lire le livre, le film va te décevoir.',
    en: 'But honestly, since you’ve just read the book, the film is going to disappoint you.',
    note: 'comme at the head of a sentence means since, not like. The commas that would show where its clause ends are the first thing to go in a message.',
    tag: 'Since and so',
  },
  {
    msg: 'comme il pleut on reste à la maison',
    tidy: 'Comme il pleut, on reste à la maison.',
    en: 'Since it’s raining, we’re staying in.',
    note: 'Causal comme only works at the front. Move it and you need parce que instead.',
    tag: 'Since and so',
  },
  {
    msg: 'du coup tu viens ou pas',
    tidy: 'Du coup, tu viens ou pas ?',
    en: 'So are you coming or not?',
    note: 'du coup is the spoken "so". It starts about a third of all sentences and means almost nothing.',
    tag: 'Since and so',
  },
  {
    msg: 'vu que t’es déjà sur place tu peux prendre le pain',
    tidy: 'Vu que tu es déjà sur place, tu peux prendre le pain ?',
    en: 'Seeing as you’re already there, can you get the bread?',
    note: 'vu que is another since — flatter than parce que, and very common.',
    tag: 'Since and so',
  },
  {
    msg: 'jsuis en retard donc commencez sans moi',
    tidy: 'Je suis en retard, donc commencez sans moi.',
    en: 'I’m running late, so start without me.',
    note: 'donc is the written "so"; du coup is what you say out loud.',
    tag: 'Since and so',
  },
  {
    msg: 'si jamais tu passes devant la boulangerie prends un truc',
    tidy: 'Si jamais tu passes devant la boulangerie, prends quelque chose.',
    en: 'If you happen to pass the bakery, grab something.',
    note: 'si jamais is "if by any chance" — a soft way of asking a favour.',
    tag: 'Since and so',
  },
  {
    msg: 'jte dis ça parce que ça m’est arrivé aussi',
    tidy: 'Je te dis ça parce que ça m’est arrivé aussi.',
    en: 'I’m telling you this because it happened to me too.',
    note: 'je te collapses to jte in typing, and the whole phrase is one breath.',
    tag: 'Since and so',
  },
  {
    msg: 'alors que moi jtrouve ça très bien',
    tidy: 'Alors que moi, je trouve ça très bien.',
    en: 'Whereas I think it’s very good.',
    note: 'alors que is whereas here, not "while" in the time sense.',
    tag: 'Since and so',
  },
  {
    msg: 'du coup au final on fait quoi',
    tidy: 'Du coup, au final, on fait quoi ?',
    en: 'So in the end what are we doing?',
    note: 'Two fillers in a row and a question with no inversion: entirely normal.',
    tag: 'Since and so',
  },
  {
    msg: 'comme j’avais pas de réseau j’ai pas vu ton message',
    tidy: 'Comme je n’avais pas de réseau, je n’ai pas vu ton message.',
    en: 'Since I had no signal, I didn’t see your message.',
    note: 'comme opening the sentence, and both ne dropped — the two habits together.',
    tag: 'Since and so',
  },
  {
    msg: 'en plus il fait beau donc on y va à pied',
    tidy: 'En plus, il fait beau, donc on y va à pied.',
    en: 'And it’s nice out, so we’ll walk.',
    note: 'en plus adds a reason to what you have already said: "and besides".',
    tag: 'Since and so',
  },
  {
    msg: 'pendant que j’y pense tu fais quoi samedi',
    tidy: 'Pendant que j’y pense, tu fais quoi samedi ?',
    en: 'While I think of it, what are you doing on Saturday?',
    note: 'pendant que is while in time; alors que is usually whereas.',
    tag: 'Since and so',
  },

  // ------------------------------------------------------------ Fillers
  {
    msg: 'en vrai c’était pas si mal',
    tidy: 'En vrai, ce n’était pas si mal.',
    en: 'Honestly, it wasn’t that bad.',
    note: 'en vrai is "honestly" or "to be fair". Nothing to do with truth or reality.',
    tag: 'Fillers',
  },
  {
    msg: 'c’était genre trois heures d’attente',
    tidy: 'C’était environ trois heures d’attente.',
    en: 'It was like three hours of waiting.',
    note: 'genre is the spoken "like" — about, roughly, sort of.',
    tag: 'Fillers',
  },
  {
    msg: 'c’est grave bien ce resto',
    tidy: 'Ce restaurant est vraiment bien.',
    en: 'That restaurant is really good.',
    note: 'grave as an adverb means "really". On its own, grave means "totally".',
    tag: 'Fillers',
  },
  {
    msg: 'franchement j’ai rien compris',
    tidy: 'Franchement, je n’ai rien compris.',
    en: 'Honestly, I didn’t understand a thing.',
    note: 'franchement opens a sentence the way "honestly" does in English.',
    tag: 'Fillers',
  },
  {
    msg: 'c’était nul quoi',
    tidy: 'C’était nul, quoi.',
    en: 'It was rubbish, you know.',
    note: 'quoi at the end is a shrug: "you know what I mean". It asks nothing.',
    tag: 'Fillers',
  },
  {
    msg: 'bref on s’appelle demain',
    tidy: 'Bref, on s’appelle demain.',
    en: 'Anyway, we’ll speak tomorrow.',
    note: 'bref closes a subject: "anyway", "long story short".',
    tag: 'Fillers',
  },
  {
    msg: 'carrément je suis d’accord',
    tidy: 'Carrément, je suis d’accord.',
    en: 'Absolutely, I agree.',
    note: 'carrément on its own is an emphatic yes.',
    tag: 'Fillers',
  },
  {
    msg: 'ça va être chaud d’arriver à l’heure',
    tidy: 'Ça va être difficile d’arriver à l’heure.',
    en: 'Getting there on time is going to be tough.',
    note: 'chaud means tricky or dicey here, not hot.',
    tag: 'Fillers',
  },
  {
    msg: 'jsp trop, genre demain ou après-demain',
    tidy: 'Je ne sais pas trop : demain ou après-demain.',
    en: 'Not really sure — tomorrow or the day after.',
    note: 'pas trop softens a no into "not really".',
    tag: 'Fillers',
  },
  {
    msg: 'tranquille on se voit plus tard',
    tidy: 'Pas de souci, on se voit plus tard.',
    en: 'No worries, see you later.',
    note: 'tranquille on its own means "it’s fine, no rush".',
    tag: 'Fillers',
  },
  {
    msg: 'ça me saoule ce truc',
    tidy: 'Ça m’agace, cette histoire.',
    en: 'This thing is doing my head in.',
    note: 'truc stands in for any noun you cannot be bothered to name.',
    tag: 'Fillers',
  },
  {
    msg: 'vas-y raconte',
    tidy: 'Allez, raconte.',
    en: 'Go on, tell me.',
    note: 'vas-y here is just "go on" — nobody is going anywhere.',
    tag: 'Fillers',
  },

  // --------------------------------------------------- Dropped letters
  {
    msg: 't’as vu l’heure',
    tidy: 'Tu as vu l’heure ?',
    en: 'Have you seen the time?',
    note: 'tu as becomes t’as in speech, and in writing once it is casual.',
    tag: 'Dropped letters',
  },
  {
    msg: 't’es où',
    tidy: 'Tu es où ?',
    en: 'Where are you?',
    note: 'A whole question in two words, with the question word last.',
    tag: 'Dropped letters',
  },
  {
    msg: 'y a personne ce soir',
    tidy: 'Il n’y a personne ce soir.',
    en: 'There’s nobody about tonight.',
    note: 'il y a loses its il in speech: y a. Written down it looks like nothing at all.',
    tag: 'Dropped letters',
  },
  {
    msg: 'faut qu’on parle',
    tidy: 'Il faut qu’on parle.',
    en: 'We need to talk.',
    note: 'il faut drops its il too. faut que takes the subjunctive.',
    tag: 'Dropped letters',
  },
  {
    msg: 'chais pas',
    tidy: 'Je ne sais pas.',
    en: 'Dunno.',
    note: 'je sais pas said fast becomes chais pas. jsp is the typed version.',
    tag: 'Dropped letters',
  },
  {
    msg: 'jsuis déjà dans le train',
    tidy: 'Je suis déjà dans le train.',
    en: 'I’m already on the train.',
    note: 'je suis flattens to jsuis, sometimes chuis.',
    tag: 'Dropped letters',
  },
  {
    msg: 'ouais ça marche',
    tidy: 'Oui, ça marche.',
    en: 'Yeah, that works.',
    note: 'ouais is yeah. Fine with friends, wrong with a stranger.',
    tag: 'Dropped letters',
  },
  {
    msg: 'jte rappelle dans 5 min',
    tidy: 'Je te rappelle dans cinq minutes.',
    en: 'I’ll call you back in five minutes.',
    note: 'je te becomes jte; numbers stay as digits.',
    tag: 'Dropped letters',
  },
  {
    msg: 'ptet qu’il a oublié',
    tidy: 'Peut-être qu’il a oublié.',
    en: 'Maybe he forgot.',
    note: 'ptet is peut-être with the middle taken out.',
    tag: 'Dropped letters',
  },
  {
    msg: 'y avait trop de monde on est partis',
    tidy: 'Il y avait trop de monde, donc on est partis.',
    en: 'It was too crowded, so we left.',
    note: 'Two clauses, no conjunction: the comma does the work of donc.',
    tag: 'Dropped letters',
  },
  {
    msg: 'ça va aller t’inquiète',
    tidy: 'Ça va aller, ne t’inquiète pas.',
    en: 'It’ll be fine, don’t worry.',
    note: 't’inquiète is a whole negative imperative with the negative removed.',
    tag: 'Dropped letters',
  },
  {
    msg: 'jarrive dans 2 min désolé',
    tidy: 'J’arrive dans deux minutes, désolé.',
    en: 'I’ll be there in two minutes, sorry.',
    note: 'The apostrophe goes missing before anything else does.',
    tag: 'Dropped letters',
  },

  // ------------------------------------------------------------- No ne
  {
    msg: 'je sais pas si je peux venir',
    tidy: 'Je ne sais pas si je peux venir.',
    en: 'I don’t know if I can come.',
    note: 'Spoken French drops ne almost always. Keep it when you write properly.',
    tag: 'No ne',
  },
  {
    msg: 'c’est pas grave',
    tidy: 'Ce n’est pas grave.',
    en: 'It doesn’t matter.',
    note: 'ce n’est pas becomes c’est pas — one of the commonest things you will hear.',
    tag: 'No ne',
  },
  {
    msg: 'j’ai rien dit moi',
    tidy: 'Je n’ai rien dit, moi.',
    en: 'I didn’t say anything.',
    note: 'moi tacked on the end puts the stress on who: it was not me.',
    tag: 'No ne',
  },
  {
    msg: 'il veut plus en parler',
    tidy: 'Il ne veut plus en parler.',
    en: 'He doesn’t want to talk about it any more.',
    note: 'Without the ne, plus is the only thing carrying the negative.',
    tag: 'No ne',
  },
  {
    msg: 'y a plus rien au frigo',
    tidy: 'Il n’y a plus rien dans le frigo.',
    en: 'There’s nothing left in the fridge.',
    note: 'plus rien: two negatives stacking, and no ne in sight.',
    tag: 'No ne',
  },
  {
    msg: 'jamais je ferais ça',
    tidy: 'Jamais je ne ferais ça.',
    en: 'I’d never do that.',
    note: 'jamais moved to the front for emphasis, and the ne dropped after it.',
    tag: 'No ne',
  },
  {
    msg: 'personne m’a prévenu',
    tidy: 'Personne ne m’a prévenu.',
    en: 'Nobody told me.',
    note: 'The ne belongs here even in speech, and it still goes missing.',
    tag: 'No ne',
  },
  {
    msg: 'c’est pas faux',
    tidy: 'Ce n’est pas faux.',
    en: 'Fair point.',
    note: 'A grudging agreement: "you’re not wrong".',
    tag: 'No ne',
  },
  {
    msg: 'je peux pas ce soir désolé',
    tidy: 'Je ne peux pas ce soir, désolé.',
    en: 'I can’t tonight, sorry.',
    note: 'The standard way of turning something down.',
    tag: 'No ne',
  },
  {
    msg: 't’as pas oublié j’espère',
    tidy: 'Tu n’as pas oublié, j’espère ?',
    en: 'You haven’t forgotten, I hope?',
    note: 'j’espère on the end turns a statement into a hopeful question.',
    tag: 'No ne',
  },
  {
    msg: 'il m’a même pas répondu',
    tidy: 'Il ne m’a même pas répondu.',
    en: 'He didn’t even answer me.',
    note: 'même pas sits inside the negative, before the participle.',
    tag: 'No ne',
  },
  {
    msg: 'ça sert à rien d’insister',
    tidy: 'Ça ne sert à rien d’insister.',
    en: 'There’s no point pushing it.',
    note: 'ça sert à rien is the everyday form of "it’s pointless".',
    tag: 'No ne',
  },

  // ----------------------------------------------------------- Texting
  {
    msg: 'slt ça va',
    tidy: 'Salut, ça va ?',
    en: 'Hi, how are you?',
    note: 'slt is salut. Vowels are the first casualty.',
    tag: 'Texting',
  },
  {
    msg: 'mdr t’es sérieux',
    tidy: 'Je rigole ! Tu es sérieux ?',
    en: 'Haha — are you serious?',
    note: 'mdr is the French lol. ptdr is the stronger one.',
    tag: 'Texting',
  },
  {
    msg: 'dsl jpeux pas ce soir',
    tidy: 'Désolé, je ne peux pas ce soir.',
    en: 'Sorry, I can’t tonight.',
    note: 'dsl is désolé, jpeux is je peux.',
    tag: 'Texting',
  },
  {
    msg: 'tkt c’est bon',
    tidy: 'Ne t’inquiète pas, c’est bon.',
    en: 'Don’t worry, it’s sorted.',
    note: 'tkt is t’inquiète, itself already short for ne t’inquiète pas.',
    tag: 'Texting',
  },
  {
    msg: 'stp tu peux me rappeler',
    tidy: 'S’il te plaît, tu peux me rappeler ?',
    en: 'Please can you call me back?',
    note: 'stp is s’il te plaît; svp is the vous version.',
    tag: 'Texting',
  },
  {
    msg: 'rdv à 19h devant le ciné',
    tidy: 'Rendez-vous à dix-neuf heures devant le cinéma.',
    en: 'Meet at seven outside the cinema.',
    note: '19h is seven in the evening. ciné is cinéma, resto is restaurant.',
    tag: 'Texting',
  },
  {
    msg: 'bcp de boulot cette semaine',
    tidy: 'Beaucoup de travail cette semaine.',
    en: 'Lots of work this week.',
    note: 'bcp is beaucoup; boulot is the everyday word for work.',
    tag: 'Texting',
  },
  {
    msg: 'jte tiens au courant',
    tidy: 'Je te tiens au courant.',
    en: 'I’ll keep you posted.',
    note: 'tenir quelqu’un au courant is to keep someone informed.',
    tag: 'Texting',
  },
  {
    msg: 'ok nickel à demain',
    tidy: 'D’accord, parfait. À demain.',
    en: 'OK great, see you tomorrow.',
    note: 'nickel means spot on. Three sentences arrive as one line.',
    tag: 'Texting',
  },
  {
    msg: 'jsp si j’ai le time',
    tidy: 'Je ne sais pas si j’ai le temps.',
    en: 'Not sure I have the time.',
    note: 'An English word dropped in on purpose — common, and not a mistake.',
    tag: 'Texting',
  },
  {
    msg: 'chui dead de fatigue',
    tidy: 'Je suis mort de fatigue.',
    en: 'I’m dead tired.',
    note: 'chui is je suis, and dead is doing the job of mort.',
    tag: 'Texting',
  },
  {
    msg: 'on se capte ce week-end',
    tidy: 'On se voit ce week-end ?',
    en: 'Shall we catch up this weekend?',
    note: 'se capter is to get together. on is nous, as ever.',
    tag: 'Texting',
  },
];

const slug = (value) => value.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const MESSAGES = RAW.map((entry) => ({ ...entry, id: slug(entry.msg) }));

export const MESSAGE_BY_ID = new Map(MESSAGES.map((message) => [message.id, message]));

export const messagesForTags = (tags) =>
  MESSAGES.filter((message) => tags.includes(message.tag));
