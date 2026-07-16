import { Body, Controller, Post, Delete, Param } from '@nestjs/common';
import { DirecteurService } from './directeur.service';
import { DirecteurDTO } from './directeur.dto';

@Controller('directeur')
export class DirecteurController {
  constructor(private readonly directeurService: DirecteurService) {}

  @Post()
  async CreateDirecteur(@Body() directeurDto: DirecteurDTO) {
    return await this.directeurService.CreateDirecteur(directeurDto);
  }

  @Delete(':id')
  async deleteDirecteur(@Param('id') id: number) {
    return await this.directeurService.deleteDirecteur(id);
  }
}