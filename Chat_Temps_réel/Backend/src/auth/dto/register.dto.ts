import { IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';

/*
  Un DTO (Data Transfer Object) valide les données qui entrent dans l'API.
  C'est la "douanière" : si les données ne respectent pas les règles,
  NestJS retourne automatiquement une erreur 400 grâce au ValidationPipe
  qu'on a configuré dans main.ts.

  Pourquoi DTO séparé de l'entité ?
  L'entité représente la table SQL (avec tous ses champs).
  Le DTO représente ce que l'API ACCEPTE en entrée (sous-ensemble de l'entité).
  Ça évite qu'un client malveillant envoie des champs non autorisés.
*/
export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'Le pseudo doit contenir au moins 2 caractères.' })
  @MaxLength(30, { message: 'Le pseudo ne peut pas dépasser 30 caractères.' })
  /*
    Regex : uniquement lettres, chiffres, tirets et underscores.
    Pas d'espaces ni caractères spéciaux pour éviter les injections.
  */
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Le pseudo ne peut contenir que des lettres, chiffres, _ et -.',
  })
  username: string;

  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères.' })
  @MaxLength(100)
  password: string;

  /*
    La couleur d'avatar est optionnelle.
    Si non fournie, la valeur par défaut (#6c5ce7) sera utilisée.
  */
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'La couleur doit être un code hexadécimal valide.' })
  avatarColor?: string;
}
