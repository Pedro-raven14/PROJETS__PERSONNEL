# Guide de migration Backend — Personal Budget Tracker

> Ce document est destiné à un agent IA chargé d'implémenter le backend NestJS.
> Il décrit l'architecture frontend existante, les modèles de données, les
> opérations actuellement gérées en localStorage, et les contrats d'API attendus.

---

## 1. Vue d'ensemble du projet

| Élément          | Valeur                                      |
|------------------|---------------------------------------------|
| Frontend         | React 19 + Vite 8 + TailwindCSS v4          |
| Router           | React Router v7                             |
| State management | React Context (`BudgetContext`)             |
| Persistance actuelle | `localStorage` (navigateur)            |
| Persistance cible    | API REST NestJS + base de données       |
| Langue de l'UI   | Français                                    |

---

## 2. Structure des fichiers frontend

```
src/
├── App.jsx                          # Root : BrowserRouter + BudgetProvider
├── main.jsx                         # Point d'entrée React
├── index.css                        # TailwindCSS v4 + police Inter
├── context/
│   └── BudgetContext.jsx            # ★ État global + localStorage (à remplacer par API)
├── data/
│   └── categories.js                # Référentiel statique des catégories
└── Components/
    ├── Container.jsx                # Layout principal + Routes
    ├── layouts/
    │   ├── Header.tsx               # Navigation + bouton "Nouvelle Transaction"
    │   └── NavLink.tsx              # Composant NavLink stylé
    ├── ui/
    │   ├── CategoryIcon.jsx         # Icône colorée d'une catégorie
    │   └── TransactionModal.jsx     # Formulaire ajout/modification (modal)
    └── routes/
        ├── Dashboard.jsx            # Page d'accueil avec KPIs et graphiques
        ├── Transactions.tsx         # Liste filtrée + pagination
        ├── Categories.jsx           # Suivi budget par catégorie
        ├── Statistiques.jsx         # Graphiques avancés
        └── Parametres.jsx           # Budgets mensuels + préférences utilisateur
```

---

## 3. Modèles de données

### 3.1 Transaction

Utilisé dans `BudgetContext.jsx` et `TransactionModal.jsx`.

```typescript
interface Transaction {
  id: string;           // UUID (crypto.randomUUID() côté frontend)
  type: 'revenu' | 'depense';
  categorie: string;    // ID de catégorie (voir section 4)
  description: string;  // Texte libre, ex: "Courses du mois"
  montant: number;      // Toujours positif (le signe est déterminé par `type`)
  date: string;         // Format ISO : "YYYY-MM-DD"
  note: string;         // Texte libre, peut être vide ""
  statut: 'paye' | 'en_attente';
}
```

**Exemple :**
```json
{
  "id": "1",
  "type": "depense",
  "categorie": "alimentation",
  "description": "Courses du mois",
  "montant": 142.5,
  "date": "2026-03-05",
  "note": "",
  "statut": "paye"
}
```

### 3.2 Budgets mensuels

Utilisé dans `BudgetContext.jsx` et `Parametres.jsx`.

```typescript
// Objet clé-valeur : categorieId → montant budget mensuel
type Budgets = Record<string, number>;
```

**Exemple :**
```json
{
  "alimentation": 500,
  "transport": 200,
  "logement": 900,
  "shopping": 250,
  "loisirs": 150,
  "sante": 100,
  "factures": 180,
  "education": 0,
  "autre_depense": 0
}
```

> **Note :** Seules les catégories de type `depense` ont un budget.
> Les catégories de type `revenu` n'ont pas de budget.

### 3.3 Préférences utilisateur

Utilisé dans `BudgetContext.jsx` et `Parametres.jsx`.

```typescript
interface Preferences {
  nom: string;               // Prénom affiché sur le dashboard ("Bonjour, X 👋")
  devise: '€' | '$' | '£' | 'CHF';
  premierJour: 'lundi' | 'dimanche';
  notifications: boolean;    // Alertes dépassement de budget
}
```

**Valeurs par défaut :**
```json
{
  "nom": "Utilisateur",
  "devise": "€",
  "premierJour": "lundi",
  "notifications": true
}
```

---

## 4. Référentiel des catégories

Les catégories sont **statiques** côté frontend (fichier `src/data/categories.js`).
Le backend doit connaître les mêmes IDs pour valider les transactions.

### Catégories de dépenses (type = `depense`)

| id              | label         |
|-----------------|---------------|
| `alimentation`  | Alimentation  |
| `transport`     | Transport     |
| `logement`      | Logement      |
| `shopping`      | Shopping      |
| `loisirs`       | Loisirs       |
| `sante`         | Santé         |
| `factures`      | Factures      |
| `education`     | Éducation     |
| `autre_depense` | Autre         |

### Catégories de revenus (type = `revenu`)

| id               | label          |
|------------------|----------------|
| `salaire`        | Salaire        |
| `freelance`      | Freelance      |
| `investissement` | Investissement |
| `cadeau`         | Cadeau         |
| `autre_revenu`   | Autre revenu   |

> Les catégories peuvent rester en seed statique dans la base de données
> ou être gérées via une table `Category`. Les IDs doivent correspondre
> exactement aux valeurs ci-dessus (le frontend les utilise comme clés).

---

## 5. Opérations actuelles (localStorage → API)

Toutes ces opérations sont aujourd'hui dans `BudgetContext.jsx`.
Chacune doit avoir un endpoint REST correspondant.

### 5.1 Transactions

| Opération frontend         | Méthode HTTP | Endpoint              |
|----------------------------|--------------|-----------------------|
| Lister toutes              | `GET`        | `/transactions`       |
| Ajouter                    | `POST`       | `/transactions`       |
| Modifier                   | `PATCH`      | `/transactions/:id`   |
| Supprimer                  | `DELETE`     | `/transactions/:id`   |

**Paramètres de filtrage suggérés pour GET /transactions :**
```
?type=revenu|depense
?categorie=alimentation
?dateDebut=2026-01-01&dateFin=2026-03-31
?periode=mois|trimestre|annee
?recherche=courses
?page=1&limit=10
```

### 5.2 Budgets

| Opération frontend                      | Méthode HTTP | Endpoint        |
|-----------------------------------------|--------------|-----------------|
| Lire tous les budgets                   | `GET`        | `/budgets`      |
| Mettre à jour un budget par catégorie   | `PATCH`      | `/budgets/:categorieId` |

### 5.3 Préférences

| Opération frontend              | Méthode HTTP | Endpoint        |
|---------------------------------|--------------|-----------------|
| Lire les préférences            | `GET`        | `/preferences`  |
| Mettre à jour les préférences   | `PATCH`      | `/preferences`  |

---

## 6. Logique métier à reproduire côté backend

Ces calculs sont actuellement faits côté frontend (dans les composants).
Il est recommandé d'exposer des endpoints dédiés pour éviter de transférer
toutes les transactions brutes au client.

### 6.1 KPIs Dashboard (Dashboard.jsx)

```
GET /stats/summary?annee=2026&mois=3
```

Réponse attendue :
```json
{
  "soldeMois": 1229.21,
  "revenusMois": 2850.00,
  "depensesMois": 1620.79,
  "epargneMois": 1229.21,
  "tauxEpargne": 43,
  "nbRevenusMois": 1,
  "nbDepensesMois": 9,
  "tendanceVsMoisPrecedent": 12.4
}
```

### 6.2 Graphique courbes 6 mois (Dashboard.jsx + Statistiques.jsx)

```
GET /stats/evolution?mois=6
```

Réponse attendue :
```json
[
  { "mois": "Oct", "revenus": 2850, "depenses": 1700 },
  { "mois": "Nov", "revenus": 2850, "depenses": 1600 },
  ...
]
```

### 6.3 Répartition dépenses par catégorie (Dashboard.jsx + Statistiques.jsx)

```
GET /stats/categories?annee=2026&mois=3
```

Réponse attendue :
```json
[
  { "categorieId": "logement",     "label": "Logement",     "montant": 850,   "pct": 48 },
  { "categorieId": "alimentation", "label": "Alimentation", "montant": 320,   "pct": 18 },
  ...
]
```

### 6.4 Budget utilisé par catégorie (Categories.jsx + Parametres.jsx)

```
GET /stats/budget-usage?annee=2026&mois=3
```

Réponse attendue :
```json
[
  { "categorieId": "alimentation", "depense": 320, "budget": 500, "pct": 64 },
  { "categorieId": "transport",    "depense": 210, "budget": 200, "pct": 100 },
  ...
]
```

---

## 7. Architecture NestJS recommandée

```
backend/
├── src/
│   ├── app.module.ts
│   ├── transactions/
│   │   ├── transactions.module.ts
│   │   ├── transactions.controller.ts
│   │   ├── transactions.service.ts
│   │   ├── dto/
│   │   │   ├── create-transaction.dto.ts
│   │   │   └── update-transaction.dto.ts
│   │   └── entities/
│   │       └── transaction.entity.ts
│   ├── budgets/
│   │   ├── budgets.module.ts
│   │   ├── budgets.controller.ts
│   │   ├── budgets.service.ts
│   │   └── entities/
│   │       └── budget.entity.ts
│   ├── preferences/
│   │   ├── preferences.module.ts
│   │   ├── preferences.controller.ts
│   │   ├── preferences.service.ts
│   │   └── entities/
│   │       └── preferences.entity.ts
│   └── stats/
│       ├── stats.module.ts
│       ├── stats.controller.ts
│       └── stats.service.ts
└── ...
```

### DTOs principaux

**CreateTransactionDto :**
```typescript
export class CreateTransactionDto {
  type: 'revenu' | 'depense';
  categorie: string;       // doit être un ID valide de la liste des catégories
  description: string;
  montant: number;         // > 0
  date: string;            // format YYYY-MM-DD
  note?: string;
  statut: 'paye' | 'en_attente';
}
```

**UpdateTransactionDto :**
```typescript
export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
```

**UpdateBudgetDto :**
```typescript
export class UpdateBudgetDto {
  montant: number;   // >= 0
}
```

**UpdatePreferencesDto :**
```typescript
export class UpdatePreferencesDto {
  nom?: string;
  devise?: '€' | '$' | '£' | 'CHF';
  premierJour?: 'lundi' | 'dimanche';
  notifications?: boolean;
}
```

---

## 8. Base de données recommandée

**Option principale : PostgreSQL + TypeORM** (standard NestJS)

Schéma simplifié :

```sql
-- Transactions
CREATE TABLE transaction (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        VARCHAR(10) NOT NULL CHECK (type IN ('revenu', 'depense')),
  categorie   VARCHAR(50) NOT NULL,
  description VARCHAR(255) NOT NULL,
  montant     DECIMAL(10,2) NOT NULL CHECK (montant > 0),
  date        DATE NOT NULL,
  note        TEXT DEFAULT '',
  statut      VARCHAR(20) NOT NULL CHECK (statut IN ('paye', 'en_attente')),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Budgets (un enregistrement par catégorie)
CREATE TABLE budget (
  categorie_id VARCHAR(50) PRIMARY KEY,
  montant      DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- Préférences (un seul enregistrement pour l'instant, évolutif vers multi-user)
CREATE TABLE preferences (
  id           INTEGER PRIMARY KEY DEFAULT 1,
  nom          VARCHAR(100) DEFAULT 'Utilisateur',
  devise       VARCHAR(5)   DEFAULT '€',
  premier_jour VARCHAR(10)  DEFAULT 'lundi',
  notifications BOOLEAN     DEFAULT true
);
```

> **Note multi-utilisateur :** Pour l'instant le projet est mono-utilisateur.
> Quand l'authentification sera ajoutée (JWT), il faudra ajouter une colonne
> `user_id` sur `transaction`, `budget` et `preferences`.

---

## 9. Adaptation du frontend pour consommer l'API

Quand le backend sera prêt, le seul fichier à modifier côté frontend est
`src/context/BudgetContext.jsx`.

Il faudra :
1. Remplacer les lectures `loadFromLS()` par des appels `fetch` ou `axios` vers l'API
2. Remplacer les mutations (`setTransactions`, etc.) par des appels API + re-fetch
3. Ajouter un état `loading` et `error` dans le contexte
4. Gérer l'authentification (token JWT dans les headers)

Les composants (Dashboard, Transactions, etc.) **n'ont pas besoin d'être modifiés**
car ils consomment uniquement le contexte via `useBudget()`.

---

## 10. CORS et configuration

Le frontend tourne sur `http://localhost:5173` (Vite dev server).
Le backend NestJS devra autoriser cette origine en développement :

```typescript
// main.ts
app.enableCors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
});
```

---

## 11. Résumé des priorités d'implémentation

| Priorité | Module        | Raison                                              |
|----------|---------------|-----------------------------------------------------|
| 1        | Transactions  | Cœur de l'application, toutes les pages en dépendent |
| 2        | Stats         | Dashboard et Statistiques les utilisent directement  |
| 3        | Budgets       | Paramètres + Categories                              |
| 4        | Préférences   | Fonctionnalité secondaire (nom, devise, etc.)         |
| 5        | Auth (JWT)    | Évolution future pour le multi-utilisateur           |
