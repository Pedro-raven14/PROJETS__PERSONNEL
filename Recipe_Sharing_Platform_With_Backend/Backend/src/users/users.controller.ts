/**
 * ─────────────────────────────────────────────────────────────────────────────
 * USERS CONTROLLER — users.controller.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Routes :
 * GET  /users/me           → profil de l'utilisateur connecté
 * PATCH /users/me          → modifier son profil
 * GET  /users/me/favorites → ses recettes favorites
 * GET  /users/:username    → profil public d'un utilisateur
 *
 * ATTENTION à l'ORDRE des routes dans le controller !
 * /users/me doit être AVANT /users/:username
 * Sinon, NestJS interpréterait "me" comme un username paramètre.
 * NestJS matche les routes dans l'ordre de déclaration.
 */

import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from './user.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/me
   * Protégé : seul l'utilisateur connecté peut voir son propre profil complet.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profil de l\'utilisateur connecté' })
  getMe(@CurrentUser() user: User) {
    return this.usersService.getMe(user.id);
  }

  /**
   * PATCH /users/me
   * Modifier son propre profil (fullName, bio, avatar).
   *
   * @Patch → méthode HTTP PATCH (modification partielle, vs PUT = remplacement total).
   * On utilise PATCH car on peut modifier seulement certains champs.
   */
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier son profil' })
  @ApiResponse({ status: 200, description: 'Profil mis à jour' })
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(user.id, dto);
  }

  /**
   * GET /users/me/favorites
   * Récupérer les recettes favorites de l'utilisateur connecté.
   *
   * POURQUOI /users/me/favorites et pas /recipes/favorites ?
   * C'est une convention REST : les ressources "appartenant" à l'utilisateur
   * sont souvent accessibles sous /users/me/ressource.
   */
  @Get('me/favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recettes favorites de l\'utilisateur connecté' })
  getMyFavorites(@CurrentUser() user: User) {
    return this.usersService.getMyFavorites(user.id);
  }

  /**
   * GET /users/:username
   * Profil PUBLIC d'un utilisateur. Pas de guard → accessible sans connexion.
   *
   * @Param('username') username : extrait le paramètre :username de l'URL.
   * Ex: GET /users/chefamelie → username = "chefamelie"
   */
  @Get(':username')
  @ApiOperation({ summary: 'Profil public d\'un utilisateur' })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  getUserByUsername(@Param('username') username: string) {
    return this.usersService.getUserByUsername(username);
  }
}
