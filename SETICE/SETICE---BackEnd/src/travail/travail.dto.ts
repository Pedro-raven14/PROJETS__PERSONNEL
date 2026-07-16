import { TypeTravail } from '../travail/travail.entity';
import { IsEnum, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateTravailDto {
  @IsNotEmpty()
  titre: string;

  @IsNotEmpty()
  description: string;

  @IsEnum(TypeTravail)
  type: TypeTravail;

  @IsDateString()
  dateDebut: string;

  @IsDateString()
  dateFin: string;
}
