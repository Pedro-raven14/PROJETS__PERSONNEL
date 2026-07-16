/**
 * Service API — Budgets
 *
 * Les budgets sont des enregistrements un-par-catégorie en base de données.
 * Le backend les initialise à 0 au démarrage (OnModuleInit).
 */

import apiClient from '../Config/api';

/**
 * Récupère tous les budgets sous forme d'objet clé-valeur.
 *
 * @returns {Record<string, number>} - Ex: { alimentation: 500, transport: 200, ... }
 *
 * Le backend retourne exactement ce format (voir BudgetsService.findAll()).
 * C'est le même format qu'utilisait localStorage avant.
 */
export const getBudgets = async () => {
  const response = await apiClient.get('/budgets');
  return response.data; // { alimentation: 500, transport: 200, ... }
};

/**
 * Met à jour le budget d'une catégorie spécifique.
 *
 * @param {string} categorieId - ID de la catégorie (ex: 'alimentation')
 * @param {number} montant     - Nouveau montant du budget (>= 0)
 * @returns {Record<string, number>} - Tous les budgets mis à jour
 *
 * Le backend retourne tous les budgets après la mise à jour
 * pour éviter un second appel GET.
 */
export const updateBudget = async (categorieId, montant) => {
  const response = await apiClient.patch(`/budgets/${categorieId}`, { montant: Number(montant) });
  return response.data;
};
