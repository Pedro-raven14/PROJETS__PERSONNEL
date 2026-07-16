import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFichePaieDTO {
  @IsString()
  @IsNotEmpty()
  periode!: string; // ex: "2025-04"

  @IsInt()
  @Min(1)
  @Type(() => Number)
  userId!: number;
}

export class UpdateFichePaieDTO {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  salaire_base?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  nb_jours_absence?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  deduction_absence?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  salaire_net?: number;
}
