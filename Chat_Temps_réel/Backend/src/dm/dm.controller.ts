import { Controller, Get, Post, Param, Query, UseGuards, Req } from '@nestjs/common';
import { DmService } from './dm.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('dm')
@UseGuards(JwtAuthGuard)
export class DmController {
  constructor(
    private readonly dmService: DmService,
    private readonly usersService: UsersService,
  ) {}

  /*
    GET /dm/conversations
    Retourne toutes les conversations actives (avec messages) de l'user connecté.
    Utilisé par la sidebar pour afficher les DMs.
  */
  @Get('conversations')
  getConversations(@Req() req: any) {
    return this.dmService.findActiveConversations(req.user.id);
  }

  /*
    POST /dm/conversations/:targetUserId
    Crée ou retrouve une DirectConversation avec l'utilisateur cible.
    Appelé quand on clique sur un user dans la recherche.
    NE crée pas encore de room.
  */
  @Post('conversations/:targetUserId')
  async openConversation(@Param('targetUserId') targetUserId: string, @Req() req: any) {
    const targetUser = await this.usersService.findById(targetUserId);
    if (!targetUser) return { error: 'Utilisateur introuvable.' };
    return this.dmService.getOrCreate(req.user, targetUser);
  }

  /*
    GET /dm/search?q=alice
    Recherche des utilisateurs par username pour le modal de recherche.
  */
  @Get('search')
  searchUsers(@Query('q') q: string, @Req() req: any) {
    return this.dmService.searchUsers(q, req.user.id);
  }
}
