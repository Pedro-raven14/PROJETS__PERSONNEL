import { Body, Controller, Get, Post, Delete, Param } from '@nestjs/common';
import { EtudiantService } from './etudiant.service';
import { etudiantDTO } from './etudiant.dto';

@Controller('etudiant')
export class EtudiantController {
    constructor(
    private readonly etudiantservice: EtudiantService ,
  ) {}

  @Get()
    async getEtudiant() {
      return await this.etudiantservice.getEtudiant();
    }

  @Post('')
  async CreateEtudiant(@Body() etudiantDTO: etudiantDTO) {
    
    return await this.etudiantservice.CreateEtudiant(etudiantDTO);
  }

  @Delete(':id')
  async deleteEtudiant(@Param('id') id: number) {
    return await this.etudiantservice.deleteEtudiant(id);
  }
}