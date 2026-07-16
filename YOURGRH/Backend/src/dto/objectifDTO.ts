import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateObjectifDto {
  @IsNotEmpty()
  @IsString()
  titre!: string;

  @IsNotEmpty()
  @IsDateString()
  date_debut!: string;

  @IsNotEmpty()
  @IsDateString()
  date_fin!: string;

  @IsNotEmpty()
  @IsNumber()
  equipeId!: number;

  @IsOptional()
  @IsNumber()
  points?: number;
}

export class UpdateObjectifDto {
  @IsOptional()
  @IsString()
  titre?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  points?: number;
}
