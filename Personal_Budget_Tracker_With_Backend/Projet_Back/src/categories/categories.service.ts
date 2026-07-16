import { Injectable } from '@nestjs/common';

/**
 * @Injectable CategoriesService
 *
 * Les catégories sont STATIQUES dans ce projet.
 * Elles sont définies dans src/data/categories.js côté frontend
 * et dans les DTOs de validation côté backend.
 *
 * Ce service expose simplement la liste des catégories connues
 * si jamais le frontend en avait besoin via un endpoint.
 *
 * Pour l'instant, le frontend les charge localement depuis categories.js.
 * Ce module peut être étendu plus tard pour gérer des catégories personnalisées.
 */
@Injectable()
export class CategoriesService {
  /**
   * Référentiel complet des catégories.
   * Doit rester en sync avec :
   * - Frontend : src/data/categories.js
   * - Backend : CreateTransactionDto (liste @IsIn)
   * - Backend : BudgetsService (CATEGORIES_DEPENSES)
   */
  private readonly categories = [
    // ── Dépenses ──────────────────────────────────
    { id: 'alimentation', label: 'Alimentation', type: 'depense' },
    { id: 'transport', label: 'Transport', type: 'depense' },
    { id: 'logement', label: 'Logement', type: 'depense' },
    { id: 'shopping', label: 'Shopping', type: 'depense' },
    { id: 'loisirs', label: 'Loisirs', type: 'depense' },
    { id: 'sante', label: 'Santé', type: 'depense' },
    { id: 'factures', label: 'Factures', type: 'depense' },
    { id: 'education', label: 'Éducation', type: 'depense' },
    { id: 'autre_depense', label: 'Autre', type: 'depense' },
    // ── Revenus ───────────────────────────────────
    { id: 'salaire', label: 'Salaire', type: 'revenu' },
    { id: 'freelance', label: 'Freelance', type: 'revenu' },
    { id: 'investissement', label: 'Investissement', type: 'revenu' },
    { id: 'cadeau', label: 'Cadeau', type: 'revenu' },
    { id: 'autre_revenu', label: 'Autre revenu', type: 'revenu' },
  ];

  findAll() {
    return this.categories;
  }

  findByType(type: 'revenu' | 'depense') {
    return this.categories.filter((c) => c.type === type);
  }
}
