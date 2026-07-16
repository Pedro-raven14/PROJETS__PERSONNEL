import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HeuresSupController } from './heures-sup.controller';
import { HeuresSupService } from './heures-sup.service';
import { HeuresSup } from 'src/entities/heures-sup.entity';
import { Employee } from 'src/entities/employee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HeuresSup, Employee]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [HeuresSupController],
  providers: [HeuresSupService],
  exports: [HeuresSupService],
})
export class HeuresSupModule {}
