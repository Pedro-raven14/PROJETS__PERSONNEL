import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartementController } from './departement.controller';
import { DepartementService } from './departement.service';
import { Departement } from 'src/entities/departement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Departement])],
  controllers: [DepartementController],
  providers: [DepartementService],
})
export class DepartementModule {}
