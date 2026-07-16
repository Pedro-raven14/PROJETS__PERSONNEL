import { IsNumber, Min } from 'class-validator';

/**
 * @DTO UpdateBudgetDto
 *
 * Utilisé pour PATCH /budgets/:categorieId.
 * On ne met à jour qu'une seule chose : le montant du budget.
 *
 * @IsNumber : doit être un nombre (pas une string).
 * @Min(0) : le budget peut être 0 (= pas de budget pour cette catégorie),
 * mais ne peut pas être négatif (un budget négatif n'a pas de sens).
 */
export class UpdateBudgetDto {
  @IsNumber({}, { message: 'Le montant doit être un nombre' })
  @Min(0, { message: 'Le montant ne peut pas être négatif' })
  montant: number;
}
