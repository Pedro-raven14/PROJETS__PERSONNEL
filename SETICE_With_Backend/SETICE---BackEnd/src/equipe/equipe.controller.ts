import { Body, Controller, Post } from '@nestjs/common';
import { EquipeService } from './equipe.service';
import { Equipe } from './equipe.entity';

@Controller('equipe')
export class EquipeController {
  constructor(private readonly equipeService: EquipeService) {}

  @Post()
  async addEquipe(
    @Body('nom') nom: string,
    @Body('promotionId') promotionId: number,
  ): Promise<Equipe> {
    return this.equipeService.createEquipe(nom, promotionId);
  }
}
