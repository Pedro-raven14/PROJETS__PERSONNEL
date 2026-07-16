import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { DepartementService } from './departement.service';
import { CreateDepartementDto, UpdateDepartementDto } from 'src/dto/departementDTO';

@Controller('departement')
export class DepartementController {
  constructor(private readonly departementService: DepartementService) {}

  @Post('add')
  async create(@Body() dto: CreateDepartementDto) {
    return this.departementService.create(dto);
  }

  @Get('getall')
  async getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.departementService.getAll(Number(page) || 1, Number(limit) || 10);
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.departementService.getById(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDepartementDto) {
    return this.departementService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.departementService.delete(id);
  }
}
