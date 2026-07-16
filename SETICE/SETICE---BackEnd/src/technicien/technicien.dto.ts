
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTechnicienDto {
  @IsString()
  @IsNotEmpty()
  specialite: string;

  @IsNumber()
  @IsNotEmpty()
  utilisateurId: number;
}
