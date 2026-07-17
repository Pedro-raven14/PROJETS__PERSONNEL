/**
 * FAVORITES MODULE — favorites.module.ts
 *
 * Module minimal : l'entité Favorite est partagée entre plusieurs modules
 * (RecipesModule, UsersModule). Ce module l'enregistre au niveau global
 * pour éviter la duplication.
 *
 * Note : le toggle favori est géré dans RecipesService (POST /recipes/:id/favorite)
 * car c'est une action sur une recette. Les favoris d'un user sont dans UsersService.
 * Ce module existe principalement pour exporter l'entité.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './favorite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite])],
  exports: [TypeOrmModule],
})
export class FavoritesModule {}
