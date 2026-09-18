import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto } from 'src/dto/evaluationDTO';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('evaluation')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post('add')
  @UseGuards(AuthGuard)
  async create(@Body() dto: CreateEvaluationDto) {
    return this.evaluationService.create(dto);
  }

  @Get('getall')
  async getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.evaluationService.getAll(Number(page) || 1, Number(limit) || 10);
  }

  @Get('employee/:userId')
  async getByEmployee(@Param('userId', ParseIntPipe) userId: number) {
    return this.evaluationService.getByEmployee(userId);
  }

  // Évaluations faites par un manager (optionnellement filtrées par cycle)
  @Get('evaluateur/:evaluateurId')
  async getByEvaluateur(
    @Param('evaluateurId', ParseIntPipe) evaluateurId: number,
    @Query('cycleId') cycleId?: string,
  ) {
    return this.evaluationService.getByEvaluateur(evaluateurId, cycleId ? Number(cycleId) : undefined);
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.evaluationService.getById(id);
  }
}
