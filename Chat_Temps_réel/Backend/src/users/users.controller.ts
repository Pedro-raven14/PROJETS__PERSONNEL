import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/*
  Endpoint GET /users : retourne tous les utilisateurs (sans password).
  Utilisé par la Sidebar pour afficher la liste des membres dans les DMs
  et par Room.jsx pour construire la liste des membres avec statuts temps réel.
*/
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
