import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { FormationService } from './formation.service';
import { CreateFormationDto, InscrireEmployeDto } from 'src/dto/formationDTO';

@Controller('formation')
export class FormationController {
  constructor(private readonly formationService: FormationService) {}

  @Post('add')
  async create(@Body() dto: CreateFormationDto) {
    return this.formationService.create(dto);
  }

  @Get('getall')
  async getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.formationService.getAll(Number(page) || 1, Number(limit) || 10);
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.formationService.getById(id);
  }

  @Post(':id/inscrire')
  async inscrireEmploye(@Param('id', ParseIntPipe) id: number, @Body() dto: InscrireEmployeDto) {
    return this.formationService.inscrireEmploye(id, dto);
  }

  // Désinscrire un employé d'une formation
  @Delete(':id/inscrire/:userId')
  async desinscrireEmploye(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.formationService.desinscrireEmploye(id, userId);
  }

  // Formations d'un employé spécifique
  @Get('employee/:userId')
  async getFormationsEmployee(@Param('userId', ParseIntPipe) userId: number) {
    return this.formationService.getFormationsEmployee(userId);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.formationService.delete(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateFormationDto>) {
    return this.formationService.update(id, dto);
  }
}
