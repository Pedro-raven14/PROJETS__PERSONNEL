import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { ContratService } from './contrat.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateContratDto, UpdateContratDto } from 'src/dto/contratDTO';
import type { Response } from 'express';

class SignerContratDto {
  @IsNotEmpty()
  @IsString()
  signature!: string;
}

@UseGuards(AuthGuard)
@Controller('contrat')
export class ContratController {
  constructor(private readonly contratService: ContratService) {}

  // RH crée un contrat → PDF généré + employé notifié
  @Post('add')
  async create(@Body() dto: CreateContratDto) {
    return this.contratService.create(dto);
  }

  @Get('getall')
  async getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.contratService.getAll(Number(page) || 1, Number(limit) || 10);
  }

  // Contrats non signés — tableau de bord RH
  @Get('non-signes')
  async getNonSignes() {
    return this.contratService.getNonSignes();
  }

  @Get('employee/:userId')
  async getByEmployee(@Param('userId', ParseIntPipe) userId: number) {
    return this.contratService.getByEmployee(userId);
  }

  // Mes contrats (employé connecté)
  @Get('mes-contrats')
  async getMesContrats(@Req() req: any) {
    return this.contratService.getByEmployee(Number(req.employee.sub));
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.contratService.getById(id);
  }

  // Redirige vers l'URL Supabase du PDF (302 redirect pour que l'iframe charge directement le PDF)
  @Get(':id/document')
  async getDocument(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const url = await this.contratService.getDocument(id);
    return res.redirect(url);
  }

  // L'employé connecté signe son contrat
  @Post(':id/signer')
  async signer(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() dto: SignerContratDto,
  ) {
    return this.contratService.signer(id, req.employee.sub, dto.signature);
  }

  // Licencier un employé — résilie tous ses contrats actifs + notifie
  // IMPORTANT : doit être avant PATCH :id pour éviter le conflit de route
  @Patch('licencier/:userId')
  async licencier(@Param('userId', ParseIntPipe) userId: number) {
    return this.contratService.licencier(userId);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateContratDto) {
    return this.contratService.update(id, dto);
  }
}
