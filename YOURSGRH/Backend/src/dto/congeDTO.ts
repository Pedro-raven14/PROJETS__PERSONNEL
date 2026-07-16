import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCongeDto {
  @IsNotEmpty()
  @IsDateString()
  date_debut!: string;

  @IsNotEmpty()
  @IsDateString()
  date_fin!: string;

  @IsNotEmpty()
  @IsNumber()
  typeCId!: number;

  @IsOptional()
  @IsString()
  commentaire?: string;
}

export class ValiderCongeDto {
  @IsNotEmpty()
  @IsString()
  statut!: string; // APPROUVE | REFUSE
}
