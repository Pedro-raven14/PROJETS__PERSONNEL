import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFormationDto {
  @IsNotEmpty()
  @IsString()
  titre!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  heures_par_jour!: number;

  @IsOptional()
  @IsString()
  niveau?: string; // DÉBUTANT | INTERMÉDIAIRE | AVANCÉ

  @IsNotEmpty()
  @IsDateString()
  date_debut!: string;

  @IsNotEmpty()
  @IsDateString()
  date_fin!: string;

  @IsNotEmpty()
  @IsNumber()
  capacite!: number;

  // IDs des compétences ciblées par cette formation (optionnel)
  @IsOptional()
  @IsArray()
  competenceIds?: number[];
}

export class InscrireEmployeDto {
  @IsNotEmpty()
  @IsNumber()
  userId!: number;
}
