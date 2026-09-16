# Avancement du projet — Nebula Chat

## État actuel : ✅ Fonctionnel end-to-end

---

## Ce qui est terminé

### Frontend
- [x] Config Axios centralisée avec intercepteurs JWT (`Config/api.js`)
- [x] AuthContext — état global user/token, login, register, logout
- [x] useSocket — hook Socket.io complet (connexion JWT, events, typing)
- [x] Login.jsx — inscription + connexion avec vrais appels API
- [x] Container.jsx — ProtectedRoute + PublicRoute
- [x] Room.jsx — orchestre API + Socket.io, state partagé
- [x] Sidebar.jsx — vrais salons depuis API, vrais users, statuts temps réel
- [x] ChatArea.jsx — messages temps réel, typing indicator, réactions emoji
- [x] RightPanel.jsx — membres du salon avec statuts
- [x] Avatar.jsx — composant réutilisable
- [x] CreateRoomModal.jsx — création salon (nom, description, public/privé)
- [x] Thème dark cohérent avec variables CSS (@theme Tailwind v4)
- [x] Indicateur de reconnexion Socket.io

### Backend
- [x] Architecture NestJS modulaire (auth, users, rooms, messages, chat)
- [x] Entités TypeORM : User, Room, Message
- [x] Auth JWT avec bcrypt (register/login, anti-énumération)
- [x] Gateway WebSocket Socket.io avec authentification JWT
- [x] Events : room:join/leave, message:send, typing, message:react, room:create
- [x] Seed automatique des 4 salons par défaut au démarrage
- [x] GET /users — liste des utilisateurs
- [x] Pagination cursor-based sur les messages
- [x] Réactions toggle (ajouter/retirer)
- [x] CORS configuré dev/prod

---

## Ce qui peut être amélioré (niveau avancé)

### Fonctionnalités
- [ ] Messages privés (DMs) — salon créé entre deux utilisateurs
- [ ] Modifier/supprimer ses propres messages
- [ ] Défilement infini pour charger les messages plus anciens
- [ ] Notifications navigateur (Notification API)
- [ ] Badge de messages non lus par salon
- [ ] Recherche dans l'historique

### Technique
- [ ] Refresh token (renouvellement du JWT sans re-login)
- [ ] Tests unitaires Jest (backend) + React Testing Library (frontend)
- [ ] Docker Compose pour lancer tout en une commande
- [ ] CI/CD avec GitHub Actions
- [ ] Migrations TypeORM (remplacer synchronize:true en production)

### Déploiement
- [ ] Vercel pour le Frontend
- [ ] Railway/Render pour le Backend
- [ ] Supabase pour la base PostgreSQL
- [ ] Variables d'environnement de production

---

## Points techniques à retenir pour les entretiens

1. **Socket.io rooms** — grouper les sockets par salon pour broadcaster ciblé
2. **JWT stateless** — authentification sans état serveur, scalable horizontalement
3. **Lifting state up** — Room.jsx détient l'état partagé entre les 3 colonnes
4. **Cursor pagination** — plus performant qu'OFFSET/LIMIT sur grandes tables
5. **Tailwind v4 @theme** — déclarer les tokens dans @theme génère les classes utilitaires
6. **color-scheme: dark** — indispensable pour que le navigateur respecte nos styles sur les inputs
7. **Intercepteurs Axios** — centraliser le JWT et la gestion du 401 en un seul endroit
8. **useCallback** — stabiliser les handlers passés comme props pour éviter les re-renders
