/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DTO REGISTER — register.dto.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Un DTO (Data Transfer Object) est un objet qui définit la "forme" des données
 * attendues dans le body d'une requête HTTP.
 *
 * POURQUOI des DTOs ?
 * 1. Validation automatique : class-validator vérifie les données AVANT
 *    qu'elles atteignent le service. Si invalide → 400 Bad Request auto.
 * 2. Documentation Swagger : les décorateurs @ApiProperty() génèrent
 *    la documentation de l'API automatiquement.
 * 3. Type safety : TypeScript sait exactement quels champs existent.
 * 4. Whitelist : avec whitelist: true dans ValidationPipe, les champs
 *    non déclarés dans le DTO sont automatiquement supprimés (sécurité).
 */

import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  /**
   * @ApiProperty → génère la documentation Swagger pour ce champ.
   * example → la valeur d'exemple affichée dans Swagger UI.
   */
  @ApiProperty({ example: 'Marie Dupont' })
  /**
   * @IsString() → vérifie que c'est bien une chaîne de caractères.
   * @MinLength(2) → au moins 2 caractères.
   * @MaxLength(100) → pas plus de 100 caractères.
   *
   * Si la validation échoue, NestJS retourne automatiquement :
   * { statusCode: 400, message: [...], error: "Bad Request" }
   */
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ example: 'mariedupont' })
  @IsString()
  /**
   * @Matches(regex) → le username ne doit contenir que des lettres ASCII sans accent,
   * chiffres et underscores, entre 3 et 20 caractères.
   * Les accents (é, è, à...) sont exclus car les usernames apparaissent dans les URLs
   * (/profil/username) et les caractères spéciaux causent des problèmes d'encodage.
   */
  @Matches(/^[a-zA-Z0-9_]{3,20}$/, {
    message:
      'Le username doit faire 3-20 caractères (lettres sans accent, chiffres, _). Ex : Pedro1 au lieu de Pédro1',
  })
  username: string;

  @ApiProperty({ example: 'marie@example.com' })
  /**
   * @IsEmail() → vérifie le format email (présence du @, domaine valide, etc.)
   */
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({ example: 'motdepasse123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit faire au moins 6 caractères' })
  @MaxLength(100)
  password: string;
}
