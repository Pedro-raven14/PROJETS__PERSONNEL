import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CongesController } from './conges.controller';
import { CongesService } from './conges.service';
import { Conge } from 'src/entities/conge.entity';
import { Employee } from 'src/entities/employee.entity';
import { TypeConge } from 'src/entities/typeconge.entity';
import { ParametreRH } from 'src/entities/parametre-rh.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conge, Employee, TypeConge, ParametreRH]),
    NotificationModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [CongesController],
  providers: [CongesService],
})
export class CongesModule {}
