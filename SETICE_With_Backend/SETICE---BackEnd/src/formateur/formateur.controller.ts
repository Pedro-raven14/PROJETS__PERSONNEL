import { Body, Controller, Get, Post, Delete, Param } from '@nestjs/common';
import { FormateurService } from './formateur.service';
import { FormateurDTO } from './formateur.dto';

@Controller('formateur')
export class FormateurController {
  constructor(private readonly formateurService: FormateurService) {}

  @Get()
      async getFormateur() {
        return await this.formateurService.getFormateur();
      }

  @Post()
  create(@Body() dto: FormateurDTO) {
    return this.formateurService.createFormateur(dto);
  }

  @Delete(':id')
  async deleteFormateur(@Param('id') id: number) {
    return await this.formateurService.deleteFormateur(id);
  }
}