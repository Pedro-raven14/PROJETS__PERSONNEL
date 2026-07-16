import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { TransactionsModule } from '../transactions/transactions.module';
import { BudgetsModule } from '../budgets/budgets.module';

/**
 * @Module StatsModule
 *
 * Ce module IMPORTE d'autres modules pour accéder à leurs services.
 *
 * imports: [TransactionsModule, BudgetsModule]
 * → Grâce aux exports dans ces modules, NestJS peut injecter
 *   TransactionsService et BudgetsService dans StatsService.
 *
 * Sans ces imports, NestJS lancerait une erreur :
 * "Can't resolve dependencies of StatsService (?). Please make sure that the argument
 * TransactionsService at index [0] is available in the StatsModule context."
 *
 * Pas de TypeOrmModule.forFeature ici : StatsService n'a pas de repository propre,
 * il délègue tout l'accès données à TransactionsService et BudgetsService.
 */
@Module({
  imports: [TransactionsModule, BudgetsModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
