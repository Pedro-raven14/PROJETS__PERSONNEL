import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetencesController } from './competences.controller';
import { CompetencesService } from './competences.service';
import { Competence } from 'src/entities/competence.entity';
import { EmployeCompetence } from 'src/entities/employe_competence.entity';
import { Employee } from 'src/entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Competence, EmployeCompetence, Employee])],
  controllers: [CompetencesController],
  providers: [CompetencesService],
  exports: [CompetencesService], // exporté pour être utilisé par le service IA
})
export class CompetencesModule {}
