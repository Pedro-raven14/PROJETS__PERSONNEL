import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { UpdateBudgetDto } from './dto/update-budget.dto';

/**
 * @Controller BudgetsController
 *
 * Routes exposées :
 * GET  /budgets                → lire tous les budgets
 * PATCH /budgets/:categorieId → mettre à jour un budget
 *
 * Note : pas de POST ni DELETE car les budgets sont initialisés
 * au démarrage (onModuleInit). On ne crée/supprime pas de catégories,
 * on modifie juste les montants.
 */
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  /**
   * GET /budgets
   * Retourne tous les budgets sous forme { categorieId: montant }
   * Exemple : { "alimentation": 500, "transport": 200, ... }
   */
  @Get()
  findAll() {
    return this.budgetsService.findAll();
  }

  /**
   * PATCH /budgets/:categorieId
   * Met à jour le montant mensuel d'une catégorie.
   *
   * @Param('categorieId') extrait le segment :categorieId de l'URL.
   * Exemple : PATCH /budgets/alimentation avec { "montant": 600 }
   */
  @Patch(':categorieId')
  update(
    @Param('categorieId') categorieId: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(categorieId, dto);
  }
}
