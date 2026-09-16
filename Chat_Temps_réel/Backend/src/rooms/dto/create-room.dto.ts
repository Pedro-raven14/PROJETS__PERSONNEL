import { IsString, MinLength, MaxLength, IsOptional, IsBoolean, Matches } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  /*
    Regex : minuscules, chiffres et tirets uniquement (style Discord).
    Ex: "général", "equipe-core", "tech-2024"
  */
  @Matches(/^[a-z0-9-éèêàùîôûç]+$/, {
    message: 'Le nom du salon ne peut contenir que des minuscules, chiffres et tirets.',
  })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
