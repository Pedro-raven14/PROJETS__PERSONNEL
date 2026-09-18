import { IsDateString, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateEvaluationDto {
  @IsNotEmpty()
  @IsNumber()
  userId!: number; // ID de l'employé évalué

  @IsNotEmpty()
  @IsNumber()
  evaluateurId!: number; // ID du manager qui évalue

  @IsNotEmpty()
  @IsNumber()
  cycleId!: number; // ID du cycle d'évaluation

  @IsNotEmpty()
  @IsDateString()
  date!: string;

  @IsNotEmpty()
  @IsObject()
  notes_criteres!: Record<string, number>; // { "Communication": 4, "Technique": 3, ... }

  @IsOptional()
  @IsString()
  commentaire?: string;
}
