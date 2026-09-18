export class espaceDTO {
  nom?: string;
  matiere?: string | number;
  description?: string;
  filiere?: string;
  options?: string;
  anneeAcademique?: string;
  formateurId?: number;
}

import { IsNumber } from 'class-validator';
export class assignFormateurDTO {
  @IsNumber()
  espaceId: number;

  @IsNumber()
  formateurId: number;
}