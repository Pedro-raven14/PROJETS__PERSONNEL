import {
  Body, Controller, Get, Param, ParseIntPipe,
  Post, Query, Req, Res, UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { FichePaieService } from './fiche-paie.service';
import { CreateFichePaieDTO } from '../dto/fichePaieDTO';
import { AuthGuard } from '../auth/auth.guard';

@Controller('fiche-paie')
@UseGuards(AuthGuard)
export class FichePaieController {
  constructor(private readonly fichePaieService: FichePaieService) {}

  // Générer une fiche de paie pour un employé
  @Post('generer')
  generer(@Body() dto: CreateFichePaieDTO) {
    return this.fichePaieService.generer(dto);
  }

  // Générer les fiches pour TOUS les employés avec contrat actif + notifier tout le monde
  @Post('generer-tous')
  genererTous(@Body() body: { periode: string }) {
    return this.fichePaieService.genererTous(body.periode);
  }

  // Récupérer toutes les fiches (Admin / RH) — paginé
  @Get('getall')
  getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.fichePaieService.getAll(Number(page) || 1, Number(limit) || 10);
  }

  // Mes fiches de paie (employé connecté)
  @Get('mes-fiches')
  getMesFiches(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.fichePaieService.getMesFiches(
      Number(req.employee.sub),
      Number(page) || 1,
      Number(limit) || 10,
    );
  }

  // Récupérer les fiches d'un employé spécifique (Admin / RH)
  @Get('employee/:userId')
  getByEmployee(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.fichePaieService.getByEmployee(userId, Number(page) || 1, Number(limit) || 10);
  }

  // Voir le document PDF (redirect 302 vers URL Supabase)
  // IMPORTANT : cette route DOIT être avant /:ficheId pour éviter le conflit
  @Get(':ficheId/document')
  async getDocument(
    @Param('ficheId', ParseIntPipe) ficheId: number,
    @Res() res: Response,
  ) {
    const url = await this.fichePaieService.getDocumentUrl(ficheId);
    return res.redirect(url);
  }

  // Récupérer une fiche par ID
  @Get(':ficheId')
  getById(@Param('ficheId', ParseIntPipe) ficheId: number) {
    return this.fichePaieService.getById(ficheId);
  }
}
