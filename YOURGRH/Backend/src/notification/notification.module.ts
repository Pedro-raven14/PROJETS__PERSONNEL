import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { Notification } from 'src/entities/notification.entity';
import { Employee } from 'src/entities/employee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, Employee]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService], // exporté pour être utilisé par d'autres modules
})
export class NotificationModule {}
