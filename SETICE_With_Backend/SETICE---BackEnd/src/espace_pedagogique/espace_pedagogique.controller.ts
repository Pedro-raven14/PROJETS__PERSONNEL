import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { EspacePedagogiqueService } from './espace_pedagogique.service';
import { espaceDTO } from './espace.dto';

@Controller('espace-pedagogique')
export class EspacePedagogiqueController {
  constructor(private readonly espaceservice: EspacePedagogiqueService) {}
  @Get()
  async getespace() {
    return await this.espaceservice.getespace();
  }

  @Post()
  async createEspace(@Body() espace: espaceDTO) {
    return await this.espaceservice.createEspace(espace);
  }

  @Get(':id/etudiants')
  async getEtudiantsByEspace(@Param('id') id: string) {
    const eid = Number(id);
    return await this.espaceservice.getStudentsByEspace(eid);
  }
  @Get('formateur/:formateurId')
  getEspacesByFormateur(
    @Param('formateurId', ParseIntPipe) formateurId: number,
  ) {
    return this.espaceservice.getEspacesByFormateur(formateurId);
  }

  @Post('assigner')
  async assignFormateur(
    @Body() body: { espaceId: number; formateurId: number },
  ) {
    return await this.espaceservice.assignFormateur(
      body.espaceId,
      body.formateurId,
    );
  }

  @Delete(':id')
  async deleteEspace(@Param('id', ParseIntPipe) id: number) {
    return await this.espaceservice.deleteEspace(id);
  }
}