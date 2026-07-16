import { Module } from '@nestjs/common';
import { TravailController } from './travail.controller';
import { TravailService } from './travail.service';
import { Travail } from './travail.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EspacePedagogique } from 'src/espace_pedagogique/espace_pedagogique.entity';
import { EspacePedagogiqueService } from 'src/espace_pedagogique/espace_pedagogique.service';
import { Promotion } from 'src/promotion/promotion.entity';
import { Formateur } from 'src/formateur/formateur.entity';
import { Matiere } from 'src/matiere/matiere.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Travail,
      EspacePedagogique,
      Promotion,
      Formateur,
      Matiere,
    ]),
  ],
  controllers: [TravailController],
  providers: [TravailService, EspacePedagogiqueService],
})
export class TravailModule {}
