/**
 * Service API — Statistiques
 *
 * Ces endpoints évitent de transférer toutes les transactions brutes au frontend.
 * Le backend fait les calculs en SQL, le frontend reçoit juste les résultats.
 *
 * AVANTAGE : si on a 10 000 transactions, le frontend ne télécharge pas 10 000 lignes
 * pour calculer un solde. Le backend retourne juste un nombre.
 */

import apiClient from '../Config/api';

/**
 * KPIs du dashboard pour un mois donné.
 *
 * @param {number} annee - Année (ex: 2026)
 * @param {number} mois  - Mois 1-12 (ex: 3 pour mars)
 *
 * @returns {{
 *   soldeMois: number,
 *   revenusMois: number,
 *   depensesMois: number,
 *   epargneMois: number,
 *   tauxEpargne: number,
 *   nbRevenusMois: number,
 *   nbDepensesMois: number,
 *   tendanceVsMoisPrecedent: number
 * }}
 */
export const getSummary = async (annee, mois) => {
  const response = await apiClient.get('/stats/summary', { params: { annee, mois } });
  return response.data;
};

/**
 * Évolution revenus/dépenses sur les N derniers mois.
 *
 * @param {number} nbMois - Nombre de mois à afficher (défaut: 6)
 * @returns {Array<{ mois: string, revenus: number, depenses: number }>}
 */
export const getEvolution = async (nbMois = 6) => {
  const response = await apiClient.get('/stats/evolution', { params: { mois: nbMois } });
  return response.data;
};

/**
 * Répartition des dépenses par catégorie pour un mois donné.
 *
 * @param {number} annee
 * @param {number} mois
 * @returns {Array<{ categorieId, label, montant, pct }>}
 */
export const getCategoriesStats = async (annee, mois) => {
  const response = await apiClient.get('/stats/categories', { params: { annee, mois } });
  return response.data;
};

/**
 * Budget utilisé vs budget défini par catégorie.
 *
 * @param {number} annee
 * @param {number} mois
 * @returns {Array<{ categorieId, label, depense, budget, pct }>}
 */
export const getBudgetUsage = async (annee, mois) => {
  const response = await apiClient.get('/stats/budget-usage', { params: { annee, mois } });
  return response.data;
};
