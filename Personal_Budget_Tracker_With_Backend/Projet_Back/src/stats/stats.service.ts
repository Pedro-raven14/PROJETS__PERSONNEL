import { Injectable } from '@nestjs/common';
import { TransactionsService } from '../transactions/transactions.service';
import { BudgetsService } from '../budgets/budgets.service';
import { Transaction } from '../transactions/entities/transaction.entity';

/**
 * Référentiel des labels de catégories.
 * On en a besoin ici pour construire les réponses de stats.
 * IMPORTANT : garder synchronized avec categories.js côté frontend.
 */
const CATEGORY_LABELS: Record<string, string> = {
  alimentation: 'Alimentation',
  transport: 'Transport',
  logement: 'Logement',
  shopping: 'Shopping',
  loisirs: 'Loisirs',
  sante: 'Santé',
  factures: 'Factures',
  education: 'Éducation',
  autre_depense: 'Autre',
  salaire: 'Salaire',
  freelance: 'Freelance',
  investissement: 'Investissement',
  cadeau: 'Cadeau',
  autre_revenu: 'Autre revenu',
};

/** Noms courts des mois pour les graphiques (même format que le frontend) */
const MOIS_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

/**
 * @Injectable StatsService
 *
 * Ce service orchestre des CALCULS à partir des données de transactions et de budgets.
 * Il n'a pas de repository propre : il délègue la lecture des données à
 * TransactionsService et BudgetsService (injectés via les exports de leurs modules).
 *
 * POURQUOI ne pas faire les calculs dans un controller ?
 * Les services portent la logique. Les controllers restent légers.
 * Si demain on ajoute un endpoint supplémentaire qui a besoin d'un calcul similaire,
 * on réutilise le service.
 */
@Injectable()
export class StatsService {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly budgetsService: BudgetsService,
  ) {}

  /**
   * GET /stats/summary?annee=2026&mois=3
   *
   * Calcule les KPIs du dashboard pour un mois donné :
   * - Solde du mois (revenus - dépenses)
   * - Total revenus du mois
   * - Total dépenses du mois
   * - Taux d'épargne en %
   * - Nombre de transactions de chaque type
   * - Tendance vs le mois précédent
   */
  async getSummary(annee: number, mois: number) {
    // Charger les transactions du mois demandé
    const txMois = await this.transactionsService.findByMonth(annee, mois);

    // Calculer les totaux du mois en cours
    const { revenus, depenses, nbRevenus, nbDepenses } = this.calculerTotaux(txMois);

    const soldeMois = revenus - depenses;
    const epargneMois = soldeMois; // Même valeur pour l'instant
    // Taux d'épargne = (épargne / revenus) * 100, arrondi à l'entier
    // Si revenus = 0, on évite la division par zéro
    const tauxEpargne = revenus > 0 ? Math.round((epargneMois / revenus) * 100) : 0;

    // Calculer la tendance vs le mois précédent
    // Si on est en janvier (mois = 1), le mois précédent est décembre de l'année précédente
    const moisPrecedent = mois === 1 ? 12 : mois - 1;
    const anneePrecedente = mois === 1 ? annee - 1 : annee;
    const txMoisPrecedent = await this.transactionsService.findByMonth(anneePrecedente, moisPrecedent);
    const { revenus: revPrecedent, depenses: depPrecedent } = this.calculerTotaux(txMoisPrecedent);
    const soldePrecedent = revPrecedent - depPrecedent;

    /**
     * Tendance = variation du solde en % par rapport au mois précédent.
     * Si le mois précédent avait un solde de 1000 et le mois actuel 1124 :
     * tendance = ((1124 - 1000) / 1000) * 100 = +12.4%
     * Si le mois précédent avait un solde de 0, on retourne 0 pour éviter Infinity.
     */
    let tendanceVsMoisPrecedent = 0;
    if (soldePrecedent !== 0) {
      tendanceVsMoisPrecedent = Math.round(((soldeMois - soldePrecedent) / Math.abs(soldePrecedent)) * 100 * 10) / 10;
    }

    return {
      soldeMois: this.arrondir(soldeMois),
      revenusMois: this.arrondir(revenus),
      depensesMois: this.arrondir(depenses),
      epargneMois: this.arrondir(epargneMois),
      tauxEpargne,
      nbRevenusMois: nbRevenus,
      nbDepensesMois: nbDepenses,
      tendanceVsMoisPrecedent,
    };
  }

  /**
   * GET /stats/evolution?mois=6
   *
   * Calcule l'évolution revenus/dépenses sur les N derniers mois.
   * Utilisé pour le graphique de courbes sur le Dashboard et Statistiques.
   *
   * Stratégie :
   * 1. Charger toutes les transactions des N derniers mois en une seule requête
   * 2. Les regrouper par mois côté JavaScript (plus efficace que N requêtes SQL)
   * 3. Construire le tableau de résultats avec le label du mois
   */
  async getEvolution(nbMois: number) {
    const transactions = await this.transactionsService.findLastNMonths(nbMois);

    // Construire la liste des N derniers mois (ex: pour 6 mois en mars 2026 : oct, nov, déc, jan, fév, mar)
    const moisList: Array<{ annee: number; mois: number; label: string }> = [];
    const today = new Date();
    for (let i = nbMois - 1; i >= 0; i--) {
      // new Date(annee, mois - 1 - i, 1) = date du début du mois i mois en arrière
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      moisList.push({
        annee: d.getFullYear(),
        mois: d.getMonth() + 1, // getMonth() est 0-indexé
        label: MOIS_LABELS[d.getMonth()],
      });
    }

    // Regrouper les transactions par "annee-mois" pour un accès rapide
    // On crée un Map : "2026-3" → [tx1, tx2, ...]
    const txParMois = new Map<string, Transaction[]>();
    for (const tx of transactions) {
      // La date est stockée comme "2026-03-05", on extrait "2026" et "3"
      const [anneeStr, moisStr] = tx.date.split('-');
      const key = `${anneeStr}-${parseInt(moisStr, 10)}`;
      if (!txParMois.has(key)) txParMois.set(key, []);
      txParMois.get(key)!.push(tx); // "!" = non-null assertion, on vient de créer la clé si absente
    }

    // Construire le résultat final
    return moisList.map(({ annee, mois, label }) => {
      const key = `${annee}-${mois}`;
      const txDuMois = txParMois.get(key) ?? [];
      const { revenus, depenses } = this.calculerTotaux(txDuMois);
      return {
        mois: label,
        revenus: this.arrondir(revenus),
        depenses: this.arrondir(depenses),
      };
    });
  }

  /**
   * GET /stats/categories?annee=2026&mois=3
   *
   * Répartition des dépenses par catégorie pour un mois donné.
   * Utilisé pour le graphique camembert/donut sur Dashboard et Statistiques.
   *
   * Retourne le montant et le pourcentage de chaque catégorie
   * par rapport au total des dépenses du mois.
   */
  async getCategoriesRepartition(annee: number, mois: number) {
    const txMois = await this.transactionsService.findByMonth(annee, mois);

    // Ne garder que les dépenses
    const depenses = txMois.filter((tx) => tx.type === 'depense');

    // Regrouper par catégorie : { alimentation: 320, transport: 210, ... }
    const parCategorie = new Map<string, number>();
    for (const tx of depenses) {
      const current = parCategorie.get(tx.categorie) ?? 0;
      parCategorie.set(tx.categorie, current + Number(tx.montant));
    }

    // Total des dépenses du mois (pour calculer les %)
    const totalDepenses = [...parCategorie.values()].reduce((a, b) => a + b, 0);

    // Construire le tableau résultat, triée par montant décroissant
    const result = [...parCategorie.entries()]
      .map(([categorieId, montant]) => ({
        categorieId,
        label: CATEGORY_LABELS[categorieId] ?? categorieId,
        montant: this.arrondir(montant),
        // Pourcentage arrondi à l'entier, 0 si pas de dépenses
        pct: totalDepenses > 0 ? Math.round((montant / totalDepenses) * 100) : 0,
      }))
      .sort((a, b) => b.montant - a.montant); // Plus grosse dépense en premier

    return result;
  }

  /**
   * GET /stats/budget-usage?annee=2026&mois=3
   *
   * Compare les dépenses réelles aux budgets définis, par catégorie.
   * Utilisé dans Categories.jsx et Parametres.jsx.
   *
   * Pour chaque catégorie de dépenses :
   * - montant dépensé ce mois
   * - budget alloué pour le mois
   * - pourcentage utilisé (peut dépasser 100% si dépassement)
   */
  async getBudgetUsage(annee: number, mois: number) {
    // Charger en parallèle pour optimiser les temps de réponse
    // Promise.all([p1, p2]) attend que les deux promesses se terminent
    // avant de continuer → plus rapide que deux await séquentiels
    const [txMois, budgets] = await Promise.all([
      this.transactionsService.findByMonth(annee, mois),
      this.budgetsService.findAllWithDetails(),
    ]);

    // Calculer les dépenses réelles par catégorie pour ce mois
    const depensesParCat = new Map<string, number>();
    for (const tx of txMois) {
      if (tx.type !== 'depense') continue; // On ignore les revenus
      const current = depensesParCat.get(tx.categorie) ?? 0;
      depensesParCat.set(tx.categorie, current + Number(tx.montant));
    }

    // Construire le résultat pour toutes les catégories de dépenses
    return budgets.map((budget) => {
      const depense = depensesParCat.get(budget.categorieId) ?? 0;
      const montantBudget = Number(budget.montant);

      /**
       * Calcul du pourcentage :
       * - Si budget = 0 → on ne peut pas calculer un %, on retourne 0
       *   (ça évite d'afficher une barre à 100% pour les catégories sans budget)
       * - Sinon : (dépense / budget) * 100, sans arrondir le cap à 100
       *   (le frontend peut afficher "120%" pour signaler un dépassement)
       */
      const pct = montantBudget > 0 ? Math.round((depense / montantBudget) * 100) : 0;

      return {
        categorieId: budget.categorieId,
        label: budget.label,
        depense: this.arrondir(depense),
        budget: montantBudget,
        pct,
      };
    });
  }

  // ─── Méthodes utilitaires privées ─────────────────────────────────────────

  /**
   * Calcule les totaux revenus/dépenses et compte les transactions.
   * Méthode privée réutilisée dans plusieurs calculs.
   *
   * Number(tx.montant) est nécessaire car TypeORM retourne les colonnes
   * decimal en string (comportement PostgreSQL/TypeORM).
   */
  private calculerTotaux(transactions: Transaction[]) {
    let revenus = 0;
    let depenses = 0;
    let nbRevenus = 0;
    let nbDepenses = 0;

    for (const tx of transactions) {
      const montant = Number(tx.montant);
      if (tx.type === 'revenu') {
        revenus += montant;
        nbRevenus++;
      } else {
        depenses += montant;
        nbDepenses++;
      }
    }

    return { revenus, depenses, nbRevenus, nbDepenses };
  }

  /**
   * Arrondit un nombre à 2 décimales.
   * Utilisé systématiquement pour éviter les nombres flottants parasites
   * (ex: 142.50000000001 au lieu de 142.50).
   *
   * Math.round(x * 100) / 100 est plus fiable que .toFixed(2) qui retourne une string.
   */
  private arrondir(n: number): number {
    return Math.round(n * 100) / 100;
  }
}
