import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { PermissionService } from './permission.service';

class CreatePermissionDto {
  @IsNotEmpty()
  @IsString()
  nom!: string;
}

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('add')
  async create(@Body() dto: CreatePermissionDto) {
    return this.permissionService.create(dto.nom);
  }

  @Get('getall')
  async getAll() {
    return this.permissionService.getAll();
  }
}
