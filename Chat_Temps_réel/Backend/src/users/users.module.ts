import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

/*
  Le module NestJS est une "boîte" qui regroupe :
  - imports : les dépendances externes (ici le repository TypeORM)
  - providers : les services de ce module
  - exports : ce qu'on expose aux autres modules

  On exporte UsersService pour que AuthModule puisse l'utiliser.
*/
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
