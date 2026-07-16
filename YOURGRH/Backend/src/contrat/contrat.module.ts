import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ContratController } from './contrat.controller';
import { ContratService } from './contrat.service';
import { PdfService } from './pdf.service';
import { SupabaseStorageService } from './supabase-storage.service';
import { Contrat } from 'src/entities/contrat.entity';
import { Employee } from 'src/entities/employee.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contrat, Employee]),
    NotificationModule, // pour envoyer des notifications
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [ContratController],
  providers: [ContratService, PdfService, SupabaseStorageService],
})
export class ContratModule {}
