/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ENTITÉ FAVORITE — favorite.entity.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Table de jonction entre User et Recipe pour les favoris.
 * Représente le fait qu'un utilisateur a mis une recette en favori.
 *
 * Pattern similaire à Rating : contrainte unique composite (recipeId + userId).
 * L'endpoint POST /recipes/:id/favorite fait un "toggle" :
 * - Si la ligne existe → on la supprime (retire des favoris)
 * - Si elle n'existe pas → on la crée (ajoute aux favoris)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Recipe } from '../recipes/recipe.entity';

@Entity('favorites')
@Unique(['recipeId', 'userId'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  recipeId: string;

  @Column()
  userId: string;

  /**
   * Timestamp pour savoir quand l'utilisateur a mis en favori.
   * Utile pour trier les favoris par "récemment ajouté".
   */
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Recipe, (recipe) => recipe.favoritedBy, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipeId' })
  recipe: Recipe;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
