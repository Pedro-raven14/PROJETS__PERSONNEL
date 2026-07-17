/**
 * UPLOAD MODULE — upload.module.ts
 *
 * Module simple : juste le controller (pas de service séparé car la logique
 * est courte et directement dans le controller).
 * On importe ConfigModule pour avoir accès à ConfigService (clés Cloudinary).
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './upload.controller';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
})
export class UploadModule {}
