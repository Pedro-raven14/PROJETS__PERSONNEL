import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDepartementDto {
  @IsNotEmpty()
  @IsString()
  nom!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateDepartementDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  rendement?: number;
}
