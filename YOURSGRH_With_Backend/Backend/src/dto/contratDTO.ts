import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContratDto {
  @IsNotEmpty()
  @IsString()
  type!: string;

  @IsNotEmpty()
  @IsDateString()
  date_debut!: string;

  @IsOptional()
  @IsDateString()
  date_fin?: string;

  @IsNotEmpty()
  @IsString()
  poste!: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  salaire!: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  userId!: number;
}

export class UpdateContratDto {
  @IsOptional()
  @IsString()
  statut?: string;

  @IsOptional()
  @IsNumber()
  salaire?: number;

  @IsOptional()
  @IsDateString()
  date_fin?: string;
}
