import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Employee } from 'src/entities/employee.entity';
import { EmployeeService } from 'src/employee/employee.service';
import { Role } from 'src/entities/role.entity';
import { Permission } from 'src/entities/permission.entity';
import { ParametreRH } from 'src/entities/parametre-rh.entity';
import { Notification } from 'src/entities/notification.entity';
import { NotificationService } from 'src/notification/notification.service';
import { Contrat } from 'src/entities/contrat.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, Role, Permission, ParametreRH, Notification, Contrat]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmployeeService, NotificationService],
})
export class AuthModule {}
