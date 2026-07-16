// src/technicien/technicien.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechnicienService } from './technicien.service';
import { TechnicienController } from './technicien.controller';
import { Technicien } from './technicien.entity';
import { Utilisateur } from 'src/utilisateur/utilisateur.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Technicien, Utilisateur])],
  providers: [TechnicienService],
  controllers: [TechnicienController],
})
export class TechnicienModule {}
