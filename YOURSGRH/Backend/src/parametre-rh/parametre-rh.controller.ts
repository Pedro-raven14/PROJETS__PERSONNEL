import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ParametreRhService } from './parametre-rh.service';
import { CreateParametreRhDTO, UpdateParametreRhDTO } from '../dto/parametreRhDTO';
import { AuthGuard } from '../auth/auth.guard';

@Controller('parametre-rh')
export class ParametreRhController {
  constructor(private readonly parametreRhService: ParametreRhService) {}

  // Configurer les paramètres RH (crée ou remplace)
  @Post('setup')
  @UseGuards(AuthGuard)
  upsert(@Body() dto: CreateParametreRhDTO) {
    return this.parametreRhService.upsert(dto);
  }

  // Récupérer les paramètres RH
  @Get()
  get() {
    return this.parametreRhService.get();
  }

  // Mettre à jour les paramètres RH
  @Patch()
  @UseGuards(AuthGuard)
  update(@Body() dto: UpdateParametreRhDTO) {
    return this.parametreRhService.update(dto);
  }
}
