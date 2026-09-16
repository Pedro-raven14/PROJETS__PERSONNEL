// ─────────────────────────────────────────────────────────────────────────────
// Utilitaires centralisés : formatage monétaire + helpers de date
// ─────────────────────────────────────────────────────────────────────────────

// Mapping devise symbol → code ISO 4217 (pour Intl.NumberFormat)
const DEVISE_TO_CURRENCY: Record<string, string> = {
  '€':   'EUR',
  '$':   'USD',
  '£':   'GBP',
  'CHF': 'CHF',
};

/**
 * Formate un nombre en devise locale.
 * @param n       - Valeur numérique à formater
 * @param devise  - Symbole de devise stocké dans les préférences ('€', '$', '£', 'CHF')
 *                  Par défaut '€' (EUR).
 */
export function fmt(n: number, devise = '€'): string {
  const currency = DEVISE_TO_CURRENCY[devise] ?? 'EUR';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(n);
}

// ─────────────────────────────────────────────────────────────────────────────
// Types partagés
// ─────────────────────────────────────────────────────────────────────────────

export type TransactionType = 'revenu' | 'depense';
export type TransactionStatut = 'paye' | 'en_attente';

export interface Transaction {
  id:          string;
  type:        TransactionType;
  categorie:   string;
  description: string;
  montant:     number;
  date:        string;       // ISO date string 'YYYY-MM-DD'
  note:        string;
  statut:      TransactionStatut;
}

export interface Preferences {
  nom:           string;
  devise:        string;
  premierJour:   'lundi' | 'dimanche';
  notifications: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de date
// ─────────────────────────────────────────────────────────────────────────────

export const MOIS_FR = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'] as const;

/**
 * Filtre les transactions appartenant à un mois/année donné.
 */
export function filterByMonth(
  transactions: Transaction[],
  annee: number,
  mois: number,
): Transaction[] {
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === annee && d.getMonth() === mois;
  });
}

/**
 * Calcule le mois/année précédent.
 */
export function prevMonth(annee: number, mois: number): { annee: number; mois: number } {
  if (mois === 0) return { annee: annee - 1, mois: 11 };
  return { annee, mois: mois - 1 };
}

/**
 * Retourne les données (revenus + dépenses) pour chacun des N derniers mois
 * à partir du mois courant (inclus). Utile pour les graphiques en courbes.
 */
export function buildMonthlyData(
  transactions: Transaction[],
  anneeActu: number,
  moisActu: number,
  nbMois = 6,
): Array<{ mois: string; revenus: number; depenses: number }> {
  return Array.from({ length: nbMois }, (_, i) => {
    const offset = nbMois - 1 - i;
    let m = moisActu - offset;
    let y = anneeActu;
    if (m < 0) { m += 12; y -= 1; }
    const mTx = filterByMonth(transactions, y, m);
    const revenus  = mTx.filter((t) => t.type === 'revenu').reduce((s, t) => s + t.montant, 0);
    const depenses = mTx.filter((t) => t.type === 'depense').reduce((s, t) => s + t.montant, 0);
    return { mois: MOIS_FR[m], revenus, depenses };
  });
}

/**
 * Retourne les 12 mois d'une année (pour les graphiques en barres).
 */
export function buildYearlyData(
  transactions: Transaction[],
  annee: number,
): Array<{ mois: string; Revenus: number; Dépenses: number }> {
  return Array.from({ length: 12 }, (_, m) => {
    const mTx = filterByMonth(transactions, annee, m);
    return {
      mois:      MOIS_FR[m],
      Revenus:   mTx.filter((t) => t.type === 'revenu').reduce((s, t) => s + t.montant, 0),
      Dépenses:  mTx.filter((t) => t.type === 'depense').reduce((s, t) => s + t.montant, 0),
    };
  });
}

/**
 * Vérifie si une date ISO appartient à une période nommée.
 */
export function isInPeriod(dateStr: string, periode: 'mois' | 'trimestre' | 'annee' | 'tout'): boolean {
  const d   = new Date(dateStr);
  const now = new Date();
  const y   = now.getFullYear();
  const m   = now.getMonth();
  if (periode === 'mois')      return d.getFullYear() === y && d.getMonth() === m;
  if (periode === 'trimestre') {
    const q  = Math.floor(m / 3);
    const dq = Math.floor(d.getMonth() / 3);
    return d.getFullYear() === y && dq === q;
  }
  if (periode === 'annee') return d.getFullYear() === y;
  return true;
}
