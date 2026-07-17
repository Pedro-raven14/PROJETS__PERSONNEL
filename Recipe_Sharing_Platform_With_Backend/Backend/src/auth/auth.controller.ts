/**
 * ─────────────────────────────────────────────────────────────────────────────
 * AUTH CONTROLLER — auth.controller.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Le controller gère les routes HTTP et fait le lien entre la requête
 * HTTP et le service métier.
 *
 * Responsabilités du controller :
 * 1. Définir les routes (@Post, @Get, etc.)
 * 2. Valider le body via les DTOs (délégué au ValidationPipe global)
 * 3. Appliquer les guards (@UseGuards)
 * 4. Appeler le service et retourner la réponse
 *
 * Ce que le controller NE FAIT PAS :
 * - Logique métier (c'est dans le service)
 * - Accès direct à la base de données (c'est dans le service/repository)
 */

import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

/**
 * @ApiTags('Auth') → groupe les endpoints dans Swagger UI sous le tag "Auth".
 * @Controller('auth') → toutes les routes de ce controller commencent par /auth.
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  /**
   * Injection du service via le constructeur.
   * NestJS résout automatiquement la dépendance AuthService.
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   *
   * @Body() dto : RegisterDto
   * NestJS extrait le body de la requête, le cast en RegisterDto,
   * et le ValidationPipe (configuré dans main.ts) valide tous les champs.
   * Si un champ est invalide → 400 Bad Request automatique.
   *
   * @HttpCode(HttpStatus.CREATED) → retourne 201 Created (défaut pour POST).
   * On peut personnaliser le code HTTP retourné.
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 409, description: 'Email ou username déjà utilisé' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * POST /auth/login
   *
   * @HttpCode(HttpStatus.OK) → retourne 200 (et non 201 qui est le défaut POST)
   * car on ne crée pas une ressource, on retourne des tokens existants.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion et obtention des tokens JWT' })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * POST /auth/logout
   *
   * @UseGuards(JwtAuthGuard) → route protégée, access token requis.
   * @CurrentUser() user : User → injecte l'utilisateur connecté depuis req.user.
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Déconnexion (invalide le refresh token)' })
  async logout(@CurrentUser() user: User) {
    await this.authService.logout(user.id);
    return { message: 'Déconnexion réussie' };
  }

  /**
   * POST /auth/refresh
   *
   * @UseGuards(JwtRefreshGuard) → utilise le REFRESH token (pas l'access token).
   * Le client envoie : Authorization: Bearer <refreshToken>
   * On retourne un nouvel access token (et un nouveau refresh token).
   */
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Renouveler l\'access token via le refresh token' })
  async refresh(@CurrentUser() user: User) {
    return this.authService.refreshTokens(user);
  }
}
