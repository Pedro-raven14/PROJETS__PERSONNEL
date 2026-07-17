/**
 * DTO CREATE RECIPE — create-recipe.dto.ts
 *
 * Définit et valide le body de POST /recipes.
 * Utilise class-validator pour des validations riches.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsUrl,
  Min,
  Max,
  MaxLength,
  MinLength,
  ValidateNested,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Ingredient } from '../recipe.entity';

/**
 * DTO imbriqué pour valider chaque ingrédient.
 * @ValidateNested + @Type(() => IngredientDto) → class-validator descend
 * dans les objets imbriqués pour les valider aussi.
 */
export class IngredientDto implements Ingredient {
  @ApiProperty({ example: '6' })
  @IsString()
  quantity: string;

  @ApiProperty({ example: 'unités' })
  @IsString()
  unit: string;

  @ApiProperty({ example: 'pommes Golden' })
  @IsString()
  @MinLength(1)
  name: string;
}

export class CreateRecipeDto {
  @ApiProperty({ example: 'Tarte tatin aux pommes' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Un classique français...' })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @ApiProperty({ enum: ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Dessert', 'Collation'] })
  @IsEnum(['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Dessert', 'Collation'], {
    message: 'Catégorie invalide',
  })
  category: string;

  @ApiProperty({ enum: ['Facile', 'Moyen', 'Difficile'] })
  @IsEnum(['Facile', 'Moyen', 'Difficile'], { message: 'Difficulté invalide' })
  difficulty: string;

  @ApiProperty({ example: 30, description: 'Temps de préparation en minutes' })
  @IsNumber()
  @Min(0)
  @Max(1440) // 24 heures max
  prepTime: number;

  @ApiProperty({ example: 25, description: 'Temps de cuisson en minutes' })
  @IsNumber()
  @Min(0)
  @Max(1440)
  cookTime: number;

  @ApiProperty({ example: 6, description: 'Nombre de portions' })
  @IsNumber()
  @IsPositive()
  @Max(100)
  servings: number;

  @ApiPropertyOptional({ example: '🥧' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  emoji?: string;

  @ApiPropertyOptional({ example: '#FFF3CD' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  bgColor?: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/...' })
  @IsOptional()
  @IsUrl({ require_tld: false }, { message: 'imageUrl doit être une URL valide' })
  imageUrl?: string;

  @ApiPropertyOptional({ example: ['dessert', 'français', 'pommes'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // Valide chaque élément du tableau
  tags?: string[];

  /**
   * @ValidateNested({ each: true }) → valide chaque IngredientDto du tableau.
   * @Type(() => IngredientDto) → nécessaire pour que class-transformer
   * instancie les objets du tableau en IngredientDto (pas des plain objects).
   */
  @ApiProperty({ type: [IngredientDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientDto)
  ingredients: IngredientDto[];

  @ApiProperty({ example: ['Préchauffer le four...', 'Mélanger...'] })
  @IsArray()
  @IsString({ each: true })
  instructions: string[];

  @ApiPropertyOptional({ enum: ['published', 'draft'], default: 'published' })
  @IsOptional()
  @IsEnum(['published', 'draft'])
  status?: 'published' | 'draft';
}
