import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsArray,
} from 'class-validator';

export class employeeDTO {
  @IsNotEmpty()
  @IsString()
  nom!: string;

  @IsNotEmpty()
  @IsString()
  prenom!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsNotEmpty()
  @IsString()
  phone!: string;

  @IsOptional()
  @IsString()
  poste?: string;

  // Accepte soit un ID (1) soit un nom ("RH")
  @IsNotEmpty()
  role!: number | string;

  // Accepte soit des IDs ([1, 2]) soit des noms (["VIEW_EMPLOYEES", "CREATE_EMPLOYEE"])
  // Si absent → pack automatique selon le rôle
  @IsOptional()
  @IsArray()
  permissions?: (number | string)[];
}
