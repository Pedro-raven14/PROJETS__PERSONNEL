import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CompetencesService } from './competences.service';
import { AssignerCompetenceDto, CreateCompetenceDto, UpdateNiveauDto } from 'src/dto/competenceDTO';

@Controller('competences')
export class CompetencesController {
  constructor(private readonly competencesService: CompetencesService) {}

  // --- Référentiel global ---

  // Créer une compétence dans le référentiel
  @Post('add')
  async creerCompetence(@Body() dto: CreateCompetenceDto) {
    return this.competencesService.creerCompetence(dto);
  }

  // Lister toutes les compétences disponibles
  @Get('getall')
  async getToutesLesCompetences() {
    return this.competencesService.getToutesLesCompetences();
  }

  // --- Compétences d'un employé ---

  // Assigner une compétence à un employé (crée la compétence si elle n'existe pas)
  @Post('employee/:userId')
  async assignerCompetence(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: AssignerCompetenceDto,
  ) {
    return this.competencesService.assignerCompetence(userId, dto);
  }

  // Voir les compétences d'un employé
  @Get('employee/:userId')
  async getCompetencesEmployee(@Param('userId', ParseIntPipe) userId: number) {
    return this.competencesService.getCompetencesEmployee(userId);
  }

  // Mettre à jour le niveau d'une compétence d'un employé
  @Patch('employee/:userId/competence/:competenceId')
  async mettreAJourNiveau(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('competenceId', ParseIntPipe) competenceId: number,
    @Body() dto: UpdateNiveauDto,
  ) {
    return this.competencesService.mettreAJourNiveau(userId, competenceId, dto);
  }

  // Retirer une compétence d'un employé
  @Delete('employee/:userId/competence/:competenceId')
  async retirerCompetence(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('competenceId', ParseIntPipe) competenceId: number,
  ) {
    return this.competencesService.retirerCompetence(userId, competenceId);
  }
}
