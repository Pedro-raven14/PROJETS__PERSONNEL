import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, FindOptionsWhere } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';

/**
 * @Injectable TransactionsService
 *
 * Le SERVICE contient toute la LOGIQUE MÉTIER.
 * Le controller (HTTP) ne doit faire qu'appeler le service.
 * Cette séparation permet de :
 * - Tester la logique sans se soucier de HTTP
 * - Réutiliser le service depuis d'autres modules (ex: StatsModule)
 *
 * @InjectRepository(Transaction) injecte le Repository TypeORM
 * qui est le "traducteur" entre nos objets TypeScript et les requêtes SQL.
 */
@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly repo: Repository<Transaction>,
  ) {}

  /**
   * Crée une nouvelle transaction en base de données.
   *
   * repo.create() construit l'objet (sans toucher la BDD).
   * repo.save() exécute INSERT INTO transactions ... et retourne l'objet sauvegardé
   * avec l'id UUID généré par PostgreSQL.
   */
  async create(dto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.repo.create({
      ...dto,
      // Si note n'est pas fournie dans le DTO, on met une chaîne vide
      note: dto.note ?? '',
    });
    return this.repo.save(transaction);
  }

  /**
   * Retourne une liste paginée et filtrée de transactions.
   *
   * POURQUOI construire where dynamiquement ?
   * TypeORM accepte un objet `where` avec des conditions.
   * On ajoute des conditions seulement si le filtre est présent dans la requête.
   * Ainsi ?type=depense ajoute { type: 'depense' } mais si absent, pas de filtre.
   *
   * On retourne aussi le total pour que le frontend calcule le nombre de pages.
   */
  async findAll(filters: FilterTransactionDto): Promise<{
    data: Transaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Convertir page/limit en nombres (ils arrivent en string depuis les query params)
    const page = parseInt(filters.page ?? '1', 10);
    const limit = parseInt(filters.limit ?? '10', 10);
    const skip = (page - 1) * limit; // ex: page 2, limit 10 → skip 10

    // Construction dynamique des conditions WHERE
    const where: FindOptionsWhere<Transaction> = {};

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.categorie) {
      where.categorie = filters.categorie;
    }

    if (filters.statut) {
      where.statut = filters.statut;
    }

    // ILIKE = recherche insensible à la casse
    // Like(`%${terme}%`) génère : WHERE description ILIKE '%courses%'
    if (filters.recherche) {
      where.description = Like(`%${filters.recherche}%`);
    }

    // Filtre de plage de dates : Between génère WHERE date BETWEEN 'x' AND 'y'
    if (filters.dateDebut && filters.dateFin) {
      where.date = Between(filters.dateDebut, filters.dateFin);
    } else if (filters.dateDebut) {
      // Seulement une date de début : entre dateDebut et "aujourd'hui"
      const today = new Date().toISOString().split('T')[0];
      where.date = Between(filters.dateDebut, today);
    } else if (filters.dateFin) {
      // Seulement une date de fin : entre "le début des temps" et dateFin
      where.date = Between('1970-01-01', filters.dateFin);
    }

    // findAndCount retourne [tableau de résultats, count total]
    // C'est l'équivalent de SELECT ... + SELECT COUNT(*)
    const [data, total] = await this.repo.findAndCount({
      where,
      order: { date: 'DESC', createdAt: 'DESC' }, // Plus récentes d'abord
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  /**
   * Trouve une transaction par son ID UUID.
   * Lance une NotFoundException (HTTP 404) si l'ID n'existe pas.
   * NestJS convertit automatiquement cette exception en réponse 404.
   */
  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.repo.findOne({ where: { id } });
    if (!transaction) {
      throw new NotFoundException(`Transaction #${id} introuvable`);
    }
    return transaction;
  }

  /**
   * Met à jour partiellement une transaction (PATCH).
   *
   * On récupère d'abord l'entité existante (findOne lance 404 si absente).
   * Object.assign() fusionne les nouvelles valeurs sur l'objet existant.
   * repo.save() exécute UPDATE ... SET ... WHERE id = ...
   */
  async update(id: string, dto: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.findOne(id);
    Object.assign(transaction, dto);
    return this.repo.save(transaction);
  }

  /**
   * Supprime une transaction par son ID.
   * On vérifie d'abord qu'elle existe (findOne), puis on la supprime.
   * repo.remove() exécute DELETE FROM transactions WHERE id = ...
   */
  async remove(id: string): Promise<{ message: string }> {
    const transaction = await this.findOne(id);
    await this.repo.remove(transaction);
    return { message: `Transaction #${id} supprimée avec succès` };
  }

  /**
   * Méthode utilitaire INTERNE (utilisée par StatsService).
   * Pas exposée via un endpoint HTTP.
   *
   * Retourne toutes les transactions d'un mois et d'une année donnés.
   * Utilisée pour calculer les KPIs du dashboard.
   */
  async findByMonth(annee: number, mois: number): Promise<Transaction[]> {
    // Construire les bornes de la plage : 2026-03-01 → 2026-03-31
    const start = `${annee}-${String(mois).padStart(2, '0')}-01`;
    // new Date(2026, 3, 0) = dernier jour du mois 3 (mars) = 2026-03-31
    const lastDay = new Date(annee, mois, 0).getDate();
    const end = `${annee}-${String(mois).padStart(2, '0')}-${lastDay}`;

    return this.repo.find({
      where: { date: Between(start, end) },
      order: { date: 'DESC' },
    });
  }

  /**
   * Retourne les transactions des N derniers mois.
   * Utilisée pour le graphique d'évolution sur 6 mois.
   */
  async findLastNMonths(n: number): Promise<Transaction[]> {
    const today = new Date();
    // Date il y a N mois (ex: aujourd'hui - 6 mois)
    const start = new Date(today.getFullYear(), today.getMonth() - (n - 1), 1);
    const startStr = start.toISOString().split('T')[0];
    const endStr = today.toISOString().split('T')[0];

    return this.repo.find({
      where: { date: Between(startStr, endStr) },
      order: { date: 'ASC' },
    });
  }
}
