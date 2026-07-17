/**
 * USERS MODULE — users.module.ts
 *
 * Regroupe tout ce qui concerne la gestion des utilisateurs.
 * On importe ici les entités Favorite car UsersService en a besoin
 * pour récupérer les favoris d'un utilisateur.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Favorite } from '../favorites/favorite.entity';

@Module({
  /**
   * On enregistre User ET Favorite dans ce module.
   * UsersService a besoin du repository Favorite pour getMyFavorites().
   */
  imports: [TypeOrmModule.forFeature([User, Favorite])],
  controllers: [UsersController],
  providers: [UsersService],
  /**
   * On exporte UsersService car RecipesService en aura besoin
   * pour mettre à jour les notes moyennes.
   */
  exports: [UsersService],
})
export class UsersModule {}
