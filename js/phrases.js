/**
 * Everyday French phrases: the sentences you actually need in a shop, at a
 * station or across a table.
 *
 * Not idioms. `js/expressions.js` holds the expressions whose meaning you
 * could never guess from the words; this file holds the ordinary sentences
 * whose words you know and whose shape you do not — *combien ça coûte* is
 * not a puzzle, it is a thing you have to be able to say without assembling
 * it from grammar first.
 *
 * Which is why these cards run the other way round by default: you are shown
 * the English and asked for the French, because that is the direction a
 * conversation asks for. The reverse is there too, for the half of a
 * conversation that is said to you.
 *
 * Like the expressions, they are not typed. There are usually three ways to
 * say the same thing and no honest way to mark between them — so the
 * alternatives are listed on the answer instead, and you grade yourself.
 *
 * `note` carries the trap where there is one: the words that change for a
 * feminine speaker, the tu form, the false friend. Everything is in the
 * vous form unless it would be strange, since that is what you want with a
 * stranger.
 */

export const TOPICS = [
  'Greetings', 'Getting around', 'Shopping', 'Eating out',
  'Understanding', 'Small talk', 'Problems',
];

const RAW = [
  // ----------------------------------------------------------- Greetings
  {
    en: 'Hello, how are you?', fr: 'Bonjour, comment allez-vous ?',
    alt: ['Bonjour, comment ça va ?'], topic: 'Greetings',
    note: 'Comment ça va ? with anyone you would call tu.',
    reply: 'Très bien, merci. Et vous ?',
    replyEn: 'Very well, thank you. And you?',
  },
  {
    en: 'How’s it going?', fr: 'Ça va ?', register: 'familier', topic: 'Greetings',
    note: 'Also the answer: Ça va, merci.',
    reply: 'Ça va, et toi ?',
    replyEn: 'Fine — and you?',
  },
  {
    en: 'Good evening.', fr: 'Bonsoir.', topic: 'Greetings',
    note: 'From about six o’clock; bonne soirée is what you say leaving.',
  },
  {
    en: 'Nice to meet you.', fr: 'Enchanté.',
    alt: ['Ravi de vous rencontrer.'], topic: 'Greetings',
    note: 'Enchantée in the feminine — said the same way.',
  },
  {
    en: 'What’s your name?', fr: 'Comment vous appelez-vous ?',
    alt: ['Vous vous appelez comment ?'], topic: 'Greetings',
    note: 'Tu t’appelles comment ? with someone your own age.',
    reply: 'Je m’appelle Claire. Et vous ?',
    replyEn: 'My name is Claire. And you?',
  },
  {
    en: 'My name is Claire.', fr: 'Je m’appelle Claire.', topic: 'Greetings',
  },
  {
    en: 'Excuse me.', fr: 'Excusez-moi.', alt: ['Pardon.'], topic: 'Greetings',
    note: 'For getting attention. Pardon is also what you say squeezing past.',
  },
  {
    en: 'I’m sorry.', fr: 'Je suis désolé.', alt: ['Désolé.'], topic: 'Greetings',
    note: 'Désolée in the feminine.',
  },
  {
    en: 'Thank you very much.', fr: 'Merci beaucoup.', topic: 'Greetings',
  },
  {
    en: 'You’re welcome.', fr: 'De rien.',
    alt: ['Je vous en prie.'], topic: 'Greetings',
    note: 'Je vous en prie is the polite one; de rien is what you hear most.',
  },
  {
    en: 'Please.', fr: 'S’il vous plaît.', topic: 'Greetings',
    note: 'S’il te plaît with anyone you call tu.',
  },
  {
    en: 'Goodbye.', fr: 'Au revoir.', topic: 'Greetings',
  },
  {
    en: 'See you tomorrow.', fr: 'À demain.', topic: 'Greetings',
    note: 'Same shape for the rest: à lundi, à ce soir, à la semaine prochaine.',
  },
  {
    en: 'See you soon.', fr: 'À bientôt.', topic: 'Greetings',
  },
  {
    en: 'Have a good day.', fr: 'Bonne journée.', topic: 'Greetings',
    note: 'The standard goodbye in a shop, after au revoir.',
  },
  {
    en: 'Good luck!', fr: 'Bonne chance !', topic: 'Greetings',
  },

  // ------------------------------------------------------ Getting around
  {
    en: 'Where are the toilets?', fr: 'Où sont les toilettes ?', topic: 'Getting around',
    note: 'Always plural.',
    reply: 'Au fond à droite.',
    replyEn: 'At the back on the right.',
  },
  {
    en: 'Where is the station?', fr: 'Où est la gare ?', topic: 'Getting around',
    note: 'La gare is trains; la station is the metro.',
    reply: 'Tout droit, à cinq minutes.',
    replyEn: 'Straight on, five minutes away.',
  },
  {
    en: 'Is it far from here?', fr: 'C’est loin d’ici ?', topic: 'Getting around',
    reply: 'Non, c’est à dix minutes à pied.',
    replyEn: 'No, it’s ten minutes on foot.',
  },
  {
    en: 'How do I get to the town centre?', fr: 'Comment aller au centre-ville ?',
    alt: ['Comment je fais pour aller au centre-ville ?'], topic: 'Getting around',
    reply: 'Prenez le bus numéro quatre.',
    replyEn: 'Take the number four bus.',
  },
  {
    en: 'I’m lost.', fr: 'Je suis perdu.', topic: 'Getting around',
    note: 'Perdue in the feminine.',
  },
  {
    en: 'A ticket to Lyon, please.', fr: 'Un billet pour Lyon, s’il vous plaît.',
    topic: 'Getting around',
    note: 'Un billet for a train, un ticket for the metro or bus.',
  },
  {
    en: 'Which platform is it?', fr: 'C’est quel quai ?', topic: 'Getting around',
    reply: 'Quai numéro sept.',
    replyEn: 'Platform seven.',
  },
  {
    en: 'What time does the train leave?', fr: 'Le train part à quelle heure ?',
    alt: ['À quelle heure part le train ?'], topic: 'Getting around',
    reply: 'À dix heures vingt.',
    replyEn: 'At twenty past ten.',
  },
  {
    en: 'Does this bus go to the airport?', fr: 'Ce bus va à l’aéroport ?',
    topic: 'Getting around',
    reply: 'Non, il faut prendre le vingt-deux.',
    replyEn: 'No, you need the twenty-two.',
  },
  {
    en: 'Is this seat taken?', fr: 'Cette place est prise ?', topic: 'Getting around',
    reply: 'Non, allez-y.',
    replyEn: 'No, go ahead.',
  },
  {
    en: 'Could you show me on the map?', fr: 'Vous pouvez me montrer sur le plan ?',
    topic: 'Getting around',
    note: 'Un plan is a street map; une carte is a map of a region.',
    reply: 'Bien sûr. Nous sommes ici.',
    replyEn: 'Of course. We are here.',
  },
  {
    en: 'It’s on the left.', fr: 'C’est à gauche.', topic: 'Getting around',
    note: 'And à droite on the right.',
  },
  {
    en: 'Straight ahead.', fr: 'Tout droit.', topic: 'Getting around',
    note: 'Tout droit is straight on; à droite is to the right.',
  },
  {
    en: 'Where can I find a taxi?', fr: 'Où est-ce que je peux trouver un taxi ?',
    topic: 'Getting around',
    reply: 'Il y a une station devant la gare.',
    replyEn: 'There’s a rank in front of the station.',
  },
  {
    en: 'How long does it take?', fr: 'Ça prend combien de temps ?', topic: 'Getting around',
    reply: 'Une vingtaine de minutes.',
    replyEn: 'About twenty minutes.',
  },
  {
    en: 'I’d like to book a room.', fr: 'Je voudrais réserver une chambre.',
    topic: 'Getting around',
    note: 'Je voudrais is the polite way to ask for anything.',
  },

  // ------------------------------------------------------------ Shopping
  {
    en: 'How much does this cost?', fr: 'Combien ça coûte ?',
    alt: ['C’est combien ?', 'Ça coûte combien ?'], topic: 'Shopping',
    reply: 'Ça fait douze euros cinquante.',
    replyEn: 'That’s twelve euros fifty.',
  },
  {
    en: 'I’m just looking, thank you.', fr: 'Je regarde, merci.', topic: 'Shopping',
    note: 'What to say when a shop assistant offers help.',
  },
  {
    en: 'Can I help you?', fr: 'Je peux vous aider ?', topic: 'Shopping',
    note: 'Said to you, not by you — worth knowing on hearing.',
    reply: 'Non merci, je regarde.',
    replyEn: 'No thank you, I’m just looking.',
  },
  {
    en: 'Do you have this in another size?', fr: 'Vous l’avez dans une autre taille ?',
    topic: 'Shopping',
    note: 'La taille for clothes, la pointure for shoes.',
    reply: 'Je vais voir en réserve.',
    replyEn: 'I’ll have a look out the back.',
  },
  {
    en: 'Can I try it on?', fr: 'Je peux l’essayer ?', topic: 'Shopping',
    reply: 'Bien sûr, les cabines sont au fond.',
    replyEn: 'Of course, the changing rooms are at the back.',
  },
  {
    en: 'I’ll take it.', fr: 'Je le prends.', topic: 'Shopping',
    note: 'Je la prends for something feminine.',
  },
  {
    en: 'Can I pay by card?', fr: 'Je peux payer par carte ?', topic: 'Shopping',
    reply: 'Oui, à partir de dix euros.',
    replyEn: 'Yes, on anything over ten euros.',
  },
  {
    en: 'Do you take cash?', fr: 'Vous acceptez les espèces ?', topic: 'Shopping',
    note: 'Les espèces, or more casually du liquide.',
    reply: 'Oui, bien sûr.',
    replyEn: 'Yes, of course.',
  },
  {
    en: 'That’s too expensive.', fr: 'C’est trop cher.', topic: 'Shopping',
  },
  {
    en: 'Do you have a bag?', fr: 'Vous avez un sac ?', topic: 'Shopping',
    reply: 'Oui, un grand ou un petit ?',
    replyEn: 'Yes — a big one or a small one?',
  },
  {
    en: 'Could I have a receipt?', fr: 'Je peux avoir un reçu, s’il vous plaît ?',
    topic: 'Shopping',
    reply: 'Oui, le voici.',
    replyEn: 'Yes, here it is.',
  },
  {
    en: 'What time do you close?', fr: 'Vous fermez à quelle heure ?', topic: 'Shopping',
    reply: 'À dix-neuf heures.',
    replyEn: 'At seven in the evening.',
  },
  {
    en: 'Are you open on Sunday?', fr: 'Vous êtes ouverts le dimanche ?', topic: 'Shopping',
    note: 'Le dimanche with the article means every Sunday.',
    reply: 'Oui, mais seulement le matin.',
    replyEn: 'Yes, but only in the morning.',
  },
  {
    en: 'I’m looking for a present.', fr: 'Je cherche un cadeau.', topic: 'Shopping',
    note: 'Chercher already means to look for — no preposition after it.',
  },
  {
    en: 'Anything else?', fr: 'Ce sera tout ?', topic: 'Shopping',
    note: 'What the person behind the counter asks. Answer: c’est tout, merci.',
    reply: 'Oui, c’est tout, merci.',
    replyEn: 'Yes, that’s everything, thank you.',
  },

  // ---------------------------------------------------------- Eating out
  {
    en: 'A table for two, please.', fr: 'Une table pour deux, s’il vous plaît.',
    topic: 'Eating out',
  },
  {
    en: 'Do you have a table free?', fr: 'Vous avez une table de libre ?',
    topic: 'Eating out',
    reply: 'Oui, pour combien de personnes ?',
    replyEn: 'Yes — for how many?',
  },
  {
    en: 'Could we see the menu?', fr: 'On peut avoir la carte ?', topic: 'Eating out',
    note: 'La carte is the menu; le menu is a set meal at a fixed price.',
    reply: 'Je vous l’apporte tout de suite.',
    replyEn: 'I’ll bring it right away.',
  },
  {
    en: 'What do you recommend?', fr: 'Qu’est-ce que vous me conseillez ?',
    topic: 'Eating out',
    reply: 'Le plat du jour est très bon.',
    replyEn: 'The dish of the day is very good.',
  },
  {
    en: 'I’ll have the fish.', fr: 'Je vais prendre le poisson.',
    alt: ['Je prendrai le poisson.'], topic: 'Eating out',
  },
  {
    en: 'I’d like a coffee, please.', fr: 'Je voudrais un café, s’il vous plaît.',
    topic: 'Eating out',
    note: 'Un café on its own is an espresso.',
  },
  {
    en: 'Is there meat in it?', fr: 'Il y a de la viande dedans ?', topic: 'Eating out',
    reply: 'Non, c’est végétarien.',
    replyEn: 'No, it’s vegetarian.',
  },
  {
    en: 'I’m vegetarian.', fr: 'Je suis végétarien.', topic: 'Eating out',
    note: 'Végétarienne in the feminine.',
  },
  {
    en: 'Tap water, please.', fr: 'Une carafe d’eau, s’il vous plaît.', topic: 'Eating out',
    note: 'Free everywhere, and this is how you ask for it.',
  },
  {
    en: 'Still or sparkling?', fr: 'Plate ou gazeuse ?', topic: 'Eating out',
    note: 'Asked about water, so the adjectives are feminine.',
    reply: 'Plate, s’il vous plaît.',
    replyEn: 'Still, please.',
  },
  {
    en: 'The same again, please.', fr: 'La même chose, s’il vous plaît.',
    topic: 'Eating out',
  },
  {
    en: 'Can we sit outside?', fr: 'On peut s’asseoir en terrasse ?', topic: 'Eating out',
    reply: 'Oui, installez-vous.',
    replyEn: 'Yes, take a seat outside.',
  },
  {
    en: 'The bill, please.', fr: 'L’addition, s’il vous plaît.', topic: 'Eating out',
    note: 'L’addition in a restaurant; la note in a hotel.',
  },
  {
    en: 'It was delicious.', fr: 'C’était délicieux.', topic: 'Eating out',
  },

  // ------------------------------------------------------- Understanding
  {
    en: 'I don’t understand.', fr: 'Je ne comprends pas.',
    alt: ['Je comprends pas.'], topic: 'Understanding',
    note: 'The ne is dropped in speech all the time — but keep it in writing.',
  },
  {
    en: 'Could you repeat that, please?', fr: 'Vous pouvez répéter, s’il vous plaît ?',
    alt: ['Pouvez-vous répéter, s’il vous plaît ?'], topic: 'Understanding',
    reply: 'Oui, je disais que c’est fermé le lundi.',
    replyEn: 'Yes — I was saying it’s closed on Mondays.',
  },
  {
    en: 'Could you speak more slowly?', fr: 'Vous pouvez parler plus lentement ?',
    alt: ['Vous pouvez parler moins vite ?'], topic: 'Understanding',
    reply: 'Oui, pardon, je parle trop vite.',
    replyEn: 'Yes, sorry, I talk too fast.',
  },
  {
    en: 'Do you speak English?', fr: 'Vous parlez anglais ?', topic: 'Understanding',
    note: 'No article: parler anglais, not parler l’anglais.',
    reply: 'Un peu, oui.',
    replyEn: 'A little, yes.',
  },
  {
    en: 'I don’t speak French very well.', fr: 'Je ne parle pas très bien français.',
    topic: 'Understanding',
  },
  {
    en: 'I’m learning French.', fr: 'J’apprends le français.', topic: 'Understanding',
    note: 'Here the article comes back: apprendre le français.',
  },
  {
    en: 'How do you say this in French?', fr: 'Comment on dit ça en français ?',
    alt: ['Comment dit-on ça en français ?'], topic: 'Understanding',
    reply: 'On dit « une gomme ».',
    replyEn: 'You say “une gomme”.',
  },
  {
    en: 'What does that mean?', fr: 'Qu’est-ce que ça veut dire ?',
    alt: ['Ça veut dire quoi ?'], topic: 'Understanding',
    reply: 'Ça veut dire « fermé ».',
    replyEn: 'It means “closed”.',
  },
  {
    en: 'What’s this called?', fr: 'Comment ça s’appelle ?', topic: 'Understanding',
    reply: 'Ça s’appelle une cafetière.',
    replyEn: 'It’s called a cafetière.',
  },
  {
    en: 'Could you write it down for me?', fr: 'Vous pouvez me l’écrire ?',
    topic: 'Understanding',
    reply: 'Oui, je vous note ça.',
    replyEn: 'Yes, I’ll write it down for you.',
  },
  {
    en: 'Sorry, I didn’t catch that.', fr: 'Pardon, je n’ai pas compris.',
    topic: 'Understanding',
  },
  {
    en: 'Is that right?', fr: 'C’est ça ?', topic: 'Understanding',
    note: 'And the answer you want back: c’est ça, or voilà.',
    reply: 'Oui, voilà, c’est ça.',
    replyEn: 'Yes, that’s it exactly.',
  },
  {
    en: 'How do you spell it?', fr: 'Ça s’écrit comment ?', topic: 'Understanding',
    reply: 'Ça s’écrit C-L-A-I-R-E.',
    replyEn: 'It’s spelt C-L-A-I-R-E.',
  },
  {
    en: 'One moment, please.', fr: 'Un instant, s’il vous plaît.', topic: 'Understanding',
  },

  // ---------------------------------------------------------- Small talk
  {
    en: 'Where are you from?', fr: 'Vous venez d’où ?',
    alt: ['D’où venez-vous ?'], topic: 'Small talk',
    reply: 'Je viens d’Angleterre.',
    replyEn: 'I’m from England.',
  },
  {
    en: 'I’m English.', fr: 'Je suis anglais.', topic: 'Small talk',
    note: 'Anglaise in the feminine, and no capital letter on the adjective.',
  },
  {
    en: 'I’m here on holiday.', fr: 'Je suis ici en vacances.', topic: 'Small talk',
    note: 'Vacances is always plural.',
  },
  {
    en: 'How long have you been here?', fr: 'Vous êtes ici depuis combien de temps ?',
    topic: 'Small talk',
    note: 'French uses the present with depuis where English uses "have been".',
    reply: 'Depuis trois jours.',
    replyEn: 'Three days now.',
  },
  {
    en: 'What do you do for a living?', fr: 'Qu’est-ce que vous faites dans la vie ?',
    topic: 'Small talk',
    reply: 'Je suis ingénieur.',
    replyEn: 'I’m an engineer.',
  },
  {
    en: 'Do you live here?', fr: 'Vous habitez ici ?', topic: 'Small talk',
    reply: 'Non, je suis de passage.',
    replyEn: 'No, I’m just passing through.',
  },
  {
    en: 'It’s a beautiful place.', fr: 'C’est un endroit magnifique.', topic: 'Small talk',
  },
  {
    en: 'The weather is lovely today.', fr: 'Il fait beau aujourd’hui.', topic: 'Small talk',
    note: 'Weather is il fait: il fait chaud, il fait gris.',
  },
  {
    en: 'It’s cold.', fr: 'Il fait froid.', topic: 'Small talk',
    note: 'J’ai froid is I am cold; il fait froid is the weather.',
  },
  {
    en: 'Would you like something to drink?', fr: 'Vous voulez boire quelque chose ?',
    topic: 'Small talk',
    reply: 'Volontiers, un café.',
    replyEn: 'I’d love one — a coffee.',
  },
  {
    en: 'I agree.', fr: 'Je suis d’accord.', topic: 'Small talk',
  },
  {
    en: 'I don’t mind either way.', fr: 'Ça m’est égal.', topic: 'Small talk',
  },
  {
    en: 'It depends.', fr: 'Ça dépend.', topic: 'Small talk',
  },
  {
    en: 'What a shame.', fr: 'Quel dommage.', alt: ['Dommage.'], topic: 'Small talk',
  },
  {
    en: 'I don’t know.', fr: 'Je ne sais pas.', alt: ['Je sais pas.'],
    topic: 'Small talk',
  },

  // ------------------------------------------------------------ Problems
  {
    en: 'Can you help me?', fr: 'Vous pouvez m’aider ?',
    alt: ['Pouvez-vous m’aider ?'], topic: 'Problems',
    reply: 'Bien sûr, qu’est-ce qu’il y a ?',
    replyEn: 'Of course — what’s the matter?',
  },
  {
    en: 'I need a doctor.', fr: 'J’ai besoin d’un médecin.', topic: 'Problems',
    note: 'Avoir besoin de — the de stays whatever follows.',
  },
  {
    en: 'Call an ambulance!', fr: 'Appelez une ambulance !', topic: 'Problems',
  },
  {
    en: 'I’ve lost my wallet.', fr: 'J’ai perdu mon portefeuille.', topic: 'Problems',
  },
  {
    en: 'Someone has stolen my bag.', fr: 'On m’a volé mon sac.', topic: 'Problems',
    note: 'French says it this way round: someone stole it to me.',
  },
  {
    en: 'It doesn’t work.', fr: 'Ça ne marche pas.', alt: ['Ça marche pas.'],
    topic: 'Problems',
  },
  {
    en: 'I don’t feel well.', fr: 'Je ne me sens pas bien.', topic: 'Problems',
  },
  {
    en: 'Where is the nearest chemist?', fr: 'Où est la pharmacie la plus proche ?',
    topic: 'Problems',
    reply: 'Au bout de la rue, sur la gauche.',
    replyEn: 'At the end of the street, on the left.',
  },
  {
    en: 'I have an appointment.', fr: 'J’ai rendez-vous.', topic: 'Problems',
    note: 'No article: avoir rendez-vous.',
  },
  {
    en: 'I’m allergic to nuts.', fr: 'Je suis allergique aux fruits à coque.',
    topic: 'Problems',
    note: 'Fruits à coque is nuts in general; noix on its own means walnuts.',
  },
  {
    en: 'There’s a problem with the heating.', fr: 'Il y a un problème avec le chauffage.',
    topic: 'Problems',
  },
  {
    en: 'Could I use your phone?', fr: 'Je peux utiliser votre téléphone ?',
    topic: 'Problems',
    reply: 'Oui, tenez.',
    replyEn: 'Yes, here you are.',
  },
  {
    en: 'Leave me alone.', fr: 'Laissez-moi tranquille.', topic: 'Problems',
  },
  {
    en: 'Watch out!', fr: 'Attention !', topic: 'Problems',
  },
  {
    en: 'I’ve missed my train.', fr: 'J’ai raté mon train.', topic: 'Problems',
  },
];

/** An id that survives being reordered: the French itself, slugged. */
const slug = (value) => value.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const PHRASES = RAW.map((phrase) => ({ ...phrase, id: slug(phrase.fr) }));

export const PHRASE_BY_ID = new Map(PHRASES.map((phrase) => [phrase.id, phrase]));

export const phrasesForTopics = (topics) =>
  PHRASES.filter((phrase) => topics.includes(phrase.topic));
