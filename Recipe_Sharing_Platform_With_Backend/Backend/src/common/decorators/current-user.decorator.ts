/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DÉCORATEUR @CurrentUser — current-user.decorator.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Un décorateur de paramètre personnalisé pour extraire l'utilisateur connecté
 * depuis l'objet Request dans un controller.
 *
 * SANS ce décorateur, dans chaque controller protégé on devrait écrire :
 *   @Get('me')
 *   getMe(@Req() request: Request) {
 *     const user = request.user; // Peu clair
 *   }
 *
 * AVEC ce décorateur :
 *   @Get('me')
 *   getMe(@CurrentUser() user: User) {
 *     // Propre et explicite !
 *   }
 *
 * Comment ça marche ?
 * JwtStrategy.validate() retourne un objet user qui est attaché à request.user
 * par Passport. Ce décorateur extrait simplement cet objet.
 *
 * @createParamDecorator reçoit deux arguments :
 * - data : ce qu'on passe au décorateur (ex: @CurrentUser('id') → data = 'id')
 * - ctx : le contexte d'exécution (HTTP, WebSocket, etc.)
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    // Récupère l'objet Request HTTP depuis le contexte
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Si on passe un argument (ex: @CurrentUser('id')), retourner seulement ce champ
    // Sinon retourner l'objet user complet
    return data ? user?.[data] : user;
  },
);
