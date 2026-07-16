import { Module } from '@nestjs/common';
import { SoumissionController } from './soumission.controller';
import { SoumissionService } from './soumission.service';

@Module({
  controllers: [SoumissionController],
  providers: [SoumissionService]
})
export class SoumissionModule {}
