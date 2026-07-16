import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './entities/budget.entity';
import { UpdateBudgetDto } from './dto/update-budget.dto';

/**
 * Liste statique des catégories de DÉPENSES avec leur label.
 * Cette liste est partagée entre le frontend (src/data/categories.js)
 * et le backend. Les IDs doivent correspondre EXACTEMENT.
 *
 * POURQUOI ici et pas dans un fichier séparé ?
 * Pour garder la cohérence : ce fichier initialise les budgets
 * par défaut au démarrage. Si les catégories changent, on modifie ici aussi.
 */
const CATEGORIES_DEPENSES = [
  { id: 'alimentation', label: 'Alimentation' },
  { id: 'transport', label: 'Transport' },
  { id: 'logement', label: 'Logement' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'loisirs', label: 'Loisirs' },
  { id: 'sante', label: 'Santé' },
  { id: 'factures', label: 'Factures' },
  { id: 'education', label: 'Éducation' },
  { id: 'autre_depense', label: 'Autre' },
];

/**
 * @Injectable BudgetsService
 *
 * implements OnModuleInit → méthode onModuleInit() appelée automatiquement
 * par NestJS au démarrage de l'application, APRÈS l'initialisation du module.
 * On l'utilise pour créer les enregistrements de budget par défaut
 * si la table est vide (premier lancement).
 */
@Injectable()
export class BudgetsService implements OnModuleInit {
  constructor(
    @InjectRepository(Budget)
    private readonly repo: Repository<Budget>,
  ) {}

  /**
   * Seed automatique au démarrage.
   *
   * POURQUOI ce seed ?
   * Le frontend affiche les budgets dès le premier chargement.
   * Si la table est vide, GET /budgets retournerait [] ce qui casserait l'UI.
   * On insère donc des budgets à 0 pour toutes les catégories de dépenses
   * si aucun enregistrement n'existe encore.
   *
   * save() avec un objet dont la PK existe déjà → UPDATE (grâce à @PrimaryColumn)
   * save() avec un nouvel objet → INSERT
   */
  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      // Créer les lignes budget par défaut (montant = 0)
      const budgets = CATEGORIES_DEPENSES.map((cat) =>
        this.repo.create({
          categorieId: cat.id,
          label: cat.label,
          montant: 0,
        }),
      );
      await this.repo.save(budgets);
      console.log('✅ Budgets par défaut créés pour toutes les catégories');
    }
  }

  /**
   * Retourne TOUS les budgets sous forme d'objet clé-valeur.
   *
   * Le frontend attend ce format (voir BACKEND_GUIDE §3.2) :
   * { "alimentation": 500, "transport": 200, ... }
   *
   * On transforme le tableau de la BDD en objet grâce à reduce().
   * reduce() construit un objet en accumulant les paires { categorieId: montant }.
   */
  async findAll(): Promise<Record<string, number>> {
    const budgets = await this.repo.find({ order: { categorieId: 'ASC' } });

    // Transformation : [{ categorieId: 'alimentation', montant: 500 }, ...]
    //               → { alimentation: 500, ... }
    return budgets.reduce(
      (acc, b) => {
        acc[b.categorieId] = Number(b.montant); // Number() car decimal retourne une string
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  /**
   * Retourne tous les budgets avec leur label (pour les stats).
   * Version "complète" de findAll() utilisée par StatsService.
   */
  async findAllWithDetails(): Promise<Budget[]> {
    return this.repo.find({ order: { categorieId: 'ASC' } });
  }

  /**
   * Met à jour le budget d'une catégorie spécifique.
   *
   * PATCH /budgets/:categorieId
   * Si la catégorie n'existe pas en base (ID invalide), on lance une 404.
   */
  async update(categorieId: string, dto: UpdateBudgetDto): Promise<Record<string, number>> {
    const budget = await this.repo.findOne({ where: { categorieId } });
    if (!budget) {
      throw new NotFoundException(
        `Catégorie de budget '${categorieId}' introuvable`,
      );
    }
    budget.montant = dto.montant;
    await this.repo.save(budget);

    // On retourne tous les budgets mis à jour (même format que findAll)
    return this.findAll();
  }
}
