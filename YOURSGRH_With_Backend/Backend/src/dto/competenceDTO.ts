import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

// Créer une compétence dans le référentiel global
export class CreateCompetenceDto {
  @IsNotEmpty()
  @IsString()
  nom!: string;

  @IsOptional()
  @IsString()
  categorie?: string;
}

// Assigner une compétence à un employé avec son niveau
export class AssignerCompetenceDto {
  // Nom de la compétence — si elle n'existe pas en base, elle sera créée automatiquement
  @IsNotEmpty()
  @IsString()
  nom!: string;

  @IsOptional()
  @IsString()
  categorie?: string;

  // Niveau de maîtrise : 1 (débutant) à 5 (expert)
  @IsInt()
  @Min(1)
  @Max(5)
  niveau!: number;
}

// Mettre à jour le niveau d'une compétence existante
export class UpdateNiveauDto {
  @IsInt()
  @Min(1)
  @Max(5)
  niveau!: number;
}
