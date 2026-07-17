/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ENTITÉ COMMENT — comment.entity.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Un commentaire appartient à UNE recette et à UN utilisateur.
 * Deux relations ManyToOne :
 * - comment.recipe → la recette commentée
 * - comment.author → l'utilisateur qui a commenté
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Recipe } from '../recipes/recipe.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * type: 'text' → pas de limite de 255 caractères pour le texte du commentaire.
   */
  @Column({ type: 'text' })
  text: string;

  // FK → recette commentée
  @Column()
  recipeId: string;

  @ManyToOne(() => Recipe, (recipe) => recipe.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipeId' })
  recipe: Recipe;

  // FK → auteur du commentaire
  @Column()
  authorId: string;

  /**
   * eager: true → l'auteur est AUTOMATIQUEMENT chargé avec chaque commentaire.
   * C'est pratique ici car on affiche toujours le nom/avatar de l'auteur.
   * Attention : eager peut causer des problèmes de performance sur des relations
   * profondes. L'utiliser avec parcimonie.
   */
  @ManyToOne(() => User, (user) => user.comments, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @CreateDateColumn()
  createdAt: Date;
}
