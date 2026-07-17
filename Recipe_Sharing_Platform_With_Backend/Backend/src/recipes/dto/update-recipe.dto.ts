/**
 * DTO UPDATE RECIPE — update-recipe.dto.ts
 *
 * PartialType(CreateRecipeDto) crée automatiquement un DTO où tous les
 * champs de CreateRecipeDto sont optionnels.
 *
 * C'est le pattern "PartialType" de @nestjs/mapped-types :
 * on ne réécrit pas tous les champs, on part du DTO de création.
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreateRecipeDto } from './create-recipe.dto';

/**
 * UpdateRecipeDto hérite de tous les champs de CreateRecipeDto,
 * mais les rend tous optionnels (IsOptional implicitement ajouté).
 * Ainsi, PATCH /recipes/:id peut modifier un ou plusieurs champs.
 */
export class UpdateRecipeDto extends PartialType(CreateRecipeDto) {}
