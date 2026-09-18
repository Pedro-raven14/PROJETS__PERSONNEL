import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PredictionService } from './prediction.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreatePredictionDto } from 'src/dto/predictionDTO';

@UseGuards(AuthGuard)
@Controller('prediction')
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  // Le RH/Admin connecté lance une prédiction IA
  @Post('lancer')
  async lancer(@Req() req: any, @Body() dto: CreatePredictionDto) {
    return this.predictionService.lancer(req.employee.sub, dto);
  }

  // L'employé connecté demande ses recommandations de formations
  @Get('recommandations-formations')
  async recommandationsFormations(@Req() req: any) {
    return this.predictionService.recommanderFormations(req.employee.sub);
  }

  @Get('getall')
  async getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.predictionService.getAll(Number(page) || 1, Number(limit) || 10);
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.predictionService.getById(id);
  }
}
