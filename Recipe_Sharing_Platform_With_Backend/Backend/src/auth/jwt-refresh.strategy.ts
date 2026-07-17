/**
 * ─────────────────────────────────────────────────────────────────────────────
 * JWT REFRESH STRATEGY — jwt-refresh.strategy.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Stratégie Passport pour les refresh tokens.
 * Similaire à JwtStrategy mais :
 * 1. Utilise JWT_REFRESH_SECRET (clé différente)
 * 2. Extrait aussi le refreshToken brut de la requête pour le comparer
 *    au hash stocké en base (sécurité supplémentaire)
 *
 * FLUX DU REFRESH TOKEN :
 * 1. Access token expiré → client envoie le refresh token
 * 2. JwtRefreshGuard intercepte POST /auth/refresh
 * 3. JwtRefreshStrategy vérifie la signature du refresh token
 * 4. validate() compare le refresh token avec le hash en base
 * 5. Si OK → on émet un nouvel access token (et nouveau refresh token)
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh', // Nom de la stratégie → utilisé dans JwtRefreshGuard
) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET') as string,
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  async validate(req: Request, payload: JwtPayload) {
    /**
     * Extraire le token brut depuis le header Authorization.
     * Format : "Bearer eyJ..."
     * On split sur " " et prend la deuxième partie.
     */
    const rawToken = req.get('Authorization')?.split(' ')[1];

    if (!rawToken) {
      throw new UnauthorizedException('Refresh token manquant');
    }

    // Charger l'utilisateur avec son refreshToken haché (select: false par défaut)
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      select: ['id', 'email', 'username', 'fullName', 'bio', 'avatar', 'refreshToken'],
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Session expirée, veuillez vous reconnecter');
    }

    /**
     * Comparer le token brut avec le hash stocké en base.
     * bcrypt.compare() retourne true si le texte correspond au hash.
     *
     * POURQUOI on stocke le hash et pas le token brut ?
     * Si la base est compromise, les attaquants ne peuvent pas utiliser
     * les refresh tokens directement (même principe que les mots de passe).
     */
    const tokenMatches = await bcrypt.compare(rawToken, user.refreshToken);

    if (!tokenMatches) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    return user;
  }
}
