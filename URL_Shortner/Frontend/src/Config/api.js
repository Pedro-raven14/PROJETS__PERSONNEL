/**
 * ─────────────────────────────────────────────────────────────────────────────
 * API.JS — Couche d'abstraction des appels backend LinkShort
 * ─────────────────────────────────────────────────────────────────────────────
 */

import apiClient from './apiClient';

/**
 * Créer un lien court.
 * @param {string} originalUrl - L'URL longue à raccourcir
 * @param {number} [expiresInDays] - Durée de vie optionnelle en jours
 * @returns {{ id, originalUrl, shortCode, shortUrl, clicks, expiresAt, createdAt }}
 */
export async function shortenUrl(originalUrl, expiresInDays) {
  const payload = { originalUrl };
  if (expiresInDays) payload.expiresInDays = expiresInDays;
  const { data } = await apiClient.post('/urls', payload);
  return data;
}

/**
 * Récupérer les statistiques globales.
 * @returns {{ totalLinks, totalClicks, conversionRate }}
 */
export async function getStats() {
  const { data } = await apiClient.get('/urls/stats');
  return data;
}

/**
 * Récupérer tous les liens.
 * @returns {Array}
 */
export async function getAllUrls() {
  const { data } = await apiClient.get('/urls');
  return data;
}

/**
 * Supprimer un lien par son ID.
 * @param {string} id
 */
export async function deleteUrl(id) {
  await apiClient.delete(`/urls/${id}`);
}
