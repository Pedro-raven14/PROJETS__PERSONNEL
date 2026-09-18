// src/technicien/technicien.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TechnicienService } from './technicien.service';
import { CreateTechnicienDto } from './technicien.dto';

@Controller('techniciens')
export class TechnicienController {
  constructor(private readonly technicienService: TechnicienService) {}

  @Post()
  create(@Body() dto: CreateTechnicienDto) {
    return this.technicienService.create(dto);
  }

  @Get()
  findAll() {
    return this.technicienService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.technicienService.findOne(id);
  }
}
