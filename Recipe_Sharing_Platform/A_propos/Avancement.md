# CookShare — Recipe Sharing Platform

## 🏗️ Stack Technique
- **Framework** : React 19 + Vite
- **Styling** : Tailwind CSS v4 + DaisyUI
- **Icônes** : lucide-react
- **Routing** : react-router-dom v7
- **Stockage** : localStorage (migration BDD prévue)

## 📁 Structure des fichiers

```
src/
├── App.jsx                          ✅ Point d'entrée, providers (Auth + Toast)
├── index.css                        ✅ Variables CSS, animations, police Inter
├── assets/
│   └── hero.png                     ✅ Image hero page d'accueil
├── context/
│   └── AuthContext.jsx              ✅ Gestion auth (login/signup/logout)
├── utils/
│   └── localStorage.js              ✅ Couche abstraction données (prête pour migration BDD)
├── data/
│   └── demoData.js                  ✅ 9 recettes démo + 5 utilisateurs démo
├── Components/
│   ├── Container.jsx                ✅ Router + layout + routes protégées
│   ├── layouts/
│   │   ├── Header.jsx               ✅ Nav responsive + recherche + menu utilisateur
│   │   └── Footer.jsx               ✅ Footer complet avec liens + réseaux
│   ├── ui/
│   │   ├── RecipeCard.jsx           ✅ Carte recette réutilisable
│   │   ├── StarRating.jsx           ✅ Étoiles (affichage + interactif)
│   │   ├── Avatar.jsx               ✅ Avatar (photo ou initiale colorée)
│   │   └── Toast.jsx                ✅ Notifications toast (succès/erreur/info)
│   └── Pages/
│       ├── Accueil.jsx              ✅ Hero + catégories + recettes tendances + newsletter
│       ├── Recipes.jsx              ✅ Liste + filtres sidebar + tri + pagination
│       ├── RecipeDetail.jsx         ✅ Détail complet (ingrédients cochables, instructions, commentaires, notation)
│       ├── CreateRecipe.jsx         ✅ Création ET modification de recette (formulaire complet)
│       ├── Login.jsx                ✅ Page connexion
│       ├── Register.jsx             ✅ Page inscription (avec jauge mot de passe)
│       └── Profile.jsx              ✅ Profil public + onglets (recettes / favoris / paramètres)
```

## 🎯 Fonctionnalités implémentées

### Niveau 1 — MVP ✅
- [x] Page d'accueil avec liste des recettes
- [x] Consultation d'une recette (page détail complète)
- [x] Création / Modification / Suppression de recette (CRUD)
- [x] Formulaire recette complet (titre, description, ingrédients dynamiques, étapes dynamiques, temps, portions, catégorie, difficulté, tags)
- [x] Upload d'image (base64, max 5 Mo)
- [x] Système d'authentification (inscription / connexion / déconnexion)

### Niveau 2 — Intermédiaire ✅
- [x] Recherche full-text (titre, description, tags, ingrédients)
- [x] Filtrage (catégorie, temps, difficulté, régime)
- [x] Tri (plus récentes, plus populaires, mieux notées, plus rapides)
- [x] Système de notation (étoiles 1-5, moyenne calculée)
- [x] Commentaires sur les recettes
- [x] Favoris / recettes sauvegardées
- [x] Profil utilisateur avec ses recettes
- [x] Pagination (9 recettes par page)

### Niveau 3 — Avancé (partiel)
- [x] Filtrage avancé (difficulté, régime alimentaire)
- [ ] Suggestions de recettes
- [ ] Mode sombre/clair
- [ ] Export PDF
- [ ] Partage réseaux sociaux (UI présente, fonctionnalité copie URL)

## 🗺️ Routes
| Route | Page | Protection |
|-------|------|-----------|
| `/` | Accueil | Public |
| `/recettes` | Liste recettes | Public |
| `/recettes/:id` | Détail recette | Public |
| `/creer-recette` | Créer recette | 🔒 Connecté |
| `/modifier-recette/:id` | Modifier recette | 🔒 Auteur |
| `/connexion` | Login | Public |
| `/inscription` | Register | Public |
| `/profil/:username` | Profil | Public (édition 🔒) |

## 🎨 Design System
- **Primary** : #FF6B35 (orange)
- **Secondary** : #2D3436 (dark)
- **Accent** : #00B894 (teal)
- **Font** : Inter (Google Fonts)

## 🔧 Migration vers BDD
Toute la logique de données est centralisée dans `src/utils/localStorage.js`.
Pour migrer vers une API, il suffit de remplacer les fonctions de ce fichier par des appels fetch/axios vers votre backend.

## 🚀 Lancer le projet
```bash
npm run dev
```

## 🧪 Compte démo
- Email : `amelie@example.com`
- Mot de passe : `demo1234`
