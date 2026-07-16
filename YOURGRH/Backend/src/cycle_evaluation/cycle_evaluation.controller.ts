import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { CycleEvaluationService } from './cycle_evaluation.service';
import { CreateCycleEvaluationDto } from 'src/dto/cycleEvaluationDTO';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('cycle-evaluation')
export class CycleEvaluationController {
  constructor(private readonly cycleService: CycleEvaluationService) {}

  @Post('add')
  @UseGuards(AuthGuard)
  async create(@Body() dto: CreateCycleEvaluationDto) {
    return this.cycleService.create(dto);
  }

  @Get('getall')
  async getAll() {
    return this.cycleService.getAll();
  }

  @Get('actifs')
  async getActifs() {
    return this.cycleService.getActifs();
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.cycleService.getById(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.cycleService.delete(id);
  }
}
