/**
 * DTO UPDATE USER — update-user.dto.ts
 *
 * Tous les champs sont optionnels (IsOptional) car on peut modifier
 * seulement certains champs du profil.
 *
 * PartialType() de @nestjs/mapped-types rend tous les champs optionnels
 * mais on préfère le faire manuellement pour ajouter des validations spécifiques
 * et exclure les champs comme email/password qui ne doivent pas être modifiables
 * via cet endpoint.
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Marie Dupont' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({ example: 'Passionnée de cuisine française 🍞' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  /**
   * @IsUrl() → vérifie que c'est bien une URL valide.
   * require_tld: false → autorise les URLs locales (ex: http://localhost:3000/...)
   * C'est l'URL Cloudinary de l'avatar.
   */
  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/...' })
  @IsOptional()
  @IsUrl({ require_tld: false }, { message: 'L\'avatar doit être une URL valide' })
  avatar?: string;
}
