import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePredictionDto {
  @IsNotEmpty()
  @IsString()
  type!: string; // PROMOTION | RISQUE_DEPART | RECOMMANDATION_FORMATION | etc.
}
