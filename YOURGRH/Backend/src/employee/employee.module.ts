import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from 'src/entities/employee.entity';
import { Role } from 'src/entities/role.entity';
import { Permission } from 'src/entities/permission.entity';
import { ParametreRH } from 'src/entities/parametre-rh.entity';
import { Notification } from 'src/entities/notification.entity';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Role, Permission, ParametreRH, Notification])],
  controllers: [EmployeeController],
  providers: [EmployeeService, NotificationService],
})
export class EmployeeModule {}
