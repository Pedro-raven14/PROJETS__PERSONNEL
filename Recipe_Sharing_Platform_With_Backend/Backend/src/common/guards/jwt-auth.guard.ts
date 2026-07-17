/**
 * ─────────────────────────────────────────────────────────────────────────────
 * JWT AUTH GUARD — jwt-auth.guard.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Un "Guard" NestJS est un middleware qui décide si une requête peut
 * atteindre le handler de route ou non.
 *
 * JwtAuthGuard étend AuthGuard('jwt') de @nestjs/passport.
 * Quand il est appliqué sur un endpoint avec @UseGuards(JwtAuthGuard) :
 * 1. Il extrait le JWT du header Authorization: Bearer <token>
 * 2. Il le vérifie avec la clé secrète (via JwtStrategy)
 * 3. Si valide → la requête continue, req.user est peuplé avec le payload
 * 4. Si invalide → 401 Unauthorized automatiquement
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * @Injectable() → NestJS peut injecter ce guard dans son système d'IoC.
 * On crée une classe qui étend AuthGuard('jwt') pour pouvoir l'utiliser
 * avec @UseGuards(JwtAuthGuard) au lieu du moins lisible @UseGuards(AuthGuard('jwt')).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
