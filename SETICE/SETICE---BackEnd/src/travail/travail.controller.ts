import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { TravailService } from './travail.service';
import { CreateTravailDto } from '../travail/travail.dto';
import { EspacePedagogiqueService } from '../espace_pedagogique/espace_pedagogique.service';

@Controller('espace-pedagogique/:espaceId/travaux')
export class TravailController {
  constructor(
    private readonly travailService: TravailService,
    private readonly espaceService: EspacePedagogiqueService,
  ) {}

  @Post()
  async create(
    @Param('espaceId') espaceId: number,
    @Body() createTravailDto: CreateTravailDto,
  ) {
    const espace = await this.espaceService.findOne(espaceId);
    return this.travailService.createTravail(espace, createTravailDto);
  }

  @Get()
  async findAll(@Param('espaceId') espaceId: number) {
    return this.travailService.findAllByEspace(espaceId);
  }
}
