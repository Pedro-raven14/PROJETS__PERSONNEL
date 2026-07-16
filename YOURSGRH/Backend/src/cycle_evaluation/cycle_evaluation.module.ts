import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CycleEvaluationController } from './cycle_evaluation.controller';
import { CycleEvaluationService } from './cycle_evaluation.service';
import { CycleEvaluation } from 'src/entities/cycle_evaluation.entity';
import { Employee } from 'src/entities/employee.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CycleEvaluation, Employee]),
    NotificationModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [CycleEvaluationController],
  providers: [CycleEvaluationService],
})
export class CycleEvaluationModule {}
