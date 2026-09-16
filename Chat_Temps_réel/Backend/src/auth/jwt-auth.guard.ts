import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/*
  Le Guard est le "videur" de l'API.
  En mettant @UseGuards(JwtAuthGuard) sur un controller ou une route,
  on exige que la requête ait un JWT valide.
  Sans ça, retour automatique 401 Unauthorized.
*/
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
