import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RapportController } from './rapport.controller';
import { RapportService } from './rapport.service';
import { RapportPdfService } from './rapport-pdf.service';
import { SupabaseRapportService } from './supabase-rapport.service';
import { Rapport } from 'src/entities/rapport.entity';
import { Employee } from 'src/entities/employee.entity';
import { Contrat } from 'src/entities/contrat.entity';
import { Conge } from 'src/entities/conge.entity';
import { Formation } from 'src/entities/formation.entity';
import { Evaluation } from 'src/entities/evaluation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rapport, Employee, Contrat, Conge, Formation, Evaluation]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [RapportController],
  providers: [RapportService, RapportPdfService, SupabaseRapportService],
})
export class RapportModule {}
