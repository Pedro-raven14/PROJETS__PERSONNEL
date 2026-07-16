import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * @DTO UpdatePreferencesDto
 *
 * Tous les champs sont optionnels (@IsOptional) car on utilise PATCH :
 * on peut ne modifier qu'un seul champ à la fois.
 *
 * Exemple : PATCH /preferences avec { "nom": "Alice" }
 * → seul le nom est modifié, devise/premierJour/notifications restent inchangés.
 */
export class UpdatePreferencesDto {
  /**
   * Prénom affiché sur le dashboard.
   * @MaxLength(100) correspond à la contrainte de la colonne en base.
   */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nom?: string;

  /**
   * Devise monétaire.
   * @IsIn vérifie que la valeur est l'une des devises supportées.
   */
  @IsOptional()
  @IsIn(['€', '$', '£', 'CHF'], {
    message: "La devise doit être '€', '$', '£' ou 'CHF'",
  })
  devise?: '€' | '$' | '£' | 'CHF';

  /**
   * Premier jour de la semaine.
   */
  @IsOptional()
  @IsIn(['lundi', 'dimanche'], {
    message: "premierJour doit être 'lundi' ou 'dimanche'",
  })
  premierJour?: 'lundi' | 'dimanche';

  /**
   * Activer/désactiver les notifications.
   * @IsBoolean : doit être un booléen JavaScript (true/false).
   * Avec transform: true dans main.ts, les strings "true"/"false" sont
   * automatiquement convertis en booléens.
   */
  @IsOptional()
  @IsBoolean()
  notifications?: boolean;
}
