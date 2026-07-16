# Avancement — Simple Blog Platform

## Stack technique
- React 19 + Vite 8
- TailwindCSS v4 (via @tailwindcss/vite)
- React Router DOM v7
- lucide-react (icônes)
- LocalStorage (données) → migration BDD prévue

---

## ✅ Fait (v1.0)

### Architecture
- [x] Context API (`BlogContext`) — source unique de vérité
- [x] LocalStorage pour toutes les données (articles, catégories, commentaires, auth, thème)
- [x] Structure préparée pour migration vers API (couche de données isolée dans `src/data/initialData.js`)
- [x] Routing complet avec react-router-dom v7

### Thème
- [x] Switch mode sombre / mode clair
- [x] Variables CSS custom (`--color-*`) sur `:root` et `[data-theme="dark"]`
- [x] Persistance du thème en localStorage
- [x] Détection automatique du thème OS

### Pages publiques
- [x] **Accueil** : hero dégradé, articles à la une (grille 3), plus d'articles, sidebar
- [x] **Catégories** : grille de cartes avec bulles décoratives
- [x] **Détail catégorie** : liste filtrée d'articles + sidebar + breadcrumb
- [x] **Détail article** : breadcrumb, titre, meta, image cover, contenu Markdown simplifié, partage, commentaires, articles liés
- [x] **À propos** : page personnelle avec cartes compétences, citations, CTA
- [x] **Recherche** : résultats full-text (titre + extrait + contenu)
- [x] **404** : page d'erreur propre

### Composants UI
- [x] `ArticleCard` — carte article réutilisable avec cover colorée
- [x] `Sidebar` — catégories, articles récents, newsletter
- [x] `CommentSection` — formulaire + liste + suppression admin
- [x] `Header` — navigation, switch thème, recherche, menu mobile
- [x] `Footer` — copyright + liens sociaux

### Admin
- [x] **Page de connexion** — formulaire sécurisé, démo pré-remplie
- [x] **Dashboard admin** — sidebar dédiée (dark)
  - Tableau de bord : stats (total, publiés, brouillons)
  - Articles : tableau complet, toggle statut, modifier, supprimer (double-confirm)
  - Catégories : vue en grille
  - Commentaires : liste avec suppression (double-confirm)
- [x] **Formulaire article** — création et modification avec :
  - Titre (slug auto-généré)
  - Extrait, contenu (Markdown simplifié)
  - Catégorie, auteur, temps de lecture
  - Date, couleur de couverture
  - Toggle statut publié/brouillon

### Fonctionnalités
- [x] CRUD articles complet
- [x] Système de commentaires (ajout public, suppression admin)
- [x] Catégories avec compteur d'articles
- [x] Recherche full-text
- [x] Design responsive (mobile-first)
- [x] Hover effects et transitions
- [x] Rendu Markdown simplifié (##, >, ```, **gras**, `code`)

---

## 🔜 À faire (v1.1+)

### Améliorations front
- [ ] Pagination des articles
- [ ] Filtrage/tri sur la page catégories
- [ ] Éditeur Markdown riche (avec aperçu)
- [ ] Upload d'image pour les articles
- [ ] Toast notifications (succès/erreur)
- [ ] Animations page transitions

### Migration BDD
- [ ] Remplacer `localStorage` par des appels API REST
- [ ] Backend Node/Express ou Next.js API routes
- [ ] Auth JWT au lieu du flag localStorage
- [ ] Base de données PostgreSQL ou MongoDB

### SEO & Performance
- [ ] Balises meta par page
- [ ] Lazy loading des images
- [ ] Code splitting avancé

---

## Identifiants démo
- Email : `admin@myblog.dev`
- Mot de passe : `admin123`
