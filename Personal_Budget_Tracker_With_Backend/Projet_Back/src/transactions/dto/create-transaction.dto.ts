import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * @DTO CreateTransactionDto
 *
 * Un DTO (Data Transfer Object) sert à VALIDER et TYPER les données
 * qui arrivent dans le body d'une requête HTTP.
 *
 * POURQUOI des DTOs ?
 * Sans validation, un utilisateur pourrait envoyer n'importe quoi :
 * montant = -500, type = "pomme", date = "pas-une-date"...
 * Les décorateurs de class-validator lancent automatiquement une erreur 400
 * si les données ne respectent pas les règles.
 *
 * Le ValidationPipe dans main.ts s'occupe d'appeler cette validation
 * avant même d'entrer dans le controller.
 */
export class CreateTransactionDto {
  /**
   * Type de la transaction.
   * @IsIn() vérifie que la valeur est exactement 'revenu' ou 'depense'.
   * Ces deux valeurs correspondent aux types du frontend.
   */
  @IsIn(['revenu', 'depense'], {
    message: "Le type doit être 'revenu' ou 'depense'",
  })
  type: 'revenu' | 'depense';

  /**
   * ID de la catégorie.
   * On valide que c'est un ID connu des deux côtés (frontend + backend).
   * @IsIn() avec la liste complète des catégories.
   */
  @IsIn(
    [
      // Catégories dépenses
      'alimentation',
      'transport',
      'logement',
      'shopping',
      'loisirs',
      'sante',
      'factures',
      'education',
      'autre_depense',
      // Catégories revenus
      'salaire',
      'freelance',
      'investissement',
      'cadeau',
      'autre_revenu',
    ],
    { message: 'Catégorie invalide' },
  )
  categorie: string;

  /**
   * Description de la transaction (texte libre).
   * @IsNotEmpty : ne peut pas être vide "".
   * @MaxLength : limite à 255 chars pour correspondre à la colonne en base.
   */
  @IsString()
  @IsNotEmpty({ message: 'La description ne peut pas être vide' })
  @MaxLength(255)
  description: string;

  /**
   * Montant toujours positif.
   * @IsNumber : doit être un nombre.
   * @IsPositive : doit être > 0 (pas 0, pas négatif).
   */
  @IsNumber({}, { message: 'Le montant doit être un nombre' })
  @IsPositive({ message: 'Le montant doit être positif' })
  montant: number;

  /**
   * Date au format ISO "YYYY-MM-DD".
   * @IsDateString vérifie le format de date valide.
   */
  @IsDateString({}, { message: 'La date doit être au format YYYY-MM-DD' })
  date: string;

  /**
   * Note optionnelle.
   * @IsOptional : ce champ peut être absent du body, la valeur sera undefined.
   * Si absent, le service lui donnera une chaîne vide "".
   */
  @IsOptional()
  @IsString()
  note?: string;

  /**
   * Statut du paiement.
   * @IsIn : doit être exactement 'paye' ou 'en_attente'.
   */
  @IsIn(['paye', 'en_attente'], {
    message: "Le statut doit être 'paye' ou 'en_attente'",
  })
  statut: 'paye' | 'en_attente';
}
