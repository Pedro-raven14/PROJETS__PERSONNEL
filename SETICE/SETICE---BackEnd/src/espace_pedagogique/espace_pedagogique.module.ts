import { Module } from '@nestjs/common';
import { EspacePedagogiqueService } from './espace_pedagogique.service';
import { EspacePedagogiqueController } from './espace_pedagogique.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EspacePedagogique } from './espace_pedagogique.entity';
import { Promotion } from 'src/promotion/promotion.entity';
import { Formateur } from 'src/formateur/formateur.entity';
import { Matiere } from 'src/matiere/matiere.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EspacePedagogique, Promotion, Formateur, Matiere]),
  ],
  providers: [EspacePedagogiqueService],
  controllers: [EspacePedagogiqueController],
})
export class EspacePedagogiqueModule {}
