import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Patch, Post, Req, UseGuards,
} from '@nestjs/common';
import { HeuresSupService } from './heures-sup.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateHeuresSupDto, ValiderHeuresSupDto } from 'src/dto/heuresSupDTO';

@UseGuards(AuthGuard)
@Controller('heures-sup')
export class HeuresSupController {
  constructor(private readonly heuresSupService: HeuresSupService) {}

  /** POST /heures-sup/declarer — l'employé connecté déclare des heures sup */
  @Post('declarer')
  async declarer(@Req() req: any, @Body() dto: CreateHeuresSupDto) {
    return this.heuresSupService.declarer(Number(req.employee.sub), dto);
  }

  /** GET /heures-sup/mes-declarations — mes propres déclarations */
  @Get('mes-declarations')
  async getMesDeclarations(@Req() req: any) {
    return this.heuresSupService.getMesDeclarations(Number(req.employee.sub));
  }

  /** GET /heures-sup/mon-equipe — déclarations de l'équipe (manager) */
  @Get('mon-equipe')
  async getDeclarationsEquipe(@Req() req: any) {
    return this.heuresSupService.getDeclarationsEquipe(Number(req.employee.sub));
  }

  /** GET /heures-sup/getall — toutes les déclarations (RH/Admin) */
  @Get('getall')
  async getAll() {
    return this.heuresSupService.getAll();
  }

  /** GET /heures-sup/employee/:userId — déclarations d'un employé (RH/Admin) */
  @Get('employee/:userId')
  async getByEmployee(@Param('userId', ParseIntPipe) userId: number) {
    return this.heuresSupService.getByEmployee(userId);
  }

  /** PATCH /heures-sup/:id/valider — valider ou refuser (manager/RH) */
  @Patch(':id/valider')
  async valider(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() dto: ValiderHeuresSupDto,
  ) {
    return this.heuresSupService.valider(id, Number(req.employee.sub), dto);
  }

  /** DELETE /heures-sup/:id/annuler — annuler sa propre déclaration */
  @Delete(':id/annuler')
  async annuler(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.heuresSupService.annuler(id, Number(req.employee.sub));
  }
}
