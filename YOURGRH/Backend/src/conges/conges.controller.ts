import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CongesService } from './conges.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateCongeDto, ValiderCongeDto } from 'src/dto/congeDTO';

@UseGuards(AuthGuard)
@Controller('conge')
export class CongesController {
  constructor(private readonly congesService: CongesService) {}

  // L'employé connecté soumet une demande de congé
  @Post('demander')
  async demanderConge(@Req() req: any, @Body() dto: CreateCongeDto) {
    return this.congesService.demanderConge(Number(req.employee.sub), dto);
  }

  // Le manager/RH valide ou refuse un congé
  @Patch(':id/valider')
  async validerConge(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() dto: ValiderCongeDto,
  ) {
    return this.congesService.validerConge(id, Number(req.employee.sub), dto);
  }

  // Congés de l'employé connecté
  @Get('mes-conges')
  async getMesConges(@Req() req: any) {
    return this.congesService.getCongesEmployee(Number(req.employee.sub));
  }

  // Congés des membres de l'équipe du manager connecté
  @Get('mon-equipe')
  async getCongesEquipe(@Req() req: any) {
    return this.congesService.getCongesEquipe(Number(req.employee.sub));
  }

  // Congés d'un employé spécifique (RH/Admin)
  @Get('employee/:userId')
  async getCongesEmployee(@Param('userId', ParseIntPipe) userId: number) {
    return this.congesService.getCongesEmployee(userId);
  }

  // Annuler sa propre demande (seulement si EN_ATTENTE)
  @Delete(':id/annuler')
  async annulerConge(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.congesService.annulerConge(id, Number(req.employee.sub));
  }

  // Tous les congés (RH/Admin)
  @Get('getall')
  async getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.congesService.getAll(Number(page) || 1, Number(limit) || 10);
  }
}
