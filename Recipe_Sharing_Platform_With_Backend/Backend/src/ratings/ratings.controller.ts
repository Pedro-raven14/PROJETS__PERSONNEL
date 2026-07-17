/**
 * RATINGS CONTROLLER — ratings.controller.ts
 *
 * Routes :
 * POST /recipes/:id/rate       → noter une recette (crée ou met à jour)
 * GET  /recipes/:id/rating/me  → note de l'utilisateur connecté pour cette recette
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { RateRecipeDto } from './dto/rate-recipe.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('Ratings')
@Controller('recipes')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post(':id/rate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Noter une recette (crée ou met à jour la note)' })
  rateRecipe(
    @Param('id') recipeId: string,
    @Body() dto: RateRecipeDto,
    @CurrentUser() user: User,
  ) {
    return this.ratingsService.rateRecipe(recipeId, user.id, dto);
  }

  @Get(':id/rating/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Note de l\'utilisateur connecté pour cette recette' })
  getUserRating(@Param('id') recipeId: string, @CurrentUser() user: User) {
    return this.ratingsService.getUserRating(recipeId, user.id);
  }
}
