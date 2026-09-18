import { Module } from '@nestjs/common';
import { MatiereService } from './matiere.service';
import { MatiereController } from './matiere.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Matiere } from './matiere.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Matiere])],
  providers: [MatiereService],
  controllers: [MatiereController]
})
export class MatiereModule {}
