import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ParametreRhService } from './parametre-rh.service';
import { ParametreRhController } from './parametre-rh.controller';
import { ParametreRH } from '../entities/parametre-rh.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ParametreRH]),
    JwtModule.register({}),
  ],
  providers: [ParametreRhService],
  controllers: [ParametreRhController],
  exports: [ParametreRhService],
})
export class ParametreRhModule {}
