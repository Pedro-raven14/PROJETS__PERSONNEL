/**
 * ─────────────────────────────────────────────────────────────────────────────
 * COMMENTS SERVICE — comments.service.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Gère les commentaires sur les recettes.
 * Un commentaire peut être supprimé par :
 * - Son auteur
 * - L'auteur de la recette commentée
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { Recipe } from '../recipes/recipe.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Recipe)
    private recipesRepository: Repository<Recipe>,
  ) {}

  /**
   * Récupérer les commentaires d'une recette, triés du plus récent au plus ancien.
   *
   * Grâce à eager: true sur author dans Comment, l'auteur est automatiquement
   * inclus dans chaque commentaire. Pas besoin de relations: ['author'] ici.
   */
  async getCommentsByRecipe(recipeId: string) {
    // Vérifier que la recette existe
    const recipeExists = await this.recipesRepository.findOne({
      where: { id: recipeId },
    });
    if (!recipeExists) {
      throw new NotFoundException(`Recette #${recipeId} introuvable`);
    }

    return this.commentsRepository.find({
      where: { recipeId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Ajouter un commentaire à une recette.
   */
  async addComment(
    recipeId: string,
    authorId: string,
    dto: CreateCommentDto,
  ) {
    const recipe = await this.recipesRepository.findOne({
      where: { id: recipeId },
    });
    if (!recipe) {
      throw new NotFoundException(`Recette #${recipeId} introuvable`);
    }

    const comment = this.commentsRepository.create({
      text: dto.text.trim(),
      recipeId,
      authorId,
    });

    return this.commentsRepository.save(comment);
  }

  /**
   * Supprimer un commentaire.
   *
   * RÈGLE MÉTIER : on peut supprimer un commentaire si on est :
   * 1. L'auteur du commentaire (userId === comment.authorId)
   * 2. L'auteur de la recette sur laquelle est le commentaire
   *
   * C'est une règle classique de modération sur les plateformes de contenu.
   */
  async deleteComment(commentId: string, userId: string) {
    /**
     * On charge aussi la recette liée pour vérifier si l'utilisateur
     * est l'auteur de la recette.
     */
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['recipe'],
    });

    if (!comment) {
      throw new NotFoundException(`Commentaire #${commentId} introuvable`);
    }

    const isCommentAuthor = comment.authorId === userId;
    const isRecipeOwner = comment.recipe?.authorId === userId;

    if (!isCommentAuthor && !isRecipeOwner) {
      throw new ForbiddenException(
        'Vous ne pouvez pas supprimer ce commentaire',
      );
    }

    await this.commentsRepository.remove(comment);
    return { message: 'Commentaire supprimé' };
  }
}
