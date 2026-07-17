/**
 * ─────────────────────────────────────────────────────────────────────────────
 * JWT REFRESH GUARD — jwt-refresh.guard.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Même principe que JwtAuthGuard mais utilise la stratégie 'jwt-refresh'.
 * Ce guard est utilisé UNIQUEMENT sur l'endpoint POST /auth/refresh.
 *
 * POURQUOI deux stratégies séparées ?
 * - L'access token a une courte durée de vie (15 min) et une clé secrète A
 * - Le refresh token a une longue durée de vie (7 jours) et une clé secrète B
 * - Utiliser des clés différentes évite qu'un refresh token soit accepté
 *   comme access token (et vice versa), ce qui renforcerait la sécurité.
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
