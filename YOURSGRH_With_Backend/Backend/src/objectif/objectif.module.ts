import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjectifController } from './objectif.controller';
import { ObjectifService } from './objectif.service';
import { Objectif } from 'src/entities/objectif.entity';
import { Equipe } from 'src/entities/equipe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Objectif, Equipe])],
  controllers: [ObjectifController],
  providers: [ObjectifService],
})
export class ObjectifModule {}
