import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Req, Res, UseGuards,
} from '@nestjs/common';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { RapportService } from './rapport.service';
import { AuthGuard } from 'src/auth/auth.guard';
import type { Response } from 'express';

class GenererRapportDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['EFFECTIFS', 'CONGES', 'FORMATIONS', 'EVALUATIONS', 'COMPLET'])
  type!: string;
}

@UseGuards(AuthGuard)
@Controller('rapport')
export class RapportController {
  constructor(private readonly rapportService: RapportService) {}

  // Générer un rapport PDF et le stocker sur Supabase
  @Post('generer')
  async generer(@Body() dto: GenererRapportDto, @Req() req: any) {
    return this.rapportService.generer(dto.type as any, Number(req.employee.sub));
  }

  // Stats JSON pour le frontend (graphiques)
  @Get('stats')
  async getStats() {
    return this.rapportService.getStats();
  }

  // Liste de tous les rapports générés
  @Get('getall')
  async getAll() {
    return this.rapportService.getAll();
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.rapportService.getById(id);
  }

  // Redirect vers l'URL Supabase pour affichage direct dans le navigateur
  @Get(':id/document')
  async getDocument(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const url = await this.rapportService.getDocument(id);
    return res.redirect(url);
  }

  @Delete(':id')
  async supprimer(@Param('id', ParseIntPipe) id: number) {
    return this.rapportService.supprimer(id);
  }
}
