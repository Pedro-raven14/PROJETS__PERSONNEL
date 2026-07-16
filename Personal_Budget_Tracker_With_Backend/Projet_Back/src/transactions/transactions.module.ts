import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './entities/transaction.entity';

/**
 * @Module TransactionsModule
 *
 * Un Module NestJS est un bloc de fonctionnalité autonome.
 * Il encapsule tout ce qui est nécessaire pour les transactions :
 * - imports : modules externes nécessaires (TypeOrmModule pour la BDD)
 * - controllers : gestion des routes HTTP
 * - providers : services avec la logique métier
 * - exports : ce qu'on rend disponible AUX AUTRES modules
 *
 * TypeOrmModule.forFeature([Transaction]) enregistre le Repository<Transaction>
 * pour qu'on puisse l'injecter avec @InjectRepository(Transaction) dans le service.
 *
 * exports: [TransactionsService] est CRUCIAL : il permet au StatsModule
 * d'utiliser TransactionsService pour calculer les statistiques,
 * sans dupliquer la logique d'accès aux données.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService], // StatsModule pourra injecter TransactionsService
})
export class TransactionsModule {}
