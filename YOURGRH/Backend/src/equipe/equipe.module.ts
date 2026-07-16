import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EquipeController } from './equipe.controller';
import { EquipeService } from './equipe.service';
import { Equipe } from 'src/entities/equipe.entity';
import { Departement } from 'src/entities/departement.entity';
import { Employee } from 'src/entities/employee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Equipe, Departement, Employee]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [EquipeController],
  providers: [EquipeService],
})
export class EquipeModule {}
