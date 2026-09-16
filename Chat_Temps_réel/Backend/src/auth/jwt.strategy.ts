import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

/*
  La "stratégie JWT" de Passport.
  Elle est invoquée quand un endpoint est protégé par @UseGuards(JwtAuthGuard).

  Voici ce qui se passe à chaque requête protégée :
  1. ExtractJwt.fromAuthHeaderAsBearerToken() lit le header "Authorization: Bearer <token>"
  2. passport-jwt vérifie la signature avec JWT_SECRET
  3. Si valide, il appelle notre méthode validate() avec le payload décodé
  4. Ce que validate() retourne est injecté dans req.user
*/
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      /*
        Le ?? '' garantit que secretOrKey est toujours un string non-undefined.
        passport-jwt v5 a renforcé son typage : string | undefined n'est plus accepté.
        En pratique, JWT_SECRET sera toujours défini via le .env.
      */
      secretOrKey: configService.get<string>('JWT_SECRET') ?? '',
    });
  }

  async validate(payload: { sub: string; username: string }) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Token invalide.');
    }
    /*
      On retourne l'utilisateur (sans password car select:false sur l'entité).
      Il sera accessible via req.user dans les controllers protégés.
    */
    return user;
  }
}
