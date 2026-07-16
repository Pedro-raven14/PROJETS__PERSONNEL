/**
 * Service API — Préférences utilisateur
 *
 * Un seul enregistrement en base (id = 1, mono-utilisateur).
 * Créé automatiquement au démarrage du backend.
 */

import apiClient from '../Config/api';

/**
 * Récupère les préférences actuelles de l'utilisateur.
 *
 * @returns {{ id, nom, devise, premierJour, notifications }}
 */
export const getPreferences = async () => {
  const response = await apiClient.get('/preferences');
  return response.data;
};

/**
 * Met à jour partiellement les préférences (PATCH).
 * On peut envoyer un seul champ ou tous les champs.
 *
 * @param {Object} updates - Champs à modifier
 * @param {string}  [updates.nom]
 * @param {string}  [updates.devise]       - '€' | '$' | '£' | 'CHF'
 * @param {string}  [updates.premierJour]  - 'lundi' | 'dimanche'
 * @param {boolean} [updates.notifications]
 *
 * @returns {{ id, nom, devise, premierJour, notifications }}
 */
export const updatePreferences = async (updates) => {
  const response = await apiClient.patch('/preferences', updates);
  return response.data;
};
