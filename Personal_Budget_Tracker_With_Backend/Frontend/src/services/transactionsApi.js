/**
 * Service API — Transactions
 *
 * POURQUOI séparer les appels API dans des fichiers "service" ?
 * Principe de Responsabilité Unique (SRP) :
 * - Le contexte (BudgetContext) gère l'état React
 * - Les services gèrent la communication HTTP
 *
 * Si on change d'API ou de bibliothèque HTTP, on ne modifie que ces fichiers.
 * Les composants et le contexte ne savent même pas qu'axios existe.
 */

import apiClient from '../Config/api';

/**
 * Récupère toutes les transactions avec filtres optionnels.
 *
 * @param {Object} filters - Filtres de la requête
 * @param {string} [filters.type]       - 'revenu' | 'depense'
 * @param {string} [filters.categorie]  - ID de catégorie
 * @param {string} [filters.dateDebut]  - Date début YYYY-MM-DD
 * @param {string} [filters.dateFin]    - Date fin YYYY-MM-DD
 * @param {string} [filters.statut]     - 'paye' | 'en_attente'
 * @param {string} [filters.recherche]  - Texte libre
 * @param {number} [filters.page]       - Page (défaut: 1)
 * @param {number} [filters.limit]      - Éléments par page (défaut: 10)
 *
 * @returns {{ data: Transaction[], total: number, page: number, limit: number }}
 *
 * COMMENT axios gère les params :
 * axios.get('/transactions', { params: { type: 'depense', page: 1 } })
 * génère automatiquement : GET /transactions?type=depense&page=1
 * Les paramètres undefined/null sont ignorés automatiquement.
 */
export const getTransactions = async (filters = {}) => {
  const response = await apiClient.get('/transactions', { params: filters });
  return response.data; // { data: [...], total, page, limit }
};

/**
 * Récupère toutes les transactions sans pagination pour les calculs locaux.
 * Utilisé par les pages qui calculent des stats côté frontend.
 *
 * On force limit=1000 pour récupérer un max de données en un appel.
 * Pour un vrai projet de prod, on utiliserait les endpoints /stats/* du backend.
 */
export const getAllTransactions = async () => {
  const response = await apiClient.get('/transactions', {
    params: { limit: 1000, page: 1 },
  });
  return response.data.data; // retourne juste le tableau
};

/**
 * Crée une nouvelle transaction.
 *
 * @param {Object} transactionData - Données de la transaction (voir CreateTransactionDto)
 * @returns {Transaction} - La transaction créée avec son ID UUID
 */
export const createTransaction = async (transactionData) => {
  const response = await apiClient.post('/transactions', transactionData);
  return response.data;
};

/**
 * Met à jour partiellement une transaction (PATCH).
 *
 * POURQUOI PATCH et pas PUT ?
 * PUT remplace l'objet entier (on doit envoyer tous les champs).
 * PATCH met à jour seulement les champs envoyés → plus flexible.
 *
 * @param {string} id - UUID de la transaction
 * @param {Object} updates - Champs à mettre à jour
 * @returns {Transaction} - La transaction mise à jour
 */
export const updateTransaction = async (id, updates) => {
  const response = await apiClient.patch(`/transactions/${id}`, updates);
  return response.data;
};

/**
 * Supprime une transaction.
 *
 * @param {string} id - UUID de la transaction
 * @returns {{ message: string }}
 */
export const deleteTransaction = async (id) => {
  const response = await apiClient.delete(`/transactions/${id}`);
  return response.data;
};
