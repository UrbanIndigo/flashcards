/**
 * The 500 words worth building a sentence around.
 *
 * A frequency list with the pure glue taken out. *De*, *le*, *à* and *un*
 * are the four commonest words in French and no sentence can usefully
 * "feature" any of them — they turn up in almost every sentence here
 * anyway. What is left is the vocabulary you would actually be pleased to
 * recognise: the verbs, the nouns, the adjectives, and the connecting words
 * that carry meaning of their own.
 *
 * Ordered roughly by how often you meet them, and banded so a session can be
 * kept to the first hundred. The ordering is a working approximation, not a
 * measurement: the point of the bands is to start with what matters most,
 * and no corpus count would change which words those are.
 *
 * `js/everyday.js` carries two sentences for every word in this list, and a
 * test fails if any word loses its sentences.
 */

export const BANDS = [
  { id: 'first', label: 'First 100', hint: 'the ones you meet hourly', from: 0, to: 100 },
  { id: 'next', label: 'Next 150', hint: 'everyday vocabulary', from: 100, to: 250 },
  { id: 'rest', label: 'The rest', hint: 'still common, less constant', from: 250, to: 500 },
];

export const WORDS = [
  // 1-100: the words that hold a conversation together.
  'être', 'avoir', 'faire', 'dire', 'aller', 'voir', 'savoir', 'pouvoir', 'vouloir', 'venir',
  'devoir', 'falloir', 'croire', 'trouver', 'donner', 'prendre', 'parler', 'aimer', 'passer', 'mettre',
  'demander', 'tenir', 'sembler', 'laisser', 'rester', 'penser', 'entendre', 'regarder', 'répondre', 'connaître',
  'arriver', 'attendre', 'vivre', 'chercher', 'sortir', 'comprendre', 'porter', 'devenir', 'entrer', 'écrire',
  'appeler', 'tomber', 'suivre', 'commencer', 'jouer', 'perdre', 'apprendre', 'oublier', 'travailler', 'manger',
  'temps', 'jour', 'homme', 'femme', 'enfant', 'chose', 'vie', 'monde', 'pays', 'ville',
  'maison', 'eau', 'main', 'nuit', 'matin', 'soir', 'année', 'mois', 'semaine', 'heure',
  'moment', 'fois', 'ami', 'gens', 'personne', 'nom', 'mot', 'question', 'raison', 'histoire',
  'grand', 'petit', 'bon', 'mauvais', 'nouveau', 'vieux', 'jeune', 'beau', 'même', 'autre',
  'bien', 'très', 'trop', 'toujours', 'jamais', 'encore', 'déjà', 'souvent', 'maintenant', 'peut-être',

  // 101-250: the everyday middle.
  'rendre', 'paraître', 'sentir', 'revenir', 'monter', 'descendre', 'ouvrir', 'fermer', 'lire', 'boire',
  'dormir', 'courir', 'partir', 'marcher', 'arrêter', 'choisir', 'finir', 'réussir', 'essayer', 'expliquer',
  'décider', 'préférer', 'acheter', 'payer', 'coûter', 'changer', 'garder', 'montrer', 'continuer', 'oser',
  'aider', 'habiter', 'rencontrer', 'inviter', 'envoyer', 'recevoir', 'offrir', 'servir', 'plaire', 'manquer',
  'famille', 'père', 'mère', 'frère', 'sœur', 'fils', 'fille', 'voisin', 'monsieur', 'madame',
  'travail', 'école', 'livre', 'lettre', 'réponse', 'problème', 'idée', 'exemple', 'place', 'rue',
  'route', 'chemin', 'voiture', 'train', 'gare', 'billet', 'argent', 'prix', 'magasin', 'marché',
  'porte', 'fenêtre', 'table', 'chaise', 'lit', 'chambre', 'cuisine', 'jardin', 'pain', 'café',
  'repas', 'midi', 'hier', 'demain', 'aujourd’hui', 'tard', 'tôt', 'vite', 'ici', 'là-bas',
  'long', 'court', 'gros', 'vrai', 'faux', 'premier', 'dernier', 'seul', 'cher', 'facile',
  'difficile', 'important', 'possible', 'sûr', 'prêt', 'plein', 'chaud', 'froid', 'fort', 'fatigué',
  'heureux', 'content', 'triste', 'malade', 'libre', 'occupé', 'gentil', 'drôle', 'prochain', 'différent',
  'assez', 'mal', 'mieux', 'parfois', 'bientôt', 'ensemble', 'surtout', 'vraiment', 'presque', 'enfin',
  'alors', 'donc', 'puis', 'ensuite', 'avant', 'après', 'pendant', 'depuis', 'quand', 'comme',
  'parce que', 'pourtant', 'malgré', 'grâce à', 'à cause de', 'combien', 'pourquoi', 'comment', 'beaucoup', 'peu',

  // 251-500: still common, and where the language starts to widen out.
  'rappeler', 'permettre', 'occuper', 'compter', 'gagner', 'utiliser', 'ajouter', 'apporter', 'conduire', 'construire',
  'réfléchir', 'remercier', 'remarquer', 'rêver', 'chanter', 'danser', 'rire', 'pleurer', 'sourire', 'crier',
  'se lever', 'se coucher', 'se réveiller', 'se dépêcher', 's’asseoir', 'se souvenir', 's’habiller', 'se promener', 'se tromper', 's’ennuyer',
  'valoir', 'suffire', 'appartenir', 'obtenir', 'retenir', 'contenir', 'produire', 'traduire', 'détruire', 'nourrir',
  'ouvrier', 'métier', 'bureau', 'réunion', 'projet', 'entreprise', 'client', 'patron', 'collègue', 'salaire',
  'cours', 'classe', 'professeur', 'élève', 'étudiant', 'exercice', 'note', 'examen', 'université', 'bibliothèque',
  'corps', 'tête', 'yeux', 'bouche', 'bras', 'jambe', 'pied', 'cœur', 'dos', 'doigt',
  'santé', 'médecin', 'hôpital', 'pharmacie', 'médicament', 'douleur', 'fièvre', 'accident', 'urgence', 'sommeil',
  'chien', 'chat', 'oiseau', 'cheval', 'arbre', 'fleur', 'herbe', 'forêt', 'champ', 'campagne',
  'mer', 'montagne', 'plage', 'lac', 'rivière', 'île', 'ciel', 'soleil', 'lune', 'étoile',
  'pluie', 'neige', 'vent', 'orage', 'nuage', 'saison', 'été', 'hiver', 'printemps', 'automne',
  'vêtement', 'robe', 'pantalon', 'chemise', 'chaussure', 'manteau', 'poche', 'sac', 'valise', 'clé',
  'couleur', 'blanc', 'noir', 'rouge', 'bleu', 'vert', 'jaune', 'taille', 'poids', 'forme',
  'vin', 'lait', 'fromage', 'viande', 'poisson', 'légume', 'fruit', 'pomme', 'gâteau', 'sucre',
  'restaurant', 'hôtel', 'menu', 'addition', 'cuisinier', 'serveur', 'verre', 'assiette', 'couteau', 'bouteille',
  'téléphone', 'ordinateur', 'message', 'journal', 'nouvelle', 'musique', 'film', 'photo', 'jeu', 'sport',
  'avion', 'bus', 'vélo', 'bateau', 'aéroport', 'voyage', 'vacances', 'hôte', 'frontière', 'passeport',
  'centre', 'village', 'quartier', 'immeuble', 'appartement', 'étage', 'ascenseur', 'escalier', 'mur', 'toit',
  'police', 'loi', 'guerre', 'paix', 'peuple', 'roi', 'président', 'élection', 'impôt', 'liberté',
  'amour', 'peur', 'joie', 'colère', 'espoir', 'chance', 'vérité', 'mensonge', 'secret', 'souvenir',
  'début', 'fin', 'milieu', 'côté', 'bout', 'part', 'moitié', 'nombre', 'numéro', 'reste',
  'avis', 'choix', 'façon', 'manière', 'groupe', 'ordre', 'sens', 'effort', 'besoin', 'envie',
  'joli', 'propre', 'sale', 'gratuit', 'simple', 'compliqué', 'utile', 'inutile', 'impossible', 'vide',
  'lourd', 'léger', 'rapide', 'lent', 'haut', 'bas', 'proche', 'loin', 'doux', 'dur',
  'meilleur', 'pire', 'entier', 'clair', 'sombre', 'calme', 'bruyant', 'sérieux', 'célèbre', 'pauvre',
];
