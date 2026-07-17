/**
 * ─────────────────────────────────────────────────────────────────────────────
 * JWT STRATEGY — jwt.strategy.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Une "Strategy" Passport définit comment authentifier une requête.
 * JwtStrategy dit à Passport : "pour vérifier un JWT, fais ceci".
 *
 * Le flux complet d'authentification :
 * 1. Client envoie : GET /users/me  avec  Authorization: Bearer eyJ...
 * 2. JwtAuthGuard intercepte la requête
 * 3. Il délègue à JwtStrategy
 * 4. JwtStrategy extrait le token du header, le vérifie avec JWT_SECRET
 * 5. Si valide → appelle validate(payload) → retourne l'utilisateur
 * 6. L'utilisateur est attaché à request.user
 * 7. Le controller peut y accéder via @CurrentUser()
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
/**
 * Structure du payload stocké dans le JWT (ce qu'on encode lors du login).
 * On stocke le minimum nécessaire pour identifier l'utilisateur.
 * NE PAS mettre le mot de passe ou d'infos sensibles dans le JWT :
 * le payload est encodé en base64 mais PAS chiffré (visible si décodé).
 */
export interface JwtPayload {
  sub: string;      // "sub" = Subject = ID de l'utilisateur (convention JWT)
  username: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  /**
   * Le constructeur configure la stratégie Passport.
   * super() appelle le constructeur de PassportStrategy avec la config JWT.
   */
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      /**
       * fromAuthHeaderAsBearerToken() → extrait le token du header HTTP :
       * Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
       *
       * Alternatives : fromBodyField('token'), fromUrlQueryParameter('token')
       */
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      /**
       * ignoreExpiration: false → rejeter les tokens expirés (défaut).
       * Mettre true serait une faille de sécurité !
       */
      ignoreExpiration: false,
      /**
       * secretOrKey → la clé utilisée pour vérifier la signature du JWT.
       * Doit correspondre exactement à celle utilisée lors de la signature (login).
       */
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  /**
   * validate() est appelé par Passport après avoir vérifié et décodé le JWT.
   * Le payload est déjà vérifié (signature OK, non expiré).
   *
   * Ce qu'on retourne ici est attaché à request.user.
   * On recharge l'utilisateur depuis la base pour avoir les données à jour.
   *
   * Note : c'est un appel DB à chaque requête protégée. Pour une haute performance,
   * on pourrait mettre en cache avec Redis. Pour un projet perso, c'est ok.
   */
  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      /**
       * Si l'utilisateur a été supprimé après l'émission du token,
       * on rejette la requête avec 401.
       */
      throw new UnauthorizedException('Token invalide');
    }

    return user;
  }
}
