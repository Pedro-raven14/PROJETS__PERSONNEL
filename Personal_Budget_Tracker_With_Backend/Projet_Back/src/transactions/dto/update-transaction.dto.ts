import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';

/**
 * @DTO UpdateTransactionDto
 *
 * POURQUOI PartialType ?
 * Pour une mise à jour partielle (PATCH), on veut que TOUS les champs
 * de CreateTransactionDto deviennent OPTIONNELS.
 * Plutôt que de tout réécrire avec @IsOptional sur chaque champ,
 * PartialType() fait ça automatiquement en une ligne.
 *
 * Exemple : PATCH /transactions/:id avec { "montant": 150 }
 * → seul le montant est mis à jour, les autres champs restent inchangés.
 *
 * @nestjs/mapped-types est la librairie NestJS qui fournit PartialType.
 * Elle préserve aussi les décorateurs de validation en les rendant optionnels.
 */
export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
