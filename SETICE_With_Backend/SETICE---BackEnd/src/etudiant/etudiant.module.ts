import { Module } from '@nestjs/common';
import { EtudiantService } from './etudiant.service';
import { EtudiantController } from './etudiant.controller';
import { Etudiant } from './etudiant.entity';
import { Promotion } from 'src/promotion/promotion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utilisateur } from 'src/utilisateur/utilisateur.entity';
import { EmailModule } from 'src/email/email.module';



@Module({
  imports: [
    TypeOrmModule.forFeature([Etudiant, Utilisateur, Promotion]),
    EmailModule,
  ],
  providers: [EtudiantService],
  controllers: [EtudiantController]
})
export class EtudiantModule {}
