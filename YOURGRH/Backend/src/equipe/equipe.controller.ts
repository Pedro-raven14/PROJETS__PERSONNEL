import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { EquipeService } from './equipe.service';
import { CreateEquipeDto, UpdateEquipeDto } from 'src/dto/equipeDTO';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('equipe')
export class EquipeController {
  constructor(private readonly equipeService: EquipeService) {}

  @Post('add')
  async create(@Body() dto: CreateEquipeDto) {
    return this.equipeService.create(dto);
  }

  @Get('getall')
  async getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.equipeService.getAll(Number(page) || 1, Number(limit) || 10);
  }

  // L'équipe dont le manager connecté est responsable
  @UseGuards(AuthGuard)
  @Get('mon-equipe')
  async getMonEquipe(@Req() req: any) {
    return this.equipeService.getMonEquipe(req.employee.sub);
  }

  // Équipes d'un département spécifique
  @Get('departement/:departId')
  async getByDepartement(@Param('departId', ParseIntPipe) departId: number) {
    return this.equipeService.getByDepartement(departId);
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.equipeService.getById(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEquipeDto) {
    return this.equipeService.update(id, dto);
  }

  // Assigner un employé à une équipe
  @Patch(':id/assigner/:userId')
  async assignerEmploye(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.equipeService.assignerEmploye(id, userId);
  }

  // Retirer un employé d'une équipe
  @Delete(':id/retirer/:userId')
  async retirerEmploye(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.equipeService.retirerEmploye(id, userId);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.equipeService.delete(id);
  }
}
