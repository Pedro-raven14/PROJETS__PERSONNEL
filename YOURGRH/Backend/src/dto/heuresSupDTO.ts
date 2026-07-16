import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHeuresSupDto {
  @IsNotEmpty()
  @IsDateString()
  date!: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0.5)
  nb_heures!: number;

  @IsOptional()
  @IsString()
  motif?: string;
}

export class ValiderHeuresSupDto {
  @IsNotEmpty()
  @IsString()
  statut!: 'VALIDEE' | 'REFUSEE';
}
