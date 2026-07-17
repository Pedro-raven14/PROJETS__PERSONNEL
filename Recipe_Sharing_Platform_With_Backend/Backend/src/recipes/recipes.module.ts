/**
 * RECIPES MODULE — recipes.module.ts
 *
 * Importe Recipe ET Favorite car RecipesService manipule les deux tables.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { Recipe } from './recipe.entity';
import { Favorite } from '../favorites/favorite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, Favorite])],
  controllers: [RecipesController],
  providers: [RecipesService],
  /**
   * On exporte RecipesService car RatingsService en a besoin pour
   * mettre à jour la note moyenne sur la recette après chaque vote.
   */
  exports: [RecipesService],
})
export class RecipesModule {}
