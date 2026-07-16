import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';
import { Budget } from './entities/budget.entity';

/**
 * @Module BudgetsModule
 *
 * exports: [BudgetsService] permet à StatsModule d'utiliser BudgetsService
 * pour récupérer les budgets définis lors du calcul de budget-usage.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Budget])],
  controllers: [BudgetsController],
  providers: [BudgetsService],
  exports: [BudgetsService],
})
export class BudgetsModule {}
