/**
 * ─────────────────────────────────────────────────────────────────────────────
 * RECIPES CONTROLLER — recipes.controller.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Routes :
 * GET    /recipes                → liste filtrée + pagination (public)
 * GET    /recipes/user/:userId   → recettes d'un utilisateur (public)
 * GET    /recipes/:id            → détail d'une recette (public)
 * POST   /recipes                → créer une recette (auth requis)
 * PATCH  /recipes/:id            → modifier (auteur seulement)
 * DELETE /recipes/:id            → supprimer (auteur seulement)
 * POST   /recipes/:id/favorite   → toggle favori (auth requis)
 *
 * Note sur l'ordre : /recipes/user/:userId AVANT /recipes/:id
 * pour éviter que "user" soit interprété comme un id.
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { FilterRecipeDto } from './dto/filter-recipe.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('Recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  /**
   * GET /recipes?query=poulet&category=Dîner&page=1&limit=9
   *
   * @Query() dto → extrait et valide tous les query params en FilterRecipeDto.
   * @Request() req → pour récupérer l'utilisateur connecté OPTIONNELLEMENT.
   *
   * POURQUOI pas @UseGuards ici ?
   * Les recettes sont publiques. Mais si l'utilisateur est connecté,
   * on veut enrichir les données avec isFavorite.
   * On lit manuellement req.user sans forcer l'authentification.
   */
  @Get()
  @ApiOperation({ summary: 'Lister les recettes avec filtres et pagination' })
  findAll(@Query() filters: FilterRecipeDto, @Request() req) {
    const currentUserId = req.user?.id;
    return this.recipesService.findAll(filters, currentUserId);
  }

  /**
   * GET /recipes/user/:userId
   * Doit être AVANT /recipes/:id !
   */
  @Get('user/:userId')
  @ApiOperation({ summary: 'Recettes d\'un utilisateur spécifique' })
  findByUser(@Param('userId') userId: string, @Request() req) {
    const currentUserId = req.user?.id;
    return this.recipesService.findByUser(userId, currentUserId);
  }

  /**
   * GET /recipes/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une recette' })
  @ApiResponse({ status: 404, description: 'Recette introuvable' })
  findOne(@Param('id') id: string, @Request() req) {
    const currentUserId = req.user?.id;
    return this.recipesService.findOne(id, currentUserId);
  }

  /**
   * POST /recipes
   * Protégé : seuls les utilisateurs connectés peuvent créer des recettes.
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une nouvelle recette' })
  @ApiResponse({ status: 201, description: 'Recette créée' })
  create(@Body() dto: CreateRecipeDto, @CurrentUser() user: User) {
    return this.recipesService.create(dto, user.id);
  }

  /**
   * PATCH /recipes/:id
   * Seul l'auteur peut modifier sa recette (vérifié dans le service).
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier une recette (auteur seulement)' })
  @ApiResponse({ status: 403, description: 'Pas votre recette' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRecipeDto,
    @CurrentUser() user: User,
  ) {
    return this.recipesService.update(id, dto, user.id);
  }

  /**
   * DELETE /recipes/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une recette (auteur seulement)' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.recipesService.remove(id, user.id);
  }

  /**
   * POST /recipes/:id/favorite
   * Toggle favori : ajoute si absent, retire si présent.
   */
  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ajouter/retirer une recette des favoris (toggle)' })
  toggleFavorite(@Param('id') id: string, @CurrentUser() user: User) {
    return this.recipesService.toggleFavorite(id, user.id);
  }
}
