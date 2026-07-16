import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { EmployeeService } from './employee.service';
import { employeeDTO } from 'src/dto/employeeDTO';

class PermissionsDto {
  permissions!: (number | string)[];
}

class RoleDto {
  role!: number | string;
}

class UpdateEmployeeDto {
  @IsOptional() @IsString()  nom?: string;
  @IsOptional() @IsString()  prenom?: string;
  @IsOptional() @IsEmail()   email?: string;
  @IsOptional() @IsString()  phone?: string;
  @IsOptional() @IsString()  poste?: string;
  @IsOptional()              soldeConges?: number;
}

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post('createEmployee')
  async createEmployee(@Body() dto: employeeDTO) {
    return this.employeeService.createEmployee(dto);
  }

  @Get('getall')
  async getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.employeeService.getAll(Number(page) || 1, Number(limit) || 10);
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.getById(id);
  }

  // Modifier les infos de base
  @Patch(':id')
  async updateEmployee(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEmployeeDto) {
    return this.employeeService.updateEmployee(id, dto);
  }

  // Changer le rôle d'un employé
  @Patch(':id/role')
  async changerRole(@Param('id', ParseIntPipe) id: number, @Body() dto: RoleDto) {
    return this.employeeService.changerRole(id, dto.role);
  }

  // Ajouter des permissions à un employé (sans toucher aux existantes)
  @Patch(':id/permissions/ajouter')
  async ajouterPermissions(@Param('id', ParseIntPipe) id: number, @Body() dto: PermissionsDto) {
    return this.employeeService.ajouterPermissions(id, dto.permissions);
  }

  // Retirer des permissions spécifiques
  @Patch(':id/permissions/retirer')
  async retirerPermissions(@Param('id', ParseIntPipe) id: number, @Body() dto: PermissionsDto) {
    return this.employeeService.retirerPermissions(id, dto.permissions);
  }

  // Remplacer toutes les permissions par une nouvelle liste
  @Patch(':id/permissions/remplacer')
  async remplacerPermissions(@Param('id', ParseIntPipe) id: number, @Body() dto: PermissionsDto) {
    return this.employeeService.remplacerPermissions(id, dto.permissions);
  }

  // Retirer un employé de son équipe
  @Patch(':id/quitter-equipe')
  async retirerDeEquipe(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.retirerDeEquipe(id);
  }
}
