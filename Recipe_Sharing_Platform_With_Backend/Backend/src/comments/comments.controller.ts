/**
 * COMMENTS CONTROLLER — comments.controller.ts
 *
 * Routes :
 * GET    /recipes/:id/comments   → commentaires d'une recette (public)
 * POST   /recipes/:id/comments   → ajouter un commentaire (auth requis)
 * DELETE /comments/:id           → supprimer un commentaire (auteur ou propriétaire recette)
 *
 * Note : deux préfixes de route différents.
 * Les routes /recipes/:id/comments sont dans RecipesController par convention REST.
 * Mais ici on les met dans CommentsController et on utilise deux @Controller séparés.
 *
 * Alternative : mettre ces routes dans RecipesController avec CommentsService injecté.
 * Notre choix garde CommentsController encapsulé.
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('Comments')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('recipes/:id/comments')
  @ApiOperation({ summary: 'Commentaires d\'une recette' })
  getComments(@Param('id') recipeId: string) {
    return this.commentsService.getCommentsByRecipe(recipeId);
  }

  @Post('recipes/:id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ajouter un commentaire' })
  addComment(
    @Param('id') recipeId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.addComment(recipeId, user.id, dto);
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un commentaire (auteur ou propriétaire de la recette)' })
  deleteComment(@Param('id') commentId: string, @CurrentUser() user: User) {
    return this.commentsService.deleteComment(commentId, user.id);
  }
}
