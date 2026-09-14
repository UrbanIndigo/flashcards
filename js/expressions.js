/**
 * French expressions, each shown inside a sentence.
 *
 * An expression on its own is a dictionary entry; an expression in a
 * sentence is the thing you actually meet. "Avoir le cafard" tells you
 * nothing about how it turns up — *il a le cafard*, *j'ai eu le cafard* —
 * so every entry here carries a sentence built around it, with the
 * expression marked by square brackets and the brackets stripped when the
 * file loads.
 *
 * These cards are not typed. Translating an idiom has too many right
 * answers to mark — *fed up*, *sick of it*, *had enough* are all the same
 * answer — so the card shows the meaning and you say whether you had it.
 *
 * Written for this app: the expressions are common property, the sentences
 * are not borrowed from anywhere.
 *
 * `literal` is the word-for-word reading, which is usually the reason the
 * expression sticks. `register` is only given where it matters — most of
 * these are ordinary spoken French, but a few would be out of place in a
 * letter to your landlord.
 */

export const THEMES = ['Everyday', 'Feelings', 'People', 'Work', 'Trouble'];

const RAW = [
  // ------------------------------------------------------------ Everyday
  {
    fr: 'ça marche', en: 'that works, sounds good', literal: 'it walks',
    theme: 'Everyday',
    sentence: '— On se retrouve devant le cinéma à huit heures ? — [Ça marche].',
    english: '"Shall we meet outside the cinema at eight?" "That works."',
  },
  {
    fr: 'du coup', en: 'so, as a result', literal: 'from the blow',
    theme: 'Everyday',
    sentence: 'J’ai raté mon train, [du coup] je suis arrivé une heure en retard.',
    english: 'I missed my train, so I turned up an hour late.',
  },
  {
    fr: 'n’importe quoi', en: 'nonsense, rubbish', literal: 'no matter what',
    theme: 'Everyday',
    sentence: 'Ne l’écoute pas, il raconte [n’importe quoi].',
    english: 'Don’t listen to him, he’s talking nonsense.',
  },
  {
    fr: 'laisser tomber', en: 'to drop it, to give up on something',
    literal: 'to let fall', theme: 'Everyday',
    sentence: 'Si c’est trop compliqué à expliquer, [laisse tomber].',
    english: 'If it’s too complicated to explain, forget it.',
  },
  {
    fr: 'ça vaut le coup', en: 'it’s worth it', literal: 'it is worth the blow',
    theme: 'Everyday',
    sentence: 'Le musée est loin du centre, mais [ça vaut le coup].',
    english: 'The museum is a long way from the centre, but it’s worth it.',
  },
  {
    fr: 'jeter un coup d’œil', en: 'to have a quick look',
    literal: 'to throw a blow of the eye', theme: 'Everyday',
    sentence: 'Tu peux [jeter un coup d’œil] à ma lettre avant que je l’envoie ?',
    english: 'Can you have a quick look at my letter before I send it?',
  },
  {
    fr: 'en un clin d’œil', en: 'in the blink of an eye',
    literal: 'in a wink of the eye', theme: 'Everyday',
    sentence: 'Le gâteau a disparu [en un clin d’œil].',
    english: 'The cake vanished in the blink of an eye.',
  },
  {
    fr: 'avoir la flemme', en: 'to not be bothered, to be too lazy',
    literal: 'to have the laziness', register: 'familier', theme: 'Everyday',
    sentence: 'Je devrais aller courir, mais [j’ai la flemme].',
    english: 'I ought to go for a run, but I can’t be bothered.',
  },
  {
    fr: 'faire la grasse matinée', en: 'to have a lie-in',
    literal: 'to do the fat morning', theme: 'Everyday',
    sentence: 'Le dimanche, on [fait la grasse matinée] jusqu’à midi.',
    english: 'On Sundays we have a lie-in until midday.',
  },
  {
    fr: 'faire le pont', en: 'to take the odd day off between a holiday and the weekend',
    literal: 'to make the bridge', theme: 'Everyday',
    sentence: 'Le jeudi est férié, alors beaucoup de gens [font le pont].',
    english: 'Thursday is a public holiday, so a lot of people take Friday off too.',
  },
  {
    fr: 'être à la bourre', en: 'to be running late',
    register: 'familier', theme: 'Everyday',
    sentence: 'Dépêche-toi, on [est à la bourre].',
    english: 'Hurry up, we’re running late.',
  },
  {
    fr: 'ça roule', en: 'it’s going fine, all good', literal: 'it rolls',
    register: 'familier', theme: 'Everyday',
    sentence: '— Comment se passe le nouveau travail ? — [Ça roule].',
    english: '"How’s the new job going?" "It’s going well."',
  },
  {
    fr: 'tenir le coup', en: 'to hold out, to cope', literal: 'to hold the blow',
    theme: 'Everyday',
    sentence: 'Encore deux heures de route : tu vas [tenir le coup] ?',
    english: 'Two more hours of driving — are you going to hold out?',
  },
  {
    fr: 'valoir le détour', en: 'to be worth going out of your way for',
    literal: 'to be worth the detour', theme: 'Everyday',
    sentence: 'Le village est minuscule, mais il [vaut le détour].',
    english: 'The village is tiny, but it’s worth the detour.',
  },
  {
    fr: 'avoir quelque chose sur le bout de la langue',
    en: 'to have something on the tip of your tongue',
    literal: 'on the end of the tongue', theme: 'Everyday',
    sentence: 'Attends, son nom va me revenir : je [l’ai sur le bout de la langue].',
    english: 'Hang on, his name will come back to me — it’s on the tip of my tongue.',
  },
  {
    fr: 'à vue de nez', en: 'at a rough guess', literal: 'by sight of nose',
    theme: 'Everyday',
    sentence: '[À vue de nez], il y avait une centaine de personnes dans la salle.',
    english: 'At a rough guess there were about a hundred people in the room.',
  },
  {
    fr: 'au fur et à mesure', en: 'as you go along, gradually',
    theme: 'Everyday',
    sentence: 'Je range la cuisine [au fur et à mesure] que je cuisine.',
    english: 'I tidy the kitchen as I go along while I cook.',
  },
  {
    fr: 'ça craint', en: 'that’s rough, that’s no good',
    literal: 'it fears', register: 'familier', theme: 'Everyday',
    sentence: 'Il a annulé une heure avant, [ça craint].',
    english: 'He cancelled an hour beforehand — that’s pretty poor.',
  },
  {
    fr: 'bon courage', en: 'good luck with it (with something hard ahead)',
    literal: 'good courage', theme: 'Everyday',
    sentence: 'Tu déménages toute seule demain ? [Bon courage] !',
    english: 'You’re moving house on your own tomorrow? Good luck!',
  },
  {
    fr: 'ça me dit bien', en: 'I like the sound of that',
    literal: 'it says to me well', register: 'familier', theme: 'Everyday',
    sentence: '— Un café avant de rentrer ? — Oui, [ça me dit bien].',
    english: '"A coffee before we head home?" "Yes, I like the sound of that."',
  },

  // ------------------------------------------------------------ Feelings
  {
    fr: 'avoir le cafard', en: 'to be feeling down',
    literal: 'to have the cockroach', theme: 'Feelings',
    sentence: 'Il pleut depuis une semaine et je commence à [avoir le cafard].',
    english: 'It has been raining for a week and I am starting to feel down.',
  },
  {
    fr: 'en avoir marre', en: 'to be fed up', register: 'familier', theme: 'Feelings',
    sentence: '[J’en ai marre] de faire la vaisselle tous les soirs.',
    english: 'I’m fed up with doing the washing-up every evening.',
  },
  {
    fr: 'en avoir ras le bol', en: 'to have had it up to here',
    literal: 'to have it level with the bowl', register: 'familier', theme: 'Feelings',
    sentence: '[Il en a ras le bol] des travaux dans l’immeuble.',
    english: 'He has had it up to here with the building work.',
  },
  {
    fr: 'avoir la pêche', en: 'to be full of energy', literal: 'to have the peach',
    register: 'familier', theme: 'Feelings',
    sentence: 'Tu [as la pêche] ce matin !',
    english: 'You’re full of beans this morning!',
  },
  {
    fr: 'être aux anges', en: 'to be over the moon', literal: 'to be with the angels',
    theme: 'Feelings',
    sentence: 'Depuis qu’elle a eu son concours, elle [est aux anges].',
    english: 'Since she passed her exam she has been over the moon.',
  },
  {
    fr: 'avoir le coup de foudre', en: 'to fall in love at first sight',
    literal: 'to have the lightning strike', theme: 'Feelings',
    sentence: 'Ils [ont eu le coup de foudre] à la fête de Marie.',
    english: 'They fell in love at first sight at Marie’s party.',
  },
  {
    fr: 'avoir le trac', en: 'to have stage fright, to have the jitters',
    theme: 'Feelings',
    sentence: 'Avant de monter sur scène, [j’ai toujours le trac].',
    english: 'Before going on stage I always get stage fright.',
  },
  {
    fr: 'péter les plombs', en: 'to lose it, to blow a fuse',
    literal: 'to blow the fuses', register: 'familier', theme: 'Feelings',
    sentence: 'Avec tout ce bruit, je vais finir par [péter les plombs].',
    english: 'With all this noise I’m going to end up losing it.',
  },
  {
    fr: 'se prendre la tête', en: 'to tie yourself in knots over something',
    literal: 'to take one’s head', register: 'familier', theme: 'Feelings',
    sentence: 'Ne [te prends pas la tête] pour si peu.',
    english: 'Don’t tie yourself in knots over something so small.',
  },
  {
    fr: 'broyer du noir', en: 'to brood, to be gloomy', literal: 'to grind black',
    theme: 'Feelings',
    sentence: 'Depuis son départ, il [broie du noir] à la maison.',
    english: 'Since she left he has been moping about at home.',
  },
  {
    fr: 'avoir un coup de barre', en: 'to suddenly feel shattered',
    literal: 'to take a blow from a bar', register: 'familier', theme: 'Feelings',
    sentence: 'Vers quinze heures, [j’ai toujours un coup de barre].',
    english: 'Around three o’clock I always hit a wall.',
  },
  {
    fr: 'être crevé', en: 'to be shattered, worn out', literal: 'to be punctured',
    register: 'familier', theme: 'Feelings',
    sentence: 'Après le déménagement, on [était crevés].',
    english: 'After the house move we were shattered.',
  },
  {
    fr: 'avoir la gueule de bois', en: 'to have a hangover',
    literal: 'to have the wooden mouth', register: 'familier', theme: 'Feelings',
    sentence: 'Il [a la gueule de bois] et ne veut voir personne.',
    english: 'He’s hung over and doesn’t want to see anyone.',
  },
  {
    fr: 'avoir la tête ailleurs', en: 'to have your mind elsewhere',
    literal: 'to have the head elsewhere', theme: 'Feelings',
    sentence: 'Excuse-moi, je n’ai pas écouté : [j’avais la tête ailleurs].',
    english: 'Sorry, I wasn’t listening — my mind was elsewhere.',
  },
  {
    fr: 'ne pas être dans son assiette', en: 'to be feeling off-colour',
    literal: 'not to be in one’s plate', theme: 'Feelings',
    sentence: 'Elle [n’est pas dans son assiette] depuis hier soir.',
    english: 'She hasn’t felt herself since last night.',
  },
  {
    fr: 'en avoir gros sur le cœur', en: 'to be heavy-hearted, to have a lot bottled up',
    literal: 'to have a lot on the heart', theme: 'Feelings',
    sentence: 'Il n’a rien dit de la soirée, mais [il en avait gros sur le cœur].',
    english: 'He said nothing all evening, but he had a lot bottled up.',
  },
  {
    fr: 'rire jaune', en: 'to give a hollow laugh, to laugh uncomfortably',
    literal: 'to laugh yellow', theme: 'Feelings',
    sentence: 'Quand on a parlé de son accident, il [a ri jaune].',
    english: 'When his accident came up, he gave a hollow laugh.',
  },
  {
    fr: 'avoir les boules', en: 'to be really annoyed, to be gutted',
    literal: 'to have the balls', register: 'très familier', theme: 'Feelings',
    sentence: '[Il a les boules] d’avoir raté le concert.',
    english: 'He’s gutted about missing the concert.',
  },
  {
    fr: 'être bien dans ses baskets', en: 'to be comfortable in your own skin',
    literal: 'to be well in one’s trainers', register: 'familier', theme: 'Feelings',
    sentence: 'À vingt ans, elle [est bien dans ses baskets].',
    english: 'At twenty she is comfortable in her own skin.',
  },

  // -------------------------------------------------------------- People
  {
    fr: 'poser un lapin à quelqu’un', en: 'to stand someone up',
    literal: 'to set a rabbit down for someone', theme: 'People',
    sentence: 'Elle m’a [posé un lapin] samedi soir.',
    english: 'She stood me up on Saturday night.',
  },
  {
    fr: 'avoir un poil dans la main', en: 'to be bone idle',
    literal: 'to have a hair in the hand', theme: 'People',
    sentence: 'Ce garçon ne fera rien : il [a un poil dans la main].',
    english: 'That boy won’t do a thing — he’s bone idle.',
  },
  {
    fr: 'être une bonne poire', en: 'to be a soft touch, to be easily taken advantage of',
    literal: 'to be a good pear', register: 'familier', theme: 'People',
    sentence: 'Il prête son argent à tout le monde : c’est [une bonne poire].',
    english: 'He lends money to anyone — he’s a soft touch.',
  },
  {
    fr: 'faire la tête', en: 'to sulk', literal: 'to do the head', theme: 'People',
    sentence: 'Il [fait la tête] depuis que j’ai refusé de l’accompagner.',
    english: 'He has been sulking since I refused to go with him.',
  },
  {
    fr: 'se serrer les coudes', en: 'to stick together, to support each other',
    literal: 'to squeeze one’s elbows together', theme: 'People',
    sentence: 'Dans cette famille, on [se serre les coudes].',
    english: 'In this family we stick together.',
  },
  {
    fr: 'être copains comme cochons', en: 'to be the best of friends',
    literal: 'to be friends like pigs', register: 'familier', theme: 'People',
    sentence: 'Depuis l’école primaire, ils [sont copains comme cochons].',
    english: 'They have been thick as thieves since primary school.',
  },
  {
    fr: 'tenir la chandelle', en: 'to be the third wheel',
    literal: 'to hold the candle', theme: 'People',
    sentence: 'Je ne viens pas au restaurant avec vous : je refuse de [tenir la chandelle].',
    english: 'I’m not coming to the restaurant with you — I refuse to be the third wheel.',
  },
  {
    fr: 'mettre son grain de sel', en: 'to stick your oar in',
    literal: 'to add one’s grain of salt', theme: 'People',
    sentence: 'Il faut toujours qu’il [mette son grain de sel] dans les affaires des autres.',
    english: 'He always has to stick his oar into other people’s business.',
  },
  {
    fr: 'casser les pieds à quelqu’un', en: 'to get on someone’s nerves',
    literal: 'to break someone’s feet', register: 'familier', theme: 'People',
    sentence: 'Arrête de [me casser les pieds] avec cette histoire.',
    english: 'Stop going on at me about it.',
  },
  {
    fr: 'avoir le bras long', en: 'to have friends in high places',
    literal: 'to have a long arm', theme: 'People',
    sentence: 'Pour obtenir un poste pareil, il faut [avoir le bras long].',
    english: 'To land a job like that you need connections.',
  },
  {
    fr: 'raconter des salades', en: 'to tell tall tales',
    literal: 'to tell salads', register: 'familier', theme: 'People',
    sentence: 'Ne le crois pas sur parole, il [raconte des salades].',
    english: 'Don’t take his word for it, he’s spinning you a yarn.',
  },
  {
    fr: 'prendre quelqu’un la main dans le sac', en: 'to catch someone red-handed',
    literal: 'to catch someone hand in the bag', theme: 'People',
    sentence: 'Le gardien l’a [pris la main dans le sac].',
    english: 'The guard caught him red-handed.',
  },
  {
    fr: 'donner sa langue au chat', en: 'to give up guessing',
    literal: 'to give one’s tongue to the cat', theme: 'People',
    sentence: 'Tu ne devines pas ? Tu [donnes ta langue au chat] ?',
    english: 'Can’t you guess? Do you give up?',
  },
  {
    fr: 'avoir d’autres chats à fouetter', en: 'to have other fish to fry',
    literal: 'to have other cats to whip', theme: 'People',
    sentence: 'Je ne vais pas m’occuper de ça, [j’ai d’autres chats à fouetter].',
    english: 'I’m not going to deal with that, I have other fish to fry.',
  },
  {
    fr: 'être à côté de la plaque', en: 'to be wide of the mark, to have missed the point',
    literal: 'to be beside the plate', register: 'familier', theme: 'People',
    sentence: 'Sa réponse [était complètement à côté de la plaque].',
    english: 'His answer was completely wide of the mark.',
  },
  {
    fr: 'avoir la langue bien pendue', en: 'to be a chatterbox',
    literal: 'to have a well-hung tongue', theme: 'People',
    sentence: 'La petite [a la langue bien pendue] pour son âge.',
    english: 'The little one is quite the chatterbox for her age.',
  },
  {
    fr: 'arriver comme un cheveu sur la soupe', en: 'to turn up at the worst possible moment',
    literal: 'to arrive like a hair on the soup', theme: 'People',
    sentence: 'Sa remarque [est arrivée comme un cheveu sur la soupe].',
    english: 'His remark could not have come at a worse moment.',
  },
  {
    fr: 'faire la sourde oreille', en: 'to turn a deaf ear',
    literal: 'to do the deaf ear', theme: 'People',
    sentence: 'Je lui ai demandé trois fois, il [fait la sourde oreille].',
    english: 'I have asked him three times; he turns a deaf ear.',
  },
  {
    fr: 'être à cheval sur quelque chose', en: 'to be a stickler for something',
    literal: 'to be on horseback about something', theme: 'People',
    sentence: 'Ma grand-mère [est à cheval sur] la ponctualité.',
    english: 'My grandmother is a stickler for punctuality.',
  },
  {
    fr: 'passer un savon à quelqu’un', en: 'to give someone a telling-off',
    literal: 'to pass someone a soap', register: 'familier', theme: 'People',
    sentence: 'Le patron lui [a passé un savon] devant tout le monde.',
    english: 'The boss gave him a dressing-down in front of everyone.',
  },
  {
    fr: 'ne pas y aller de main morte', en: 'not to pull your punches',
    literal: 'not to go at it with a dead hand', theme: 'People',
    sentence: 'Dans sa critique, il [n’y est pas allé de main morte].',
    english: 'He didn’t pull his punches in his review.',
  },
  {
    fr: 'occupe-toi de tes oignons', en: 'mind your own business',
    literal: 'see to your own onions', register: 'familier', theme: 'People',
    sentence: 'Ce que je fais le week-end ne te regarde pas : [occupe-toi de tes oignons].',
    english: 'What I do at the weekend is none of your concern — mind your own business.',
  },

  // ---------------------------------------------------------------- Work
  {
    fr: 'avoir du pain sur la planche', en: 'to have a lot on your plate',
    literal: 'to have bread on the board', theme: 'Work',
    sentence: 'Avec ce dossier à rendre lundi, on [a du pain sur la planche].',
    english: 'With this file due on Monday, we have our work cut out.',
  },
  {
    fr: 'mettre la main à la pâte', en: 'to pitch in, to lend a hand',
    literal: 'to put one’s hand to the dough', theme: 'Work',
    sentence: 'Si tout le monde [met la main à la pâte], ce sera fini avant midi.',
    english: 'If everyone pitches in, it will be finished before midday.',
  },
  {
    fr: 'se creuser la tête', en: 'to rack your brains',
    literal: 'to hollow out one’s head', theme: 'Work',
    sentence: 'Je [me creuse la tête] depuis ce matin pour trouver un titre.',
    english: 'I have been racking my brains since this morning for a title.',
  },
  {
    fr: 'mettre les bouchées doubles', en: 'to step it up, to work twice as hard',
    literal: 'to take double mouthfuls', theme: 'Work',
    sentence: 'Avant la livraison, il va falloir [mettre les bouchées doubles].',
    english: 'Before the delivery date we will have to step things up.',
  },
  {
    fr: 'faire d’une pierre deux coups', en: 'to kill two birds with one stone',
    literal: 'to make two blows with one stone', theme: 'Work',
    sentence: 'En passant à la poste, [je fais d’une pierre deux coups].',
    english: 'By stopping at the post office I kill two birds with one stone.',
  },
  {
    fr: 'prendre le taureau par les cornes', en: 'to take the bull by the horns',
    theme: 'Work',
    sentence: 'Il a [pris le taureau par les cornes] et a tout réorganisé.',
    english: 'He took the bull by the horns and reorganised the whole thing.',
  },
  {
    fr: 'avoir plusieurs cordes à son arc', en: 'to have more than one string to your bow',
    theme: 'Work',
    sentence: 'Traductrice et photographe : elle [a plusieurs cordes à son arc].',
    english: 'A translator and a photographer — she has more than one string to her bow.',
  },
  {
    fr: 'c’est du gâteau', en: 'it’s a piece of cake', literal: 'it is cake',
    register: 'familier', theme: 'Work',
    sentence: 'Après la journée d’hier, [c’est du gâteau].',
    english: 'After yesterday, this is a piece of cake.',
  },
  {
    fr: 'les doigts dans le nez', en: 'easily, without breaking a sweat',
    literal: 'fingers in the nose', register: 'familier', theme: 'Work',
    sentence: 'Il a réussi l’examen [les doigts dans le nez].',
    english: 'He passed the exam without breaking a sweat.',
  },
  {
    fr: 'ce n’est pas la mer à boire', en: 'it’s not that big a deal',
    literal: 'it is not the sea to drink', theme: 'Work',
    sentence: 'Trois pages à relire, [ce n’est pas la mer à boire].',
    english: 'Three pages to read over — it’s hardly the end of the world.',
  },
  {
    fr: 'donner un coup de main', en: 'to give a hand',
    literal: 'to give a blow of the hand', theme: 'Work',
    sentence: 'Tu peux me [donner un coup de main] pour porter la table ?',
    english: 'Can you give me a hand carrying the table?',
  },
  {
    fr: 'être au taquet', en: 'to be going flat out',
    register: 'familier', theme: 'Work',
    sentence: 'Depuis la rentrée, elle [est au taquet].',
    english: 'Since term started she has been going flat out.',
  },
  {
    fr: 'avoir le nez creux', en: 'to have a good nose for something',
    literal: 'to have a hollow nose', theme: 'Work',
    sentence: 'Tu avais raison d’attendre : tu [as le nez creux].',
    english: 'You were right to wait — you have a good nose for these things.',
  },
  {
    fr: 'ça ne casse pas trois pattes à un canard', en: 'it’s nothing to write home about',
    literal: 'it doesn’t break three legs off a duck', register: 'familier', theme: 'Work',
    sentence: 'Le film était correct, mais [ça ne casse pas trois pattes à un canard].',
    english: 'The film was all right, but nothing to write home about.',
  },

  // ------------------------------------------------------------- Trouble
  {
    fr: 'tomber à l’eau', en: 'to fall through', literal: 'to fall in the water',
    theme: 'Trouble',
    sentence: 'Nos vacances en Corse [sont tombées à l’eau].',
    english: 'Our holiday in Corsica fell through.',
  },
  {
    fr: 'tomber dans les pommes', en: 'to faint', literal: 'to fall in the apples',
    register: 'familier', theme: 'Trouble',
    sentence: 'Il faisait si chaud qu’elle [est tombée dans les pommes].',
    english: 'It was so hot that she fainted.',
  },
  {
    fr: 'coûter les yeux de la tête', en: 'to cost an arm and a leg',
    literal: 'to cost the eyes out of the head', theme: 'Trouble',
    sentence: 'Cette voiture est belle, mais elle [coûte les yeux de la tête].',
    english: 'That car is lovely, but it costs an arm and a leg.',
  },
  {
    fr: 'la goutte d’eau qui fait déborder le vase', en: 'the last straw',
    literal: 'the drop of water that makes the vase overflow', theme: 'Trouble',
    sentence: 'Ce retard, c’[est la goutte d’eau qui fait déborder le vase].',
    english: 'This delay is the last straw.',
  },
  {
    fr: 'il y a anguille sous roche', en: 'there’s something fishy going on',
    literal: 'there is an eel under the rock', theme: 'Trouble',
    sentence: 'Il change de sujet dès qu’on l’interroge : [il y a anguille sous roche].',
    english: 'He changes the subject whenever we ask — there’s something fishy going on.',
  },
  {
    fr: 'mettre les pieds dans le plat', en: 'to put your foot in it',
    literal: 'to put one’s feet in the dish', theme: 'Trouble',
    sentence: 'En parlant de son ex, j’ai [mis les pieds dans le plat].',
    english: 'By bringing up his ex I put my foot in it.',
  },
  {
    fr: 'jeter l’éponge', en: 'to throw in the towel', literal: 'to throw the sponge',
    theme: 'Trouble',
    sentence: 'Après trois tentatives, elle a [jeté l’éponge].',
    english: 'After three attempts she threw in the towel.',
  },
  {
    fr: 'filer à l’anglaise', en: 'to slip away without saying goodbye',
    literal: 'to slip off English-style', theme: 'Trouble',
    sentence: 'Il [a filé à l’anglaise] avant le dessert.',
    english: 'He slipped away before dessert without saying goodbye.',
  },
  {
    fr: 'tourner autour du pot', en: 'to beat about the bush',
    literal: 'to turn around the pot', theme: 'Trouble',
    sentence: 'Arrête de [tourner autour du pot] et dis-moi la vérité.',
    english: 'Stop beating about the bush and tell me the truth.',
  },
  {
    fr: 'être tiré par les cheveux', en: 'to be far-fetched',
    literal: 'to be pulled by the hair', theme: 'Trouble',
    sentence: 'Son explication [est un peu tirée par les cheveux].',
    english: 'His explanation is a bit far-fetched.',
  },
  {
    fr: 'chercher midi à quatorze heures', en: 'to make things more complicated than they are',
    literal: 'to look for midday at two o’clock', theme: 'Trouble',
    sentence: 'Ne [cherche pas midi à quatorze heures] : la réponse est simple.',
    english: 'Don’t overcomplicate it — the answer is simple.',
  },
  {
    fr: 'prendre ses jambes à son cou', en: 'to take to your heels',
    literal: 'to take one’s legs to one’s neck', theme: 'Trouble',
    sentence: 'En voyant le chien, il [a pris ses jambes à son cou].',
    english: 'When he saw the dog he took to his heels.',
  },
  {
    fr: 'il pleut des cordes', en: 'it’s pouring with rain',
    literal: 'it is raining ropes', theme: 'Trouble',
    sentence: 'Prends un parapluie, [il pleut des cordes].',
    english: 'Take an umbrella, it’s pouring.',
  },
  {
    fr: 'en faire tout un fromage', en: 'to make a huge fuss about something',
    literal: 'to make a whole cheese of it', register: 'familier', theme: 'Trouble',
    sentence: 'Ce n’est qu’une tache, n’[en fais pas tout un fromage].',
    english: 'It’s only a stain — don’t make a huge fuss about it.',
  },
  {
    fr: 'avoir les yeux plus gros que le ventre', en: 'to have eyes bigger than your stomach',
    theme: 'Trouble',
    sentence: 'Tu n’as pas fini ton assiette : tu [as eu les yeux plus gros que le ventre].',
    english: 'You haven’t finished your plate — your eyes were bigger than your stomach.',
  },
  {
    fr: 'sauter du coq à l’âne', en: 'to jump from one subject to another',
    literal: 'to leap from the rooster to the donkey', theme: 'Trouble',
    sentence: 'Il [saute du coq à l’âne] quand il raconte une histoire.',
    english: 'He jumps from one thing to another when he tells a story.',
  },
  {
    fr: 'appeler un chat un chat', en: 'to call a spade a spade',
    literal: 'to call a cat a cat', theme: 'Trouble',
    sentence: 'Soyons clairs et [appelons un chat un chat].',
    english: 'Let’s be clear and call a spade a spade.',
  },
  {
    fr: 'revenir à ses moutons', en: 'to get back to the subject',
    literal: 'to come back to one’s sheep', theme: 'Trouble',
    sentence: 'Après cette longue digression, [revenons à nos moutons].',
    english: 'After that long digression, let’s get back to the point.',
  },
  {
    fr: 'avoir un chat dans la gorge', en: 'to have a frog in your throat',
    literal: 'to have a cat in the throat', theme: 'Trouble',
    sentence: 'Excusez-moi, [j’ai un chat dans la gorge] ce matin.',
    english: 'Excuse me, I have a frog in my throat this morning.',
  },
  {
    fr: 'avoir un verre dans le nez', en: 'to have had one too many',
    literal: 'to have a glass in the nose', register: 'familier', theme: 'Trouble',
    sentence: 'Il parlait beaucoup trop fort : il [avait un verre dans le nez].',
    english: 'He was talking far too loudly — he’d had one too many.',
  },
  {
    fr: 'être sur son trente-et-un', en: 'to be dressed up to the nines',
    literal: 'to be on one’s thirty-one', theme: 'Trouble',
    sentence: 'Pour le mariage, tout le monde [était sur son trente-et-un].',
    english: 'Everyone was dressed up to the nines for the wedding.',
  },
];

/** An id that survives being reordered: the expression itself, slugged. */
const slug = (value) => value.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const MARKED = /\[([^\]]+)\]/;

export const EXPRESSIONS = RAW.map((entry) => {
  const found = MARKED.exec(entry.sentence);
  if (!found) throw new Error(`nothing marked in: ${entry.sentence}`);
  return {
    ...entry,
    id: slug(entry.fr),
    // The brackets are how the file is written, not how it reads.
    text: entry.sentence.replace(MARKED, () => found[1]),
    start: found.index,
    end: found.index + found[1].length,
  };
});

export const EXPRESSION_BY_ID = new Map(EXPRESSIONS.map((e) => [e.id, e]));

export const expressionsForThemes = (themes) =>
  EXPRESSIONS.filter((expression) => themes.includes(expression.theme));
