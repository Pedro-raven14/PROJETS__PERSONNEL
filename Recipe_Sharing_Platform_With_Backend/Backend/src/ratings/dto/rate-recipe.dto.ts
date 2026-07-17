import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max, IsInt } from 'class-validator';

export class RateRecipeDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt({ message: 'La note doit être un entier' })
  @Min(1, { message: 'La note minimale est 1' })
  @Max(5, { message: 'La note maximale est 5' })
  rating: number;
}
