import { IsDateString, IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

/**
 * @DTO FilterTransactionDto
 *
 * Ce DTO valide les QUERY PARAMS de la route GET /transactions.
 * Ex: GET /transactions?type=depense&mois=3&annee=2026&page=1&limit=10
 *
 * POURQUOI un DTO pour les query params ?
 * Sans validation, on récupèrerait des strings bruts et devrait tout convertir
 * manuellement. Avec @Transform et @IsOptional, NestJS gère la conversion
 * automatiquement grâce au ValidationPipe + transform:true dans main.ts.
 */
export class FilterTransactionDto {
  /**
   * Filtrer par type : 'revenu' ou 'depense'.
   * @IsOptional : le filtre n'est pas obligatoire (retourne tout par défaut).
   */
  @IsOptional()
  @IsIn(['revenu', 'depense'])
  type?: 'revenu' | 'depense';

  /**
   * Filtrer par ID de catégorie.
   * Ex: ?categorie=alimentation
   */
  @IsOptional()
  @IsString()
  categorie?: string;

  /**
   * Filtrer à partir d'une date (inclusif).
   * Ex: ?dateDebut=2026-01-01
   */
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  /**
   * Filtrer jusqu'à une date (inclusif).
   * Ex: ?dateFin=2026-03-31
   */
  @IsOptional()
  @IsDateString()
  dateFin?: string;

  /**
   * Filtre par statut : 'paye' ou 'en_attente'.
   */
  @IsOptional()
  @IsIn(['paye', 'en_attente'])
  statut?: 'paye' | 'en_attente';

  /**
   * Recherche textuelle dans la description.
   * Ex: ?recherche=courses → cherche "courses" dans description
   * Utilise ILIKE en SQL (case-insensitive).
   */
  @IsOptional()
  @IsString()
  recherche?: string;

  /**
   * Numéro de page pour la pagination (1-indexé).
   * @IsNumberString : les query params arrivent toujours en string,
   * on vérifie que c'est bien un nombre en string avant de le convertir.
   */
  @IsOptional()
  @IsNumberString()
  page?: string;

  /**
   * Nombre d'éléments par page.
   * Ex: ?limit=10 → 10 transactions par page.
   * Default dans le service : 10.
   */
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
