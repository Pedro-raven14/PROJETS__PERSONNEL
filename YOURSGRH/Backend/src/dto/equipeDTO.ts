import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEquipeDto {
  @IsNotEmpty()
  @IsString()
  nom!: string;

  @IsNotEmpty()
  @IsNumber()
  departId!: number;

  @IsOptional()
  @IsNumber()
  managerId?: number;
}

export class UpdateEquipeDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsNumber()
  rendement?: number;

  @IsOptional()
  @IsNumber()
  departId?: number;

  @IsOptional()
  @IsNumber()
  managerId?: number | null; // null pour retirer le manager
}
