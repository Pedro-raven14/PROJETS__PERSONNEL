import React, { createContext, useContext, useEffect, useState } from 'react';
import { BUDGET_CATEGORIES } from '../data/categories';

// ──────────────────────────────────────────────────────────────
// Données de démonstration pour avoir quelque chose à l'écran
// ──────────────────────────────────────────────────────────────
const DEMO_TRANSACTIONS = [
  { id: '1', type: 'revenu',  categorie: 'salaire',      description: 'Salaire Mars',          montant: 2850,  date: '2026-03-01', note: '', statut: 'paye' },
  { id: '2', type: 'depense', categorie: 'logement',     description: 'Loyer appartement',     montant: 850,   date: '2026-03-03', note: '', statut: 'paye' },
  { id: '3', type: 'depense', categorie: 'alimentation', description: 'Courses du mois',       montant: 142.5, date: '2026-03-05', note: '', statut: 'paye' },
  { id: '4', type: 'depense', categorie: 'transport',    description: 'Abonnement métro',      montant: 75,    date: '2026-03-06', note: '', statut: 'paye' },
  { id: '5', type: 'depense', categorie: 'loisirs',      description: 'Cinéma + restaurant',   montant: 48,    date: '2026-03-08', note: '', statut: 'en_attente' },
  { id: '6', type: 'depense', categorie: 'factures',     description: 'Facture électricité',   montant: 68.2,  date: '2026-03-10', note: '', statut: 'paye' },
  { id: '7', type: 'depense', categorie: 'shopping',     description: 'Vêtements printemps',   montant: 119.99,date: '2026-03-12', note: '', statut: 'paye' },
  { id: '8', type: 'depense', categorie: 'alimentation', description: 'Restaurant midi',       montant: 22.5,  date: '2026-03-14', note: '', statut: 'paye' },
  { id: '9', type: 'depense', categorie: 'sante',        description: 'Pharmacie',             montant: 34.1,  date: '2026-03-15', note: '', statut: 'paye' },
  { id: '10',type: 'depense', categorie: 'transport',    description: 'Essence',               montant: 55,    date: '2026-03-17', note: '', statut: 'paye' },
  // Mois précédents pour les graphiques
  { id: '11',type: 'revenu',  categorie: 'salaire',      description: 'Salaire Février',       montant: 2850,  date: '2026-02-01', note: '', statut: 'paye' },
  { id: '12',type: 'depense', categorie: 'logement',     description: 'Loyer Février',         montant: 850,   date: '2026-02-03', note: '', statut: 'paye' },
  { id: '13',type: 'depense', categorie: 'alimentation', description: 'Courses Février',       montant: 160,   date: '2026-02-06', note: '', statut: 'paye' },
  { id: '14',type: 'depense', categorie: 'transport',    description: 'Transport Février',     montant: 75,    date: '2026-02-07', note: '', statut: 'paye' },
  { id: '15',type: 'depense', categorie: 'loisirs',      description: 'Sortie Février',        montant: 60,    date: '2026-02-10', note: '', statut: 'paye' },
  { id: '16',type: 'revenu',  categorie: 'salaire',      description: 'Salaire Janvier',       montant: 2850,  date: '2026-01-01', note: '', statut: 'paye' },
  { id: '17',type: 'depense', categorie: 'logement',     description: 'Loyer Janvier',         montant: 850,   date: '2026-01-03', note: '', statut: 'paye' },
  { id: '18',type: 'depense', categorie: 'alimentation', description: 'Courses Janvier',       montant: 135,   date: '2026-01-07', note: '', statut: 'paye' },
  { id: '19',type: 'revenu',  categorie: 'salaire',      description: 'Salaire Décembre',      montant: 3200,  date: '2025-12-01', note: '', statut: 'paye' },
  { id: '20',type: 'depense', categorie: 'logement',     description: 'Loyer Décembre',        montant: 850,   date: '2025-12-03', note: '', statut: 'paye' },
  { id: '21',type: 'depense', categorie: 'shopping',     description: 'Cadeaux Noël',          montant: 280,   date: '2025-12-20', note: '', statut: 'paye' },
  { id: '22',type: 'revenu',  categorie: 'salaire',      description: 'Salaire Novembre',      montant: 2850,  date: '2025-11-01', note: '', statut: 'paye' },
  { id: '23',type: 'depense', categorie: 'logement',     description: 'Loyer Novembre',        montant: 850,   date: '2025-11-03', note: '', statut: 'paye' },
  { id: '24',type: 'revenu',  categorie: 'salaire',      description: 'Salaire Octobre',       montant: 2850,  date: '2025-10-01', note: '', statut: 'paye' },
  { id: '25',type: 'depense', categorie: 'logement',     description: 'Loyer Octobre',         montant: 850,   date: '2025-10-03', note: '', statut: 'paye' },
];

const DEFAULT_BUDGETS = Object.fromEntries(
  BUDGET_CATEGORIES.map((c) => [c.id, 0])
);

const DEFAULT_PREFERENCES = {
  nom: 'Utilisateur',
  devise: '€',
  premierJour: 'lundi',
  notifications: true,
};

// ──────────────────────────────────────────────────────────────
// Helpers localStorage
// ──────────────────────────────────────────────────────────────
const LS_KEYS = {
  TRANSACTIONS: 'bt_transactions',
  BUDGETS:      'bt_budgets',
  PREFS:        'bt_preferences',
};

function loadFromLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota dépassé */ }
}

// ──────────────────────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────────────────────
const BudgetContext = createContext(null);

export function BudgetProvider({ children }) {
  const [transactions, setTransactions] = useState(() =>
    loadFromLS(LS_KEYS.TRANSACTIONS, DEMO_TRANSACTIONS)
  );
  const [budgets, setBudgets] = useState(() =>
    loadFromLS(LS_KEYS.BUDGETS, DEFAULT_BUDGETS)
  );
  const [preferences, setPreferences] = useState(() =>
    loadFromLS(LS_KEYS.PREFS, DEFAULT_PREFERENCES)
  );

  // Persistance automatique
  useEffect(() => saveToLS(LS_KEYS.TRANSACTIONS, transactions), [transactions]);
  useEffect(() => saveToLS(LS_KEYS.BUDGETS, budgets),           [budgets]);
  useEffect(() => saveToLS(LS_KEYS.PREFS,   preferences),       [preferences]);

  // ── Transactions ──
  const ajouterTransaction = (data) => {
    const nouvelle = { ...data, id: crypto.randomUUID() };
    setTransactions((prev) => [nouvelle, ...prev]);
  };

  const modifierTransaction = (id, data) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
  };

  const supprimerTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // ── Budgets ──
  const mettreAJourBudget = (categorieId, montant) => {
    setBudgets((prev) => ({ ...prev, [categorieId]: Number(montant) }));
  };

  // ── Préférences ──
  const mettreAJourPreferences = (data) => {
    setPreferences((prev) => ({ ...prev, ...data }));
  };

  // ── Calculs utilitaires ──
  const getTransactionsDuMois = (annee, mois) => {
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === annee && d.getMonth() === mois;
    });
  };

  const getSoldeTotal = () => {
    return transactions.reduce((acc, t) => {
      return t.type === 'revenu' ? acc + t.montant : acc - t.montant;
    }, 0);
  };

  return (
    <BudgetContext.Provider
      value={{
        transactions,
        budgets,
        preferences,
        ajouterTransaction,
        modifierTransaction,
        supprimerTransaction,
        mettreAJourBudget,
        mettreAJourPreferences,
        getTransactionsDuMois,
        getSoldeTotal,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget doit être utilisé dans BudgetProvider');
  return ctx;
}
