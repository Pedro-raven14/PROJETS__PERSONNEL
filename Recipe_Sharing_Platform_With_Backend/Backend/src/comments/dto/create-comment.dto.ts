import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Recette testée hier soir, délicieuse !' })
  @IsString()
  @MinLength(1, { message: 'Le commentaire ne peut pas être vide' })
  @MaxLength(1000, { message: 'Le commentaire est trop long (max 1000 caractères)' })
  text: string;
}
