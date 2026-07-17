/**
 * RATINGS MODULE — ratings.module.ts
 *
 * Important : on importe RecipesModule pour pouvoir utiliser RecipesService
 * (pour mettre à jour la note moyenne après chaque vote).
 *
 * POURQUOI importer le module plutôt que l'entité directement ?
 * RecipesService est déclaré dans RecipesModule et exporté via exports: [RecipesService].
 * Pour l'utiliser dans RatingsModule, on importe RecipesModule.
 * C'est la gestion de la visibilité des providers entre modules NestJS.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { Rating } from './rating.entity';
import { Recipe } from '../recipes/recipe.entity';
import { RecipesModule } from '../recipes/recipes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rating, Recipe]),
    RecipesModule, // Pour avoir accès à RecipesService (updateRating)
  ],
  controllers: [RatingsController],
  providers: [RatingsService],
})
export class RatingsModule {}
