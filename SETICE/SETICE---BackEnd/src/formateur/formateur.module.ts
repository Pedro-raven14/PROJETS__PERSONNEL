import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Formateur } from './formateur.entity';
import { Utilisateur } from 'src/utilisateur/utilisateur.entity';
import { FormateurService } from './formateur.service';
import { FormateurController } from './formateur.controller';
import { EmailModule } from 'src/email/email.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Formateur, Utilisateur]),
    EmailModule,
  ],
  controllers: [FormateurController],
  providers: [FormateurService],
})
export class FormateurModule {}
