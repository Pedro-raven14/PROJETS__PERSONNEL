import { IsEmail, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateParametreRhDTO {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nom_entreprise?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  adresse_entreprise?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  taux_conges_annuels?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  solde_conges_initial?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  nb_jours_preavis_conge?: number;
}

export class UpdateParametreRhDTO extends CreateParametreRhDTO {}
