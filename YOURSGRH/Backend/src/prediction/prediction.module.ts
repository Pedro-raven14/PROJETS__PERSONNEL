import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PredictionController } from './prediction.controller';
import { PredictionService } from './prediction.service';
import { Prediction } from 'src/entities/prediction.entity';
import { Employee } from 'src/entities/employee.entity';
import { Formation } from 'src/entities/formation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prediction, Employee, Formation]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [PredictionController],
  providers: [PredictionService],
})
export class PredictionModule {}
