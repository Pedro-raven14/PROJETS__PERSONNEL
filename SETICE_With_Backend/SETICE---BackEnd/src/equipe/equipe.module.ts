import { Module } from '@nestjs/common';
import { EquipeController } from './equipe.controller';
import { EquipeService } from './equipe.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipe } from './equipe.entity';
import { Promotion } from 'src/promotion/promotion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Equipe, Promotion])],
  controllers: [EquipeController],
  providers: [EquipeService],
})
export class EquipeModule {}
