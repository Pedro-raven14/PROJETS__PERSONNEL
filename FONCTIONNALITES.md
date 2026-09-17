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
