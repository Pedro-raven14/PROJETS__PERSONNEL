/**
 * DTO LOGIN — login.dto.ts
 *
 * Simple : juste email + password.
 * La validation est plus légère qu'à l'inscription car on veut des messages
 * d'erreur génériques (ne pas révéler si l'email existe ou non).
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'marie@example.com' })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({ example: 'motdepasse123' })
  @IsString()
  @MinLength(1)
  password: string;
}
