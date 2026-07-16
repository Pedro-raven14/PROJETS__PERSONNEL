import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeCongesController } from './type-conges.controller';
import { TypeCongesService } from './type-conges.service';
import { TypeConge } from 'src/entities/typeconge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TypeConge])],
  controllers: [TypeCongesController],
  providers: [TypeCongesService],
})
export class TypeCongesModule {}
