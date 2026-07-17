/**
 * ─────────────────────────────────────────────────────────────────────────────
 * RECIPES SERVICE — recipes.service.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Le service le plus complexe de l'application.
 * Il gère :
 * - CRUD complet des recettes
 * - Filtres et pagination
 * - Toggle favoris
 * - Mise à jour de la note moyenne (appelée par RatingsService)
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from './recipe.entity';
import { Favorite } from '../favorites/favorite.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { FilterRecipeDto } from './dto/filter-recipe.dto';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private recipesRepository: Repository<Recipe>,
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
  ) {}

  // ─── LISTE AVEC FILTRES ET PAGINATION ──────────────────────────────────────

  async findAll(filters: FilterRecipeDto, currentUserId?: string) {
    const {
      query,
      category,
      difficulty,
      prepTime,
      diet,
      sortBy = 'recent',
      page = 1,
      limit = 9,
      status,
    } = filters;

    /**
     * QueryBuilder : alternative plus puissante aux méthodes find() pour
     * construire des requêtes SQL complexes de manière programmatique.
     *
     * Avantages du QueryBuilder :
     * - Conditions dynamiques (if/else pour ajouter des filtres)
     * - Jointures complexes
     * - Sous-requêtes
     * - Meilleure lisibilité que les options find() imbriquées
     *
     * createQueryBuilder('recipe') → 'recipe' est l'alias SQL pour l'entité.
     * Toutes les colonnes seront accessibles via "recipe.title", etc.
     */
    const qb = this.recipesRepository
      .createQueryBuilder('recipe')
      /**
       * leftJoinAndSelect → JOINTURE GAUCHE avec chargement des données.
       * 'recipe.author' → la relation définie dans l'entité Recipe
       * 'author' → l'alias pour accéder aux colonnes de User dans la requête
       *
       * Une jointure gauche inclut les recettes même si l'auteur n'existe plus.
       */
      .leftJoinAndSelect('recipe.author', 'author');

    // ── Filtres ──────────────────────────────────────────────────────────────

    /**
     * Par défaut, on n'affiche que les recettes publiées.
     * Mais si le statut est explicitement demandé (ex: status=draft),
     * on l'utilise.
     */
    const statusFilter = status || 'published';
    qb.where('recipe.status = :status', { status: statusFilter });

    /**
     * Recherche full-text avec ILIKE (insensible à la casse).
     * ILIKE est spécifique à PostgreSQL. Sur MySQL ce serait LIKE avec LOWER().
     *
     * On cherche dans : titre, description, et les tags (stockés en simple-array).
     * Pour les ingrédients (JSON), on utilise CAST pour chercher dans la chaîne JSON.
     */
    if (query && query.trim()) {
      qb.andWhere(
        `(
          recipe.title ILIKE :q
          OR recipe.description ILIKE :q
          OR recipe.tags::text ILIKE :q
          OR recipe.ingredients::text ILIKE :q
        )`,
        { q: `%${query.trim()}%` },
      );
    }

    if (category && category !== 'Tout') {
      qb.andWhere('recipe.category = :category', { category });
    }

    if (difficulty) {
      qb.andWhere('recipe.difficulty = :difficulty', { difficulty });
    }

    /**
     * Filtre par temps total (préparation + cuisson).
     * On additionne les deux colonnes directement en SQL.
     */
    if (prepTime) {
      switch (prepTime) {
        case '0-15':
          qb.andWhere('(recipe.prepTime + recipe.cookTime) < 15');
          break;
        case '15-30':
          qb.andWhere(
            '(recipe.prepTime + recipe.cookTime) >= 15 AND (recipe.prepTime + recipe.cookTime) <= 30',
          );
          break;
        case '30-60':
          qb.andWhere(
            '(recipe.prepTime + recipe.cookTime) > 30 AND (recipe.prepTime + recipe.cookTime) <= 60',
          );
          break;
        case '60+':
          qb.andWhere('(recipe.prepTime + recipe.cookTime) > 60');
          break;
      }
    }

    /**
     * Filtre par régime alimentaire (tag).
     * Les tags sont stockés comme "vegan,healthy,français" (simple-array).
     * On cherche si la chaîne contient le tag demandé.
     */
    if (diet) {
      qb.andWhere('recipe.tags ILIKE :diet', { diet: `%${diet}%` });
    }

    // ── Tri ──────────────────────────────────────────────────────────────────

    /**
     * Différentes stratégies de tri selon le paramètre sortBy.
     * 'DESC' = décroissant (du plus récent/populaire au moins)
     */
    switch (sortBy) {
      case 'recent':
        qb.orderBy('recipe.createdAt', 'DESC');
        break;
      case 'popular':
        // Tri par nombre de favoris → sous-requête COUNT
        qb.orderBy('recipe.ratingsCount', 'DESC');
        break;
      case 'rating':
        qb.orderBy('recipe.rating', 'DESC');
        break;
      case 'time':
        // Tri par temps total croissant (recettes rapides en premier)
        qb.orderBy('(recipe.prepTime + recipe.cookTime)', 'ASC');
        break;
      default:
        qb.orderBy('recipe.createdAt', 'DESC');
    }

    // ── Pagination ───────────────────────────────────────────────────────────

    /**
     * skip + take → équivalent SQL : OFFSET + LIMIT
     * Page 1, limit 9 → OFFSET 0 LIMIT 9
     * Page 2, limit 9 → OFFSET 9 LIMIT 9
     */
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    /**
     * getManyAndCount() exécute DEUX requêtes SQL :
     * 1. La requête principale avec les données (filtrée + triée + paginée)
     * 2. Une requête COUNT(*) pour le total (sans pagination)
     *
     * Cela nous donne le total pour calculer le nombre de pages côté client.
     */
    const [data, total] = await qb.getManyAndCount();

    /**
     * Si un utilisateur est connecté, enrichir chaque recette avec isFavorite.
     * On vérifie si chaque recette est dans les favoris de l'utilisateur.
     */
    let enrichedData = data;
    if (currentUserId) {
      const favoriteIds = await this.getFavoriteIds(currentUserId);
      enrichedData = data.map((recipe) => ({
        ...recipe,
        isFavorite: favoriteIds.has(recipe.id),
        favoritesCount: 0, // TODO: calculer depuis la table favorites
      }));
    }

    return {
      data: enrichedData,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── DÉTAIL D'UNE RECETTE ─────────────────────────────────────────────────

  async findOne(id: string, currentUserId?: string) {
    const recipe = await this.recipesRepository.findOne({
      where: { id },
      relations: ['author', 'comments', 'comments.author'],
    });

    if (!recipe) {
      throw new NotFoundException(`Recette #${id} introuvable`);
    }

    /**
     * Calculer le nombre de favoris pour cette recette.
     * On fait un COUNT depuis la table favorites.
     */
    const favoritesCount = await this.favoritesRepository.count({
      where: { recipeId: id },
    });

    // Vérifier si l'utilisateur connecté l'a en favori
    let isFavorite = false;
    if (currentUserId) {
      const fav = await this.favoritesRepository.findOne({
        where: { recipeId: id, userId: currentUserId },
      });
      isFavorite = !!fav;
    }

    return {
      ...recipe,
      favoritesCount,
      isFavorite,
    };
  }

  // ─── CRÉER UNE RECETTE ─────────────────────────────────────────────────────

  async create(dto: CreateRecipeDto, authorId: string) {
    const recipe = this.recipesRepository.create({
      ...dto,
      authorId,
      status: dto.status || 'published',
    });

    return this.recipesRepository.save(recipe);
  }

  // ─── MODIFIER UNE RECETTE ──────────────────────────────────────────────────

  async update(id: string, dto: UpdateRecipeDto, userId: string) {
    const recipe = await this.recipesRepository.findOne({ where: { id } });

    if (!recipe) {
      throw new NotFoundException(`Recette #${id} introuvable`);
    }

    /**
     * GUARD PROPRIÉTAIRE : vérifier que l'utilisateur est l'auteur.
     * Si non → 403 Forbidden (pas 401 Unauthorized).
     * 401 = non authentifié, 403 = authentifié mais non autorisé.
     */
    if (recipe.authorId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres recettes',
      );
    }

    Object.assign(recipe, dto);
    return this.recipesRepository.save(recipe);
  }

  // ─── SUPPRIMER UNE RECETTE ─────────────────────────────────────────────────

  async remove(id: string, userId: string) {
    const recipe = await this.recipesRepository.findOne({ where: { id } });

    if (!recipe) {
      throw new NotFoundException(`Recette #${id} introuvable`);
    }

    if (recipe.authorId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres recettes',
      );
    }

    /**
     * remove() déclenche les hooks TypeORM et les cascades définies sur les relations.
     * Les commentaires, ratings et favoris liés seront supprimés automatiquement
     * grâce à onDelete: 'CASCADE' dans les entités.
     */
    await this.recipesRepository.remove(recipe);
    return { message: 'Recette supprimée avec succès' };
  }

  // ─── RECETTES D'UN UTILISATEUR ─────────────────────────────────────────────

  async findByUser(userId: string, currentUserId?: string) {
    const recipes = await this.recipesRepository.find({
      where: { authorId: userId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });

    if (currentUserId) {
      const favoriteIds = await this.getFavoriteIds(currentUserId);
      return recipes.map((r) => ({
        ...r,
        isFavorite: favoriteIds.has(r.id),
      }));
    }

    return recipes;
  }

  // ─── TOGGLE FAVORI ─────────────────────────────────────────────────────────

  async toggleFavorite(recipeId: string, userId: string) {
    // Vérifier que la recette existe
    const recipe = await this.recipesRepository.findOne({
      where: { id: recipeId },
    });
    if (!recipe) {
      throw new NotFoundException(`Recette #${recipeId} introuvable`);
    }

    /**
     * Pattern Toggle :
     * - Si la ligne favorite existe → la supprimer (retirer des favoris)
     * - Si elle n'existe pas → la créer (ajouter aux favoris)
     *
     * C'est plus user-friendly qu'avoir deux endpoints séparés
     * POST /favorites et DELETE /favorites/:id.
     */
    const existing = await this.favoritesRepository.findOne({
      where: { recipeId, userId },
    });

    if (existing) {
      await this.favoritesRepository.remove(existing);
      return { isFavorite: false, message: 'Retiré des favoris' };
    } else {
      await this.favoritesRepository.save({ recipeId, userId });
      return { isFavorite: true, message: 'Ajouté aux favoris' };
    }
  }

  // ─── MISE À JOUR DE LA NOTE (appelée par RatingsService) ──────────────────

  /**
   * updateRating() est une méthode publique appelée par RatingsService
   * après chaque nouveau vote.
   *
   * On utilise update() et non save() car on ne veut PAS déclencher
   * les hooks @BeforeUpdate (qui pourraient re-hasher le mot de passe de l'auteur
   * si on chargeait l'entité complète).
   */
  async updateRating(
    recipeId: string,
    avgRating: number,
    ratingsCount: number,
  ) {
    await this.recipesRepository.update(recipeId, {
      rating: Math.round(avgRating * 10) / 10, // Arrondi à 1 décimale
      ratingsCount,
    });
  }

  // ─── HELPERS PRIVÉS ────────────────────────────────────────────────────────

  /**
   * Récupère tous les IDs de recettes favorites d'un utilisateur sous forme
   * d'un Set pour des lookups O(1).
   *
   * Set vs Array pour les lookups :
   * - Array.includes() : O(n) — parcourt tout le tableau
   * - Set.has() : O(1) — lookup direct via table de hachage
   * Beaucoup plus performant quand on itère sur beaucoup de recettes.
   */
  private async getFavoriteIds(userId: string): Promise<Set<string>> {
    const favorites = await this.favoritesRepository.find({
      where: { userId },
      select: ['recipeId'],
    });
    return new Set(favorites.map((f) => f.recipeId));
  }
}
