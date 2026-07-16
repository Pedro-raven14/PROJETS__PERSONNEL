/**
 * BudgetContext — Contexte global de l'application Budget Tracker
 *
 * AVANT : toutes les données venaient du localStorage (lecture/écriture locale).
 * MAINTENANT : toutes les données viennent de l'API REST NestJS via Axios.
 *
 * IMPORTANT : les composants (Dashboard, Transactions, etc.) n'ont PAS été modifiés.
 * Ils appellent toujours useBudget() et obtiennent les mêmes valeurs.
 * C'est la puissance du pattern Context : on change la source de données
 * sans toucher à l'UI.
 *
 * NOUVEAUTÉS par rapport à la version localStorage :
 * - État `loading` : true pendant les chargements initiaux
 * - État `error`   : message d'erreur si l'API est inaccessible
 * - Toutes les mutations (ajouter, modifier, supprimer) sont async
 *   et déclenchent un re-fetch pour garder l'état synchronisé avec la BDD
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getAllTransactions, createTransaction, updateTransaction, deleteTransaction } from '../services/transactionsApi';
import { getBudgets, updateBudget } from '../services/budgetsApi';
import { getPreferences, updatePreferences } from '../services/preferencesApi';

// ──────────────────────────────────────────────────────────────
// Valeurs par défaut (affichées le temps du chargement initial)
// ──────────────────────────────────────────────────────────────
const DEFAULT_PREFERENCES = {
  nom: 'Utilisateur',
  devise: '€',
  premierJour: 'lundi',
  notifications: true,
};

// ──────────────────────────────────────────────────────────────
// Création du Context
// ──────────────────────────────────────────────────────────────
const BudgetContext = createContext(null);

// ──────────────────────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────────────────────
export function BudgetProvider({ children }) {
  // ── État des données ────────────────────────────────────────
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets]           = useState({});
  const [preferences, setPreferences]   = useState(DEFAULT_PREFERENCES);

  // ── État du chargement et des erreurs ───────────────────────
  /**
   * loading : true pendant le chargement initial des données.
   * Les composants peuvent afficher un spinner pendant ce temps.
   *
   * error : null si tout va bien, string avec le message d'erreur sinon.
   * Affiché dans le JSX de BudgetProvider pour informer l'utilisateur.
   */
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // ──────────────────────────────────────────────────────────────
  // Chargement initial — appelé au montage du composant
  // ──────────────────────────────────────────────────────────────
  /**
   * useCallback mémoïse la fonction pour éviter de la recréer à chaque rendu.
   * [] comme dépendances = la fonction ne change jamais.
   *
   * POURQUOI Promise.all([...]) plutôt que 3 await séquentiels ?
   * await tx = attend la fin de la requête transactions (~100ms)
   * await budgets = attend la fin des budgets (~80ms)  ← séquentiel = 180ms total
   *
   * Promise.all([tx, budgets, prefs]) lance les 3 en PARALLÈLE → ~100ms total
   * C'est 2x plus rapide !
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Lance les 3 requêtes en parallèle
      const [txData, budgetsData, prefsData] = await Promise.all([
        getAllTransactions(),
        getBudgets(),
        getPreferences(),
      ]);

      setTransactions(txData);
      setBudgets(budgetsData);
      setPreferences(prefsData);
    } catch (err) {
      /**
       * Si une erreur survient (backend éteint, réseau coupé...),
       * on stocke le message pour l'afficher à l'utilisateur.
       * err.message est enrichi par l'intercepteur de apiClient.js.
       */
      setError(err.message || 'Erreur de connexion au serveur');
      console.error('[BudgetContext] Erreur de chargement :', err);
    } finally {
      // finally = exécuté dans tous les cas (succès ou erreur)
      setLoading(false);
    }
  }, []);

  /**
   * useEffect avec [] = s'exécute UNE SEULE FOIS au montage du Provider.
   * C'est l'équivalent de componentDidMount en class components.
   * On charge les données dès que l'app démarre.
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  // ──────────────────────────────────────────────────────────────
  // MUTATIONS — Transactions
  // ──────────────────────────────────────────────────────────────

  /**
   * Ajoute une nouvelle transaction.
   *
   * STRATÉGIE "optimiste" vs "re-fetch" :
   * On aurait pu faire une mise à jour optimiste (ajouter directement dans le state
   * avant la réponse API pour un affichage immédiat), mais on préfère re-fetcher
   * pour avoir les données exactes de la BDD (ID UUID, timestamps...).
   *
   * @param {Object} data - Données de la transaction (sans id)
   */
  const ajouterTransaction = useCallback(async (data) => {
    // createTransaction fait POST /transactions et retourne la transaction créée avec son UUID
    const nouvelle = await createTransaction(data);
    // On ajoute au début du tableau (la plus récente en premier)
    setTransactions((prev) => [nouvelle, ...prev]);
  }, []);

  /**
   * Modifie une transaction existante.
   *
   * POURQUOI mettre à jour le state local EN PLUS d'appeler l'API ?
   * Pour éviter un re-fetch complet de toutes les transactions après chaque modif.
   * On remplace l'élément dans le tableau existant directement en mémoire.
   *
   * @param {string} id   - UUID de la transaction
   * @param {Object} data - Champs à modifier
   */
  const modifierTransaction = useCallback(async (id, data) => {
    const updated = await updateTransaction(id, data);
    // Remplace l'ancienne transaction par la version mise à jour
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? updated : t))
    );
  }, []);

  /**
   * Supprime une transaction.
   *
   * @param {string} id - UUID de la transaction à supprimer
   */
  const supprimerTransaction = useCallback(async (id) => {
    await deleteTransaction(id);
    // Retire la transaction du state sans re-fetcher tout
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ──────────────────────────────────────────────────────────────
  // MUTATIONS — Budgets
  // ──────────────────────────────────────────────────────────────

  /**
   * Met à jour le budget mensuel d'une catégorie.
   *
   * Le backend retourne TOUS les budgets mis à jour après le PATCH.
   * On remplace donc tout le state budgets d'un coup.
   *
   * @param {string} categorieId - ID de la catégorie (ex: 'alimentation')
   * @param {number} montant     - Nouveau montant (>= 0)
   */
  const mettreAJourBudget = useCallback(async (categorieId, montant) => {
    // Mise à jour optimiste : on met à jour le state immédiatement
    // pour que le slider/input réagisse instantanément sans attendre l'API
    setBudgets((prev) => ({ ...prev, [categorieId]: Number(montant) }));

    // Puis on synchro avec l'API en arrière-plan
    // Si l'API échoue, on pourrait roll-back, mais pour une app perso c'est ok
    const updatedBudgets = await updateBudget(categorieId, montant);
    setBudgets(updatedBudgets);
  }, []);

  // ──────────────────────────────────────────────────────────────
  // MUTATIONS — Préférences
  // ──────────────────────────────────────────────────────────────

  /**
   * Met à jour les préférences utilisateur.
   *
   * Même stratégie optimiste : mise à jour immédiate du state,
   * puis synchronisation avec l'API.
   *
   * @param {Object} data - Champs à modifier (nom, devise, premierJour, notifications)
   */
  const mettreAJourPreferences = useCallback(async (data) => {
    // Mise à jour optimiste pour que l'UI réponde immédiatement
    setPreferences((prev) => ({ ...prev, ...data }));
    // Synchronisation avec l'API
    const updated = await updatePreferences(data);
    setPreferences(updated);
  }, []);

  // ──────────────────────────────────────────────────────────────
  // CALCULS UTILITAIRES (conservés pour compatibilité avec les composants)
  // ──────────────────────────────────────────────────────────────

  /**
   * Retourne les transactions d'un mois spécifique.
   * Utilisé par Dashboard.jsx pour les calculs côté frontend.
   *
   * Note : mois est 0-indexed ici (comme Date.getMonth())
   * pour la compatibilité avec les composants existants.
   */
  const getTransactionsDuMois = useCallback((annee, mois) => {
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === annee && d.getMonth() === mois;
    });
  }, [transactions]);

  /**
   * Calcule le solde total de toutes les transactions (tous mois confondus).
   * Revenus moins dépenses.
   */
  const getSoldeTotal = useCallback(() => {
    return transactions.reduce((acc, t) => {
      return t.type === 'revenu' ? acc + Number(t.montant) : acc - Number(t.montant);
    }, 0);
  }, [transactions]);

  // ──────────────────────────────────────────────────────────────
  // RENDU
  // ──────────────────────────────────────────────────────────────

  /**
   * Affichage pendant le chargement initial.
   * Empêche les composants de se rendre avec des données vides
   * et d'afficher des valeurs à 0 ou des erreurs.
   */
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          <p className="text-sm text-slate-500">Chargement des données...</p>
        </div>
      </div>
    );
  }

  /**
   * Affichage en cas d'erreur de connexion au backend.
   * Donne à l'utilisateur un message clair et un bouton de retry.
   */
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC] p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-red-100 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="mb-2 text-lg font-bold text-slate-800">Connexion impossible</h2>
          <p className="mb-6 text-sm text-slate-500">{error}</p>
          <button
            onClick={loadData}
            className="w-full rounded-xl bg-sky-500 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <BudgetContext.Provider
      value={{
        // ── Données ─────────────────────────────────────────
        transactions,
        budgets,
        preferences,
        // ── État ────────────────────────────────────────────
        loading,
        error,
        // ── Actions transactions ─────────────────────────────
        ajouterTransaction,
        modifierTransaction,
        supprimerTransaction,
        // ── Actions budgets ──────────────────────────────────
        mettreAJourBudget,
        // ── Actions préférences ──────────────────────────────
        mettreAJourPreferences,
        // ── Utilitaires ─────────────────────────────────────
        getTransactionsDuMois,
        getSoldeTotal,
        // ── Refresh manuel ───────────────────────────────────
        refreshData: loadData,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

// ──────────────────────────────────────────────────────────────
// Hook personnalisé
// ──────────────────────────────────────────────────────────────
/**
 * useBudget — Hook d'accès au contexte.
 *
 * Lance une erreur explicite si utilisé en dehors de BudgetProvider.
 * Beaucoup plus clair que "Cannot read properties of null".
 */
export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget doit être utilisé dans BudgetProvider');
  return ctx;
}
