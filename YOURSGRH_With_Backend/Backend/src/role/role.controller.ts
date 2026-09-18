import { Body, Controller, Get, Post } from '@nestjs/common';
import { RoleService } from './role.service';
import { createroleDTO } from 'src/dto/createroleDTO';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('add')
  async createRole(@Body() dto: createroleDTO) {
    return this.roleService.createRole(dto);
  }

  @Get('getall')
  async getAll() {
    return this.roleService.getAll();
  }
}
