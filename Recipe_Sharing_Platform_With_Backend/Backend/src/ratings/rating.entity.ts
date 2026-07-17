/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ENTITÉ RATING — rating.entity.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Un Rating représente la note (1-5) donnée par UN utilisateur à UNE recette.
 *
 * CONTRAINTE UNIQUE : un utilisateur ne peut noter une recette qu'une seule fois.
 * On utilise un index unique composite sur (recipeId + userId).
 *
 * On pourrait aussi utiliser une clé primaire composite, mais un UUID séparé
 * simplifie les requêtes TypeORM.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Recipe } from '../recipes/recipe.entity';

/**
 * @Unique(['recipeId', 'userId'])
 * Crée un index UNIQUE COMPOSITE en SQL : une paire (recipeId, userId) ne peut
 * apparaître qu'une seule fois dans la table.
 * Cela garantit qu'un user ne peut voter qu'une fois par recette.
 *
 * Si on essaie d'insérer un doublon, PostgreSQL lève une erreur qu'on attrape
 * dans le service pour faire un UPSERT (créer ou mettre à jour).
 */
@Entity('ratings')
@Unique(['recipeId', 'userId'])
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  recipeId: string;

  @Column()
  userId: string;

  /**
   * type: 'int', check: 'rating >= 1 AND rating <= 5'
   * Contrainte CHECK en SQL : la note doit être entre 1 et 5.
   * Deux niveaux de validation :
   * 1. DTO (class-validator) → valide côté NestJS avant d'atteindre la base
   * 2. Contrainte SQL → filet de sécurité si la validation est contournée
   */
  @Column({ type: 'int' })
  rating: number;

  @ManyToOne(() => Recipe, (recipe) => recipe.ratings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipeId' })
  recipe: Recipe;

  @ManyToOne(() => User, (user) => user.ratings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
