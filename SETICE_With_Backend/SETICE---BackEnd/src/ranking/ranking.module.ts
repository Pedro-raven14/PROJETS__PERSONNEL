import { Module } from '@nestjs/common';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Etudiant } from 'src/etudiant/etudiant.entity';
import { Equipe } from 'src/equipe/equipe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Etudiant,Equipe])],
  controllers: [RankingController],
  providers: [RankingService]
})
export class RankingModule {}
