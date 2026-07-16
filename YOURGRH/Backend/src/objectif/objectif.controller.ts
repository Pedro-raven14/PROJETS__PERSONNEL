import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ObjectifService } from './objectif.service';
import { CreateObjectifDto, UpdateObjectifDto } from 'src/dto/objectifDTO';

@Controller('objectif')
export class ObjectifController {
  constructor(private readonly objectifService: ObjectifService) {}

  @Post('add')
  async create(@Body() dto: CreateObjectifDto) {
    return this.objectifService.create(dto);
  }

  @Get('getall')
  async getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.objectifService.getAll(Number(page) || 1, Number(limit) || 10);
  }

  @Get('equipe/:equipeId')
  async getByEquipe(@Param('equipeId', ParseIntPipe) equipeId: number) {
    return this.objectifService.getByEquipe(equipeId);
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.objectifService.getById(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateObjectifDto) {
    return this.objectifService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.objectifService.delete(id);
  }
}
