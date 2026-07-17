/**
 * ─────────────────────────────────────────────────────────────────────────────
 * RATINGS SERVICE — ratings.service.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Gère les notes des recettes.
 * Logique métier :
 * 1. Un utilisateur peut noter une recette une seule fois
 * 2. Il peut mettre à jour sa note (UPSERT)
 * 3. Après chaque vote, on recalcule la moyenne et on met à jour Recipe
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { Recipe } from '../recipes/recipe.entity';
import { RecipesService } from '../recipes/recipes.service';
import { RateRecipeDto } from './dto/rate-recipe.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private ratingsRepository: Repository<Rating>,
    @InjectRepository(Recipe)
    private recipesRepository: Repository<Recipe>,
    /**
     * On injecte RecipesService (et non directement le repository)
     * pour utiliser sa méthode updateRating().
     * C'est la même logique que les recettes ne sont pas mises à jour
     * directement depuis n'importe où.
     */
    private recipesService: RecipesService,
  ) {}

  /**
   * rateRecipe() — Créer ou mettre à jour une note (UPSERT)
   *
   * UPSERT = UPDATE or INSERT
   * Si l'utilisateur a déjà voté → mettre à jour sa note
   * Sinon → créer une nouvelle note
   */
  async rateRecipe(recipeId: string, userId: string, dto: RateRecipeDto) {
    // Vérifier que la recette existe
    const recipe = await this.recipesRepository.findOne({
      where: { id: recipeId },
    });
    if (!recipe) {
      throw new NotFoundException(`Recette #${recipeId} introuvable`);
    }

    /**
     * Chercher si une note existe déjà pour cette paire (recipeId, userId).
     */
    let rating = await this.ratingsRepository.findOne({
      where: { recipeId, userId },
    });

    if (rating) {
      // Mise à jour de la note existante
      rating.rating = dto.rating;
    } else {
      // Création d'une nouvelle note
      rating = this.ratingsRepository.create({
        recipeId,
        userId,
        rating: dto.rating,
      });
    }

    await this.ratingsRepository.save(rating);

    /**
     * Recalculer la moyenne APRÈS avoir sauvegardé la note.
     *
     * On récupère TOUTES les notes de cette recette depuis la base.
     * On calcule la moyenne et le total.
     * On met à jour la recette via RecipesService.
     *
     * Cette approche est simple et correcte pour un projet perso.
     * Pour une haute charge, on pourrait utiliser des agrégats SQL :
     * SELECT AVG(rating), COUNT(*) FROM ratings WHERE recipeId = :id
     */
    const allRatings = await this.ratingsRepository.find({
      where: { recipeId },
    });

    const avgRating =
      allRatings.reduce((sum, r) => sum + Number(r.rating), 0) /
      allRatings.length;

    await this.recipesService.updateRating(recipeId, avgRating, allRatings.length);

    return {
      rating: dto.rating,
      average: Math.round(avgRating * 10) / 10,
      count: allRatings.length,
    };
  }

  /**
   * getUserRating() — Récupérer la note de l'utilisateur connecté pour une recette.
   * Utilisé pour pré-remplir les étoiles dans le frontend.
   */
  async getUserRating(recipeId: string, userId: string) {
    const rating = await this.ratingsRepository.findOne({
      where: { recipeId, userId },
    });

    return {
      rating: rating?.rating || 0,
      hasRated: !!rating,
    };
  }
}
