import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCycleEvaluationDto {
  @IsNotEmpty()
  @IsString()
  nom!: string;

  @IsNotEmpty()
  @IsDateString()
  date_debut!: string;

  @IsNotEmpty()
  @IsDateString()
  date_fin!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  criteres?: string[]; // ex: ["Communication", "Technique", "Ponctualité"]
}
