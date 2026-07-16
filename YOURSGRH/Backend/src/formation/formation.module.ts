import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormationController } from './formation.controller';
import { FormationService } from './formation.service';
import { Formation } from 'src/entities/formation.entity';
import { Employee } from 'src/entities/employee.entity';
import { Competence } from 'src/entities/competence.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Formation, Employee, Competence])],
  controllers: [FormationController],
  providers: [FormationService],
})
export class FormationModule {}
