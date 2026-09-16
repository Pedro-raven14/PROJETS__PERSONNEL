# Nebula — Chat en temps réel

Application de chat en temps réel de style Discord/Slack, construite avec **React**, **NestJS** et **Socket.io**.

![Interface Nebula](./Frontend/src/assets/hero.png)

---

## Stack technique

| Couche | Technologies |
|---|---|
| Frontend | React 19, Vite, TailwindCSS v4, Socket.io-client, Axios, React Router v7 |
| Backend | NestJS 11, Socket.io, TypeORM, PostgreSQL |
| Auth | JWT (passport-jwt), bcrypt |
| Temps réel | WebSocket via Socket.io |

---

## Fonctionnalités

- **Authentification** — inscription et connexion avec JWT
- **Salons publics/privés** — création, liste, navigation
- **Messages temps réel** — envoi, réception instantanée, historique paginé
- **Indicateur de frappe** — "Alice est en train d'écrire..."
- **Réactions aux messages** — toggle emoji avec compteur
- **Présence en ligne** — statut vert/orange/gris en temps réel
- **Messages directs** — liste des utilisateurs connectés
- **Interface 3 colonnes** — sidebar, zone de chat, panneau membres

---

## Architecture

```
Chat_Temps_réel/
├── Frontend/               # React + Vite
│   └── src/
│       ├── Config/         # Instance Axios centralisée
│       ├── Context/        # AuthContext (état global JWT)
│       ├── hooks/          # useSocket (logique Socket.io)
│       └── Components/
│           ├── layouts/    # Sidebar, ChatArea, RightPanel
│           ├── pages/      # Login, Room
│           └── ui/         # Avatar, CreateRoomModal
│
└── Backend/                # NestJS
    └── src/
        ├── auth/           # JWT strategy, guard, register/login
        ├── users/          # Entité + service + controller
        ├── rooms/          # Entité + service + controller REST
        ├── messages/       # Entité + service (pagination cursor)
        └── chat/           # Gateway WebSocket Socket.io
```

---

## Lancer le projet en local

### Prérequis
- Node.js 18+
- PostgreSQL 14+ en local

### 1. Base de données

```sql
CREATE DATABASE chat_true_name;
```

### 2. Backend

```bash
cd Backend
cp .env.example .env
# Remplir .env avec tes infos PostgreSQL et un JWT_SECRET fort
npm install
npm run start:dev
```

Le backend démarre sur `http://localhost:3000`.  
TypeORM crée les tables automatiquement au premier démarrage (`synchronize: true`).  
Les 4 salons par défaut (général, tech, random, design) sont créés automatiquement.

### 3. Frontend

```bash
cd Frontend
npm install
npm run dev
```

Le frontend démarre sur `http://localhost:5173`.

---

## Variables d'environnement

### Backend — `.env`

| Variable | Description | Exemple |
|---|---|---|
| `NODE_ENV` | Environnement | `development` |
| `DB_HOST` | Hôte PostgreSQL | `localhost` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_USER` | Utilisateur DB | `postgres` |
| `DB_PASSWORD` | Mot de passe DB | `monmotdepasse` |
| `DB_NAME` | Nom de la base | `chat_true_name` |
| `JWT_SECRET` | Clé secrète JWT | `changeme_secret_long` |
| `FRONTEND_URL_DEV` | URL frontend dev | `http://localhost:5173` |

### Frontend — `.env`

| Variable | Description | Valeur par défaut |
|---|---|---|
| `VITE_API_URL` | URL du backend | `http://localhost:3000` |

---

## API REST

| Méthode | Route | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Créer un compte | ❌ |
| POST | `/auth/login` | Se connecter | ❌ |
| GET | `/rooms` | Liste des salons | ✅ JWT |
| POST | `/rooms` | Créer un salon | ✅ JWT |
| GET | `/rooms/:id` | Détails d'un salon | ✅ JWT |
| GET | `/users` | Liste des utilisateurs | ✅ JWT |
| GET | `/` | Healthcheck | ❌ |

## Événements WebSocket

| Émis par le client | Description |
|---|---|
| `room:join` | Rejoindre un salon (reçoit l'historique) |
| `room:leave` | Quitter un salon |
| `message:send` | Envoyer un message |
| `typing` | Indicateur de frappe |
| `message:react` | Ajouter/retirer une réaction |
| `room:create` | Créer un salon via WebSocket |

| Émis par le serveur | Description |
|---|---|
| `room:history` | Historique des 50 derniers messages |
| `message:new` | Nouveau message en temps réel |
| `message:updated` | Réactions mises à jour |
| `typing` | Quelqu'un tape dans le salon |
| `user:online` | Utilisateur connecté |
| `user:offline` | Utilisateur déconnecté |
| `room:created` | Nouveau salon créé |

---

## Tester avec deux comptes simultanément

Pour simuler deux utilisateurs en conversation :

1. **Edge** (onglet normal) → se connecter avec le compte A
2. **Edge** (fenêtre privée `Ctrl+Shift+N`) → se connecter avec le compte B

Chaque contexte a son propre `localStorage` isolé.

---

## Déploiement

| Service | Usage |
|---|---|
| **Vercel** | Frontend React (gratuit) |
| **Railway** ou **Render** | Backend NestJS (gratuit tier) |
| **Supabase** | PostgreSQL cloud (gratuit tier) |

Pour la production, mettre `NODE_ENV=production` et renseigner `DB_URL` (URL complète PostgreSQL) ainsi que `FRONTEND_URL_PROD`.
