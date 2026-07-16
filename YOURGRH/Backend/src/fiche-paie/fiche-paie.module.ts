import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { FichePaieService } from './fiche-paie.service';
import { FichePaieController } from './fiche-paie.controller';
import { FichePaiePdfService } from './fiche-paie-pdf.service';
import { FichePaieStorageService } from './fiche-paie-storage.service';
import { FichePaie } from '../entities/fiche-paie.entity';
import { Employee } from '../entities/employee.entity';
import { Contrat } from '../entities/contrat.entity';
import { Conge } from '../entities/conge.entity';
import { ParametreRH } from '../entities/parametre-rh.entity';
import { Notification } from '../entities/notification.entity';
import { HeuresSupModule } from '../heures-sup/heures-sup.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FichePaie, Employee, Contrat, Conge, ParametreRH, Notification]),
    JwtModule.register({}),
    HeuresSupModule,
  ],
  providers: [FichePaieService, FichePaiePdfService, FichePaieStorageService],
  controllers: [FichePaieController],
  exports: [FichePaieService],
})
export class FichePaieModule {}
