# Compteur de texte

## Fonctionnalités

- **Comptage de caractères en temps réel** — affiche le nombre total de caractères saisis
- **Option espaces** — possibilité d'inclure ou d'exclure les espaces du comptage de caractères via une checkbox
- **Comptage de mots** — détecte et compte les mots séparés par la ponctuation et les espaces
- **Comptage de phrases** — détecte les phrases terminées par `.`, `!`, `?` ou un saut de ligne
- **Comptage de paragraphes** — détecte les blocs de texte séparés par une ligne vide
- **Temps de lecture estimé** — calcule le temps de lecture basé sur une vitesse moyenne de 200 mots par minute
- **Densité de mots-clés** — liste les 10 mots les plus fréquents du texte avec leur nombre d'occurrences, leur pourcentage et une barre de progression visuelle (les mots vides français sont exclus)
- **Copier le texte** — copie le contenu du textarea dans le presse-papiers en un clic, avec un retour visuel "✓ Copié !" pendant 2 secondes
- **Effacer le texte** — vide le textarea en un clic

---

# Personal Budget Tracker

## Fonctionnalités

### Dashboard
- **KPIs du mois** — 4 cartes affichant le solde, les revenus, les dépenses et l'épargne du mois en cours
- **Tendance mensuelle** — comparaison du solde avec le mois précédent (pourcentage +/-)
- **Objectif d'épargne** — barre de progression vers un objectif de 50% des revenus épargnés
- **Graphique de tendance** — AreaChart (courbes) des revenus vs dépenses sur les 6 derniers mois glissants
- **Donut des dépenses** — PieChart de la répartition des dépenses par catégorie pour le mois courant
- **Transactions récentes** — liste des 5 dernières transactions avec statut (Payé / En attente)
- **Salutation personnalisée** — affichage du prénom configuré dans les paramètres

### Transactions
- **Liste complète** — toutes les transactions avec catégorie, description, date, montant et statut
- **Filtre par texte** — recherche dans les descriptions en temps réel
- **Filtre par catégorie** — dropdown de toutes les catégories disponibles
- **Filtre par type** — revenus uniquement, dépenses uniquement, ou tous
- **Filtre par période** — Ce mois / Ce trimestre / Cette année / Tout
- **Pagination** — 10 transactions par page avec navigation et compteur "page X sur Y"
- **Ajout de transaction** — bouton "Nouvelle Transaction" ouvrant une modale de saisie
- **Modification** — icône crayon pour éditer une transaction existante (modale pré-remplie)
- **Suppression** — icône poubelle avec dialog de confirmation avant suppression définitive
- **Responsive** — colonnes masquées sur mobile, vue compacte adaptée

### Catégories
- **Cartes de dépenses** — une carte par catégorie de dépense avec montant dépensé vs budget défini
- **Barre de progression colorée** — bleue (< 80%), orange (80–99%), rouge (≥ 100% du budget)
- **Badge dépassement** — badge "100%" affiché si le budget est dépassé
- **Cartes de revenus** — une carte par catégorie de revenu avec le total encaissé ce mois

### Statistiques
- **Filtre de période** — mode Mois, Trimestre ou Année
- **Sélecteur d'année** — liste dynamique des années présentes dans les données
- **Donut de répartition** — PieChart avec pourcentages sur les segments et tooltip au survol
- **Graphique mensuel** — BarChart des revenus et dépenses pour chaque mois de l'année sélectionnée
- **Top 5 des catégories** — les 5 catégories les plus dépensières avec barre de progression et pourcentage

### Paramètres
- **Budgets mensuels** — slider + champ numérique pour définir un plafond par catégorie de dépense (0–5 000)
- **Barre de consommation en temps réel** — visualisation de la dépense réelle du mois vs budget défini
- **Prénom** — personnalisation du nom affiché sur le Dashboard
- **Devise** — choix parmi € Euro, $ Dollar, £ Livre sterling, CHF Franc suisse (appliqué partout)
- **Premier jour de la semaine** — Lundi ou Dimanche
- **Notifications** — toggle pour activer/désactiver les alertes de dépassement de budget
- **Sauvegarde avec feedback** — bouton qui vire au vert "✓ Sauvegardé !" pendant 2,5 secondes

### Général
- **Persistance locale** — toutes les données (transactions, budgets, préférences) sauvegardées dans le `localStorage`
- **Données de démonstration** — 25 transactions de démo sur 6 mois chargées au premier lancement
- **Modale de transaction** — formulaire complet avec type, catégorie, description, montant, date, statut et note
- **Validation de formulaire** — erreurs par champ (description requise, montant > 0, date, catégorie)
- **14 catégories** — 9 catégories de dépenses et 5 de revenus, chacune avec icône Lucide et couleur dédiée
- **Design responsive** — navigation hamburger mobile, grilles CSS adaptatives
- **Devise dynamique** — le format monétaire respecte le choix de l'utilisateur dans toute l'application

---

# Todo List Perso

## Fonctionnalités

- **Ajout de tâche** — formulaire avec un champ texte et un bouton "Ajouter" ; la tâche est créée uniquement si le champ n'est pas vide (après trim)
- **Liste des tâches** — affichage de toutes les tâches ajoutées avec leur numéro d'ordre, leur titre et un bouton de suppression
- **Marquer comme complétée** — clic sur une tâche pour basculer son état `complete` (toggle `true` / `false`)
- **Suppression d'une tâche** — bouton poubelle par tâche, avec `stopPropagation` pour ne pas déclencher le toggle en même temps
- **Compteur de tâches restantes** — affiche dynamiquement le nombre de tâches non complétées dans l'en-tête de la liste
- **Compteur de tâches terminées** — le footer affiche combien de tâches ont été accomplies (accord pluriel inclus)
- **État vide** — message d'encouragement affiché quand aucune tâche n'est présente
- **Réinitialisation de l'input** — le champ texte est vidé automatiquement après chaque ajout
- **Responsive mobile** — layout adaptatif : padding réduit, formulaire en colonne sur petit écran, header avec flex-wrap, texte long des tâches avec retour à la ligne automatique

---

# Recipe Sharing Platform

## Fonctionnalités

### Authentification
- **Inscription** — formulaire avec nom complet, nom d'utilisateur, email, mot de passe (confirmation + jauge de force), acceptation des CGU
- **Connexion** — formulaire email/mot de passe avec option "Se souvenir de moi" et compte démo pré-rempli
- **Persistance de session** — l'utilisateur reste connecté via `localStorage`
- **Déconnexion** — accessible depuis le menu déroulant de l'avatar

### Navigation & Layout
- **Header sticky** — barre fixe en haut avec logo, barre de recherche desktop, bouton "Créer une recette" et menu utilisateur
- **Menu burger mobile** — hamburger qui déroule les liens de navigation sur petit écran
- **Barre de recherche duale** — version desktop dans le header, version mobile en dessous (affichage conditionnel via CSS)
- **Menu utilisateur** — dropdown avec accès au profil, mes recettes, mes favoris et déconnexion
- **Footer** — grille multi-colonnes avec liens catégories, liens légaux et copyright

### Page d'accueil
- **Hero section** — titre et sous-titre animés avec deux CTAs (Explorer / Créer une recette), image de fond
- **Filtres catégories** — barre de filtres scrollable horizontalement (Petit-déjeuner, Déjeuner, Dîner, Dessert, Collation) avec filtre actif mis en valeur
- **Grille de recettes** — affichage des recettes publiées les plus récentes en grille responsive
- **Section newsletter** — formulaire d'inscription à la newsletter (UI uniquement)

### Recettes (liste)
- **Barre de recherche** — recherche par titre, ingrédient, description ou tag
- **Sidebar de filtres desktop** — filtre par catégorie, difficulté, temps de préparation max et tri (plus récent, mieux noté, plus rapide)
- **Drawer de filtres mobile** — overlay latéral avec les mêmes filtres, accessible via un bouton "Filtres"
- **Tri** — sélecteur Récent / Mieux noté / Plus rapide
- **Grille adaptive** — `auto-fill minmax(260px, 1fr)` — passe automatiquement d'une à plusieurs colonnes
- **Compteur de résultats** — affiche le nombre de recettes trouvées

### Carte de recette (RecipeCard)
- **Image ou emoji de fallback** — affiche l'image uploadée ou un emoji coloré si aucune image
- **Badge catégorie**  
- **Bouton favori** — cœur en position absolue sur l'image, toggle immédiat
- **Badge temps** — temps total affiché en bas de l'image
- **Infos** — titre, note avec étoiles, auteur avec avatar, temps de préparation, difficulté, nombre de portions

### Détail d'une recette
- **Hero image** — grande image ou emoji de fond avec overlay dégradé, titre `clamp`, catégorie, auteur, date et note
- **Stats bar** — 4 cartes (préparation, cuisson, portions, difficulté) en grille `auto-fit`
- **Boutons d'action** — Ajouter aux favoris (toggle), Partager (copie URL dans le presse-papiers), Modifier et Supprimer (si auteur)
- **Liste d'ingrédients interactive** — clic sur un ingrédient pour le cocher/décocher (fond vert + texte barré)
- **Instructions numérotées** — étapes avec numéro cerclé orange
- **Sidebar droite** — note utilisateur interactive (étoiles cliquables), tags cliquables et fiche auteur
- **Commentaires** — formulaire de commentaire (connecté uniquement), liste des commentaires avec date et suppression (auteur ou propriétaire de la recette)
- **Notation** — étoiles interactives (1–5) avec moyenne recalculée en temps réel
- **Recettes similaires** — grille de 3 recettes de la même catégorie en bas de page

### Création & édition de recette
- **Formulaire multi-sections** — Informations de base, Temps & portions, Difficulté, Ingrédients, Instructions, Photo
- **Ingrédients dynamiques** — ajout/suppression de lignes avec quantité, unité (15 options) et nom ; réorganisation par drag handle
- **Instructions dynamiques** — ajout/suppression d'étapes numérotées
- **Upload d'image** — zone drag-and-drop avec aperçu, limite 5 Mo, formats JPG/PNG/WebP (stockée en base64)
- **Validation** — erreurs par champ avec scroll automatique vers la première erreur
- **Brouillon** — bouton "Enregistrer comme brouillon" (statut `draft`) en plus de "Publier"
- **Mode édition** — le formulaire se pré-remplit avec les données existantes (`/modifier-recette/:id`)
- **Protection de route** — redirection vers `/connexion` si non connecté ; vérification que l'auteur est bien le propriétaire

### Profil utilisateur
- **Bannière dégradée** — en-tête coloré avec avatar superposé (chevauchement via `marginTop: -60`)
- **Card profil** — avatar, nom, @username, bio, stats (recettes publiées, abonnés, abonnements) et bouton "Suivre" ou "Modifier"
- **Changement d'avatar** — upload d'image directement depuis la card profil
- **Onglets** — Mes recettes, Favoris, Abonnements, Paramètres (Favoris et Paramètres visibles par le propriétaire uniquement)
- **Onglets scrollables** — défilement horizontal sur mobile sans scrollbar visible
- **Recettes publiées et brouillons** — badges "Brouillon" sur les recettes non publiées, boutons Modifier/Supprimer au survol
- **Favoris** — grille des recettes mises en favoris par l'utilisateur
- **Paramètres** — modification du nom complet, de la bio et de la photo de profil

### Données & persistance
- **Stockage 100% localStorage** — utilisateurs, recettes, commentaires, favoris, notes
- **Données de démonstration** — recettes et utilisateurs de démo chargés au premier lancement
- **Recherche et filtres** — fonction utilitaire `searchAndFilterRecipes` centralisée

### Responsive & UX
- **Mobile first** — menu burger, drawer filtres, search bar duale, onglets scrollables
- **Grilles adaptatives** — `auto-fill/auto-fit minmax()` sur toutes les listes de recettes
- **Textes fluides** — `clamp()` sur les titres principaux
- **Toasts** — notifications discrètes (succès / erreur / info) avec auto-disparition
- **Animations** — `fadeIn` CSS sur les menus déroulants et overlays
- **Feedback visuel** — skeletons, états désactivés sur les boutons en cours de soumission
