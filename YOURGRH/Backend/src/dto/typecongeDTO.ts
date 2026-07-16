import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTypeCongeDto {
  @IsNotEmpty()
  @IsString()
  nomType!: string;

  @IsOptional()
  @IsBoolean()
  impacte_salaire?: boolean;
}
