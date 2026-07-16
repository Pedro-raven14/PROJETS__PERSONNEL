import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeConge } from './entities/typeconge.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Employee } from './entities/employee.entity';
import { Departement } from './entities/departement.entity';
import { Equipe } from './entities/equipe.entity';
import { Contrat } from './entities/contrat.entity';
import { Conge } from './entities/conge.entity';
import { Formation } from './entities/formation.entity';
import { Inscription } from './entities/inscription.entity';
import { Evaluation } from './entities/evaluation.entity';
import { CycleEvaluation } from './entities/cycle_evaluation.entity';
import { Competence } from './entities/competence.entity';
import { EmployeCompetence } from './entities/employe_competence.entity';
import { ParametreRH } from './entities/parametre-rh.entity';
import { Objectif } from './entities/objectif.entity';
import { EmployeeModule } from './employee/employee.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { EquipeModule } from './equipe/equipe.module';
import { DepartementModule } from './departement/departement.module';
import { ObjectifModule } from './objectif/objectif.module';
import { PredictionModule } from './prediction/prediction.module';
import { FormationModule } from './formation/formation.module';
import { NotificationModule } from './notification/notification.module';
import { TypeCongesModule } from './type-conges/type-conges.module';
import { CongesModule } from './conges/conges.module';
import { ContratModule } from './contrat/contrat.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { CycleEvaluationModule } from './cycle_evaluation/cycle_evaluation.module';
import { CompetencesModule } from './competences/competences.module';
import { ParametreRhModule } from './parametre-rh/parametre-rh.module';
import { FichePaieModule } from './fiche-paie/fiche-paie.module';
import { HeuresSupModule } from './heures-sup/heures-sup.module';
import { RapportModule } from './rapport/rapport.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get('NODE_ENV') === 'production';

        if (isProd) {
          // ── Production : Supabase via DB_URL ──
          return {
            type: 'postgres',
            url: config.get('DB_URL'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            autoLoadEntities: true,
            synchronize: true,
            dropSchema: false,
            ssl: true,
            extra: { ssl: { rejectUnauthorized: false } },
          };
        }

        // ── Développement : base locale ──
        return {
          type: 'postgres',
          host: config.get('DB_HOST'),
          port: Number(config.get('DB_PORT')),
          username: config.get('DB_USER'),
          password: String(config.get('DB_PASSWORD')),
          database: config.get('DB_NAME'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          dropSchema: true,
        };
      },
    }),

    // Nécessaire pour que AppService puisse injecter les repos du seed
    TypeOrmModule.forFeature([
      TypeConge, Role, Permission, Employee,
      Departement, Equipe, Contrat, Conge,
      Formation, Inscription, Evaluation, CycleEvaluation,
      Competence, EmployeCompetence, ParametreRH, Objectif,
    ]),

    EmployeeModule,
    AuthModule,
    RoleModule,
    PermissionModule,
    EquipeModule,
    DepartementModule,
    ObjectifModule,
    PredictionModule,
    FormationModule,
    NotificationModule,
    TypeCongesModule,
    CongesModule,
    ContratModule,
    EvaluationModule,
    CycleEvaluationModule,
    CompetencesModule,
    ParametreRhModule,
    FichePaieModule,
    HeuresSupModule,
    RapportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
