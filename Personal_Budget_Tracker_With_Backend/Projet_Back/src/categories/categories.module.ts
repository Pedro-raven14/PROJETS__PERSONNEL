import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';

/**
 * @Module CategoriesModule
 *
 * Pas de TypeOrmModule ici : les catégories sont statiques (pas de BDD).
 * CategoriesService est un simple service qui retourne une liste en mémoire.
 */
@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
