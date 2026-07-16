.📊 Qu'est-ce qu'un Personal Budget Tracker ?
C'est une application qui permet aux utilisateurs de :

Suivre leurs revenus et dépenses au quotidien

Visualiser leur santé financière (solde, économies, tendances)

Catégoriser leurs transactions pour mieux comprendre où va leur argent

Fixer des objectifs d'épargne ou de budget par catégorie

🎯 Fonctionnalités à implémenter (niveau Beginner)
Niveau 1 - Fonctionnalités essentielles (MVP)
Gestion des transactions :

✅ Ajouter une transaction (montant, description, catégorie, date, type: revenu/dépense)

✅ Supprimer une transaction

✅ Modifier une transaction

✅ Afficher la liste de toutes les transactions

Vue d'ensemble :

✅ Solde total (revenus - dépenses)

✅ Total des revenus

✅ Total des dépenses

Catégories prédéfinies :

Dépenses : Nourriture, Transport, Logement, Loisirs, Santé, Shopping, etc.

Revenus : Salaire, Freelance, Investissements, etc.

Niveau 2 - Fonctionnalités intermédiaires
Filtrage et recherche :

🔍 Filtrer par catégorie

📅 Filtrer par période (semaine, mois, année)

🔎 Rechercher une transaction par description

Statistiques et visualisations :

📊 Graphique en secteurs des dépenses par catégorie

📈 Graphique en barres ou courbe des revenus/dépenses sur une période

💰 Pourcentage du budget utilisé par catégorie

Persistance des données :

💾 Sauvegarder les données localement (localStorage ou IndexedDB)

🔄 Ou utiliser une base de données (NestJS + PostgreSQL/MySQL)

Niveau 3 - Fonctionnalités avancées (bonus)
📱 Mode responsive (mobile-first)

🎯 Définir un budget mensuel par catégorie et alerte quand on approche du seuil

💱 Support de plusieurs devises

📤 Exporter les données en CSV/PDF

🔐 Authentification utilisateur (pour Multi-utilisateur)

Je veux une maquette pour une application web "Personal Budget Tracker" avec le design suivant :

## 📱 STYLE GÉNÉRAL
- Thème : Clair avec des touches de bleu-vert (teal) et vert
- Style : Minimaliste, moderne, inspiré de Material Design
- Police : Inter ou Roboto
- Icônes : FontAwesome ou Material Icons
- Effets : Ombres légères, coins arrondis (8px-12px)

## 🏠 PAGE D'ACCUEIL / DASHBOARD

### En-tête (Header)
- Logo + "Budget Tracker" à gauche
- Menu de navigation : Dashboard | Transactions | Catégories | Statistiques
- Bouton "Nouvelle Transaction" (coloré, en évidence)

### Section "Aperçu Financier" (Cards)
- **Carte 1** : Solde total (grand chiffre) avec indicateur de tendance (↑/↓)
- **Carte 2** : Total Revenus (vert) avec icône de flèche vers le haut
- **Carte 3** : Total Dépenses (rouge) avec icône de flèche vers le bas
- **Carte 4** : Économies du mois (bleu) avec progression en pourcentage

### Section "Graphiques"
- **À gauche (60%)** : Graphique en courbes (ou barres) montrant l'évolution des revenus vs dépenses sur les 6 derniers mois
- **À droite (40%)** : Graphique en secteurs (donut) des dépenses par catégorie avec légende colorée

### Section "Transactions Récentes" (Tableau)
- 5 dernières transactions avec :
  - Icône de catégorie (couleur)
  - Description
  - Date
  - Montant (vert pour revenu, rouge pour dépense)
  - Statut (payé/en attente) [optionnel]
- Lien "Voir toutes les transactions" en bas

## 📋 PAGE TRANSACTIONS

### Filtres et Recherche
- Barre de recherche (avec icône de loupe)
- Filtres : Toutes les catégories (dropdown), Tous les types (dropdown)
- Sélecteur de période : Ce mois | Ce trimestre | Cette année | Personnalisé
- Bouton "Appliquer les filtres"

### Tableau des Transactions
Colonnes : 
| Catégorie | Description | Date | Montant | Actions |
| (icône)   | (texte)     | (dd/mm/yyyy) | (€) | (Modifier/Supprimer) |

- Lignes alternées (zebra)
- Survol des lignes avec effet de surbrillance
- Pagination en bas (10 par page)

### Formulaire d'Ajout/Modification (Modal)
Quand on clique sur "Nouvelle Transaction" ou sur "Modifier" :
- Titre : "Ajouter une transaction" / "Modifier la transaction"
- Champs :
  - Type : Boutons radio (Revenu / Dépense) [design toggle]
  - Catégorie : Dropdown avec icônes (ex: 🍕 Alimentation, 🚗 Transport...)
  - Description : Champ texte (placeholder: "Ex: Courses du mois")
  - Montant : Champ nombre (avec devise €)
  - Date : Date picker
  - Note (optionnelle) : Zone de texte
- Boutons : "Annuler" (blanc) et "Enregistrer" (coloré)

## 📊 PAGE STATISTIQUES

### Filtres en haut
- Sélecteur de période (Mois/Trimestre/Année)
- Sélecteur d'année

### Section 1 : Répartition des Dépenses
- Grand graphique en donut avec les catégories
- Légende interactive (clic pour filtrer)
- Pourcentages affichés sur chaque segment

### Section 2 : Évolution Mensuelle
- Graphique à barres empilées (Revenus + Dépenses par mois)

### Section 3 : Top 5 Catégories
- Liste des 5 catégories les plus dépensières avec :
  - Icône
  - Nom de la catégorie
  - Montant dépensé
  - Barre de progression visuelle (0-100% du budget total)

## ⚙️ PAGE PARAMÈTRES (optionnelle mais bien)

- Section "Budget Mensuel" :
  - Pour chaque catégorie, un slider ou champ pour définir le budget max
  - Indicateur "Utilisé / Total" en pourcentage (avec code couleur)
- Section "Préférences" :
  - Devise par défaut (€/$/£)
  - Premier jour de la semaine (Lundi/Dimanche)
  - Notifications (bouton toggle)

## 📱 RESPONSIVE

La maquette doit aussi montrer un aperçu mobile :
- Menu hamburger en haut à gauche
- Cards empilées verticalement
- Graphiques pleine largeur
- Tableau devient liste avec carte par transaction

## 🎨 COULEURS EXACTES

- Primary: #0EA5E9 (bleu ciel)
- Secondary: #10B981 (vert émeraude)
- Danger: #EF4444 (rouge)
- Warning: #F59E0B (orange)
- Background: #F8FAFC (gris très clair)
- Cards: #FFFFFF (blanc)
- Text Primary: #1E293B (gris foncé)
- Text Secondary: #64748B (gris moyen)

## 📐 MISE EN PAGE

- Container max-width: 1200px, centré
- Cards avec padding de 24px
- Espacement entre les éléments: 16px-24px (gap-4 à gap-6)
- Grille responsive: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 pour les cards

---

💡 **Objectif** : Une interface épurée, professionnelle, facile à utiliser, qui inspire confiance et donne envie de gérer son budget.