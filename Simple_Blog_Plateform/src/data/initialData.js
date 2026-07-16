// Données initiales pour le blog - sera remplacé par une API/BDD à terme
// Structure conçue pour faciliter la migration vers une base de données

export const initialCategories = [
  {
    id: "cat-1",
    name: "JavaScript",
    slug: "javascript",
    description: "Le langage du web, du navigateur au serveur.",
    color: "#f7df1e",
  },
  {
    id: "cat-2",
    name: "React",
    slug: "react",
    description: "Composants, hooks et bonnes pratiques.",
    color: "#61dafb",
  },
  {
    id: "cat-3",
    name: "CSS & Design",
    slug: "css-design",
    description: "Interfaces propres et systèmes de design.",
    color: "#264de4",
  },
  {
    id: "cat-4",
    name: "Backend",
    slug: "backend",
    description: "Bases de données et architectures.",
    color: "#68a063",
  },
  {
    id: "cat-5",
    name: "Carrière",
    slug: "carriere",
    description: "Junior dev, entretiens et progression.",
    color: "#e74c3c",
  },
  {
    id: "cat-6",
    name: "Outils",
    slug: "outils",
    description: "Git, VS Code, terminal et productivité.",
    color: "#9b59b6",
  },
];

export const initialArticles = [
  {
    id: "art-1",
    title: "Premiers pas avec React 19",
    slug: "premiers-pas-react-19",
    excerpt:
      "React 19 apporte des nouveautés attendues : Actions, use(), et une meilleure gestion du SSR. Tour d'horizon en pratique.",
    content: `React 19 marque une étape importante dans l'évolution de la bibliothèque. Après plusieurs mois de tests, les équipes ont enfin livré une version stable qui simplifie beaucoup d'aspects du développement.

## Les Actions, enfin natives

Les Actions permettent de gérer les mutations asynchrones sans jongler avec plusieurs useState. On écrit une fonction, on la passe à un formulaire, et React gère le pending, les erreurs et les optimistic updates.

\`\`\`jsx
async function createPost(formData) {
  await api.post('/articles', formData);
}

<form action={createPost}>
  <input name="title" />
  <button type="submit">Publier</button>
</form>
\`\`\`

## Le hook use()

Nouveau venu qui accepte une Promise ou un Context. Il rend le code beaucoup plus linéaire, surtout couplé à Suspense.

> Les Server Components sortent aussi du laboratoire et deviennent la voie recommandée pour les nouveaux projets.

## Ce qu'il faut retenir

Migrer n'est pas urgent, mais commencer un projet neuf sur React 19 est un excellent choix.`,
    categoryId: "cat-2",
    author: "Alex Dupont",
    authorInitials: "AD",
    date: "2026-06-24",
    readTime: 5,
    status: "published",
    coverGradient: "from-teal-700 to-emerald-500",
  },
  {
    id: "art-2",
    title: "CSS moderne : OKLCH et container queries",
    slug: "css-moderne-oklch-container-queries",
    excerpt:
      "Deux fonctionnalités qui changent la façon d'écrire du CSS en 2026. OKLCH pour les couleurs, container queries pour la mise en page.",
    content: `Le CSS continue d'évoluer à un rythme soutenu. En 2026, deux features méritent une attention particulière.

## OKLCH : des couleurs perceptuellement uniformes

OKLCH offre une meilleure prédictibilité des couleurs comparé à HSL. La luminosité est perceptuellement uniforme, ce qui signifie que deux couleurs avec la même valeur L sembleront réellement aussi claires l'une que l'autre.

\`\`\`css
:root {
  --primary: oklch(55% 0.2 160);
  --primary-light: oklch(75% 0.15 160);
}
\`\`\`

## Container Queries : réponse au contexte, pas à la fenêtre

Fini de se battre avec des media queries globales. Une carte peut maintenant s'adapter à son conteneur direct.

> La combinaison OKLCH + container queries + cascade layers représente le CSS moderne à son meilleur.

Adopter ces outils aujourd'hui, c'est écrire du code plus maintenable demain.`,
    categoryId: "cat-3",
    author: "Alex Dupont",
    authorInitials: "AD",
    date: "2026-06-18",
    readTime: 6,
    status: "published",
    coverGradient: "from-blue-700 to-indigo-500",
  },
  {
    id: "art-3",
    title: "Junior dev, 6 mois après : ce que j'ai appris",
    slug: "junior-dev-6-mois-apres",
    excerpt:
      "Retour d'expérience honnête sur mes premiers mois en entreprise. Les bonnes surprises, les galères, et ce que l'école ne m'avait pas appris.",
    content: `Six mois. C'est le temps qu'il m'a fallu pour réaliser à quel point la soutenance et le vrai travail sont deux mondes différents.

## Ce que l'école n'enseigne pas

Les code reviews sont parfois difficiles à recevoir. La communication avec les non-téchniques est un skill à part entière. Et les deadlines, ça ne s'explique pas dans un cours.

## Les bonnes surprises

L'entraide dans l'équipe est réelle. Les seniors aiment enseigner si on pose les bonnes questions. Et voir son code en production, c'est une satisfaction unique.

> "Poser des questions n'est pas un signe de faiblesse, c'est un signe d'intelligence."

## Ce que je referais différemment

Je passerais moins de temps à essayer de tout comprendre seul avant de demander. Le temps est une ressource précieuse en entreprise.`,
    categoryId: "cat-5",
    author: "Alex Dupont",
    authorInitials: "AD",
    date: "2026-06-10",
    readTime: 4,
    status: "published",
    coverGradient: "from-red-600 to-orange-500",
  },
  {
    id: "art-4",
    title: "TypeScript : les utility types à connaître",
    slug: "typescript-utility-types",
    excerpt:
      "Pick, Omit, Partial, ReturnType... Un tour des utility types les plus utiles pour écrire un TypeScript expressif.",
    content: `TypeScript fourni une boîte à outils de types utilitaires qui permettent de transformer des types existants sans les réécrire.

## Partial et Required

\`Partial<T>\` rend toutes les propriétés optionnelles. Idéal pour les formulaires ou les mises à jour partielles.

\`\`\`typescript
type Article = { title: string; content: string; published: boolean };
type ArticleDraft = Partial<Article>; // toutes les props sont optionnelles
\`\`\`

## Pick et Omit

Deux faces d'une même pièce. \`Pick\` garde les propriétés listées, \`Omit\` les exclut.

## ReturnType et Parameters

Ces deux-là sont utiles pour extraire des types depuis des fonctions existantes, notamment quand on n'a pas accès à la définition.

> Maîtriser les utility types, c'est écrire moins de code pour plus d'expressivité.`,
    categoryId: "cat-1",
    author: "Alex Dupont",
    authorInitials: "AD",
    date: "2026-05-30",
    readTime: 7,
    status: "published",
    coverGradient: "from-blue-600 to-blue-400",
  },
  {
    id: "art-5",
    title: "Postgres : bien utiliser les index composites",
    slug: "postgres-index-composites",
    excerpt:
      "Un mauvais index peut ralentir toute une base. Voici comment bien concevoir des index composites pour des requêtes performantes.",
    content: `Les index sont l'outil le plus puissant pour optimiser les performances de Postgres, mais ils sont souvent mal utilisés.

## L'ordre des colonnes dans un index composite

La règle la plus importante : l'ordre compte. Un index sur \`(user_id, created_at)\` sera utilisé pour les requêtes sur \`user_id\` seul ou \`user_id + created_at\`, mais pas pour \`created_at\` seul.

## Quand ne pas créer d'index

Sur les tables avec beaucoup d'écritures, chaque index ralentit les INSERT et UPDATE. Il faut trouver le bon équilibre.

> \`EXPLAIN ANALYZE\` est ton meilleur ami. Utilise-le avant et après chaque modification d'index.

## Partial indexes

Pour indexer seulement un sous-ensemble de lignes, les partial indexes sont très efficaces.`,
    categoryId: "cat-4",
    author: "Alex Dupont",
    authorInitials: "AD",
    date: "2026-05-22",
    readTime: 8,
    status: "published",
    coverGradient: "from-green-700 to-teal-500",
  },
  {
    id: "art-6",
    title: "Git rebase, expliqué simplement",
    slug: "git-rebase-explique-simplement",
    excerpt:
      "Rebase fait peur, à tort. Un guide visuel pour comprendre quand et comment l'utiliser sans casser son historique.",
    content: `Git rebase est une commande que beaucoup évitent par peur. C'est dommage, car bien utilisée, elle produit un historique propre et lisible.

## Rebase vs Merge : quelle différence ?

\`merge\` crée un commit de fusion qui unit deux branches. \`rebase\` rejoue tes commits par-dessus la branche cible, comme si tu avais branché depuis le dernier commit de main.

## Interactive rebase : ton outil de réécriture

\`git rebase -i HEAD~3\` te permet de modifier les 3 derniers commits : les fusionner, changer leurs messages, les réordonner.

> Ne jamais rebase une branche partagée avec d'autres développeurs. Sur ta branche locale, tout est permis.

## Le workflow recommandé

Développe sur ta feature branch, rebase sur main avant la PR, squash tes commits de WIP. Tu obtiendras un historique propre et une PR facile à reviewer.`,
    categoryId: "cat-6",
    author: "Alex Dupont",
    authorInitials: "AD",
    date: "2026-05-14",
    readTime: 5,
    status: "published",
    coverGradient: "from-purple-700 to-purple-500",
  },
  {
    id: "art-7",
    title: "Notes perso sur les Web Components",
    slug: "notes-web-components",
    excerpt:
      "Exploration des Web Components natifs : Custom Elements, Shadow DOM et templates. Retour après une semaine d'expérimentation.",
    content: `Les Web Components sont une technologie native du navigateur que j'explorais depuis un moment. Voici mes notes après une semaine.

## Custom Elements

L'API de base pour créer ses propres balises HTML. On étend \`HTMLElement\` et on définit le comportement dans le lifecycle.

## Shadow DOM

L'encapsulation du CSS et du DOM. Très puissant mais peut compliquer le styling global.

Ce billet est encore en cours de rédaction...`,
    categoryId: "cat-1",
    author: "Alex Dupont",
    authorInitials: "AD",
    date: "2026-07-01",
    readTime: 3,
    status: "draft",
    coverGradient: "from-gray-600 to-gray-400",
  },
];

export const initialComments = [
  {
    id: "com-1",
    articleId: "art-1",
    name: "Julien Bertrand",
    initials: "JB",
    email: "julien@example.com",
    content:
      "Super résumé ! J'ai testé les Actions cette semaine, c'est vraiment plus propre que gérer un useState + try/catch.",
    date: "2026-06-25",
  },
  {
    id: "com-2",
    articleId: "art-1",
    name: "Amina R.",
    initials: "AR",
    email: "amina@example.com",
    content: "Un article sur la migration depuis React 18 serait top !",
    date: "2026-06-26",
  },
  {
    id: "com-3",
    articleId: "art-2",
    name: "Marc T.",
    initials: "MT",
    email: "marc@example.com",
    content:
      "OKLCH c'est vraiment un game changer pour les design systems. Merci pour l'article clair.",
    date: "2026-06-20",
  },
];

// Credentials admin (pour la démo - à remplacer par une vraie auth en production)
export const adminCredentials = {
  email: "admin@myblog.dev",
  password: "admin123",
};
