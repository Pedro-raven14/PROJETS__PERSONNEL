/**
 * DTO FILTER RECIPE — filter-recipe.dto.ts
 *
 * Définit et valide les query params de GET /recipes.
 * Ex: GET /recipes?category=Dessert&sortBy=rating&page=1&limit=9
 *
 * On utilise @IsOptional() sur tous les champs car aucun filtre n'est obligatoire.
 * @Type(() => Number) convertit la query string "1" en nombre 1
 * (les query params sont toujours des strings en HTTP).
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterRecipeDto {
  @ApiPropertyOptional({ example: 'poulet', description: 'Recherche texte libre' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ enum: ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Dessert', 'Collation'] })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: ['Facile', 'Moyen', 'Difficile'] })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiPropertyOptional({ description: '0-15 | 15-30 | 30-60 | 60+' })
  @IsOptional()
  @IsString()
  prepTime?: string;

  @ApiPropertyOptional({ description: 'Tag de régime alimentaire (vegan, végétarien...)' })
  @IsOptional()
  @IsString()
  diet?: string;

  @ApiPropertyOptional({ enum: ['recent', 'popular', 'rating', 'time'], default: 'recent' })
  @IsOptional()
  @IsEnum(['recent', 'popular', 'rating', 'time'])
  sortBy?: 'recent' | 'popular' | 'rating' | 'time';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number) // Convertit la string "1" en number 1
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 9 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 9;

  @ApiPropertyOptional({ enum: ['published', 'draft'] })
  @IsOptional()
  @IsEnum(['published', 'draft'])
  status?: string;
}
