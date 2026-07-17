import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment } from './comment.entity';
import { Recipe } from '../recipes/recipe.entity';

@Module({
  /**
   * On importe Recipe ici car CommentsService vérifie l'existence de la recette
   * avant d'ajouter un commentaire, et vérifie l'auteur pour la suppression.
   */
  imports: [TypeOrmModule.forFeature([Comment, Recipe])],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
