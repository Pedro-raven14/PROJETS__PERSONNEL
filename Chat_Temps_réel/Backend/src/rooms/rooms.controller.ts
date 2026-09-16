import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/*
  Toutes les routes de ce controller nécessitent un JWT valide.
  @UseGuards(JwtAuthGuard) au niveau du controller s'applique
  à toutes les routes en dessous.
*/
@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateRoomDto, @Req() req: any) {
    /*
      req.user est injecté par JwtAuthGuard (via JwtStrategy.validate()).
      Ça contient l'utilisateur authentifié sans avoir à requêter la DB.
    */
    return this.roomsService.create(dto, req.user);
  }
}
