import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { TypeCongesService } from './type-conges.service';
import { CreateTypeCongeDto } from 'src/dto/typecongeDTO';

@Controller('type-conge')
export class TypeCongesController {
  constructor(private readonly typeCongesService: TypeCongesService) {}

  @Post('add')
  async create(@Body() dto: CreateTypeCongeDto) {
    return this.typeCongesService.create(dto);
  }

  @Get('getall')
  async getAll() {
    return this.typeCongesService.getAll();
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.typeCongesService.delete(id);
  }
}
