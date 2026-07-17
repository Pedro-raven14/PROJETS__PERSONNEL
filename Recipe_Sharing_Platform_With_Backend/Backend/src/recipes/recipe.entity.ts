/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ENTITÉ RECIPE — recipe.entity.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Cette entité est la plus riche de l'application.
 * Points notables :
 * - Les ingrédients (Ingredient[]) sont stockés en JSON dans une seule colonne
 *   → simple, pas besoin d'une table séparée pour un usage basique
 * - Les instructions (string[]) idem, tableau JSON
 * - Les tags (string[]) idem
 * - Les relations ManyToOne / OneToMany pour les commentaires, notes, favoris
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Comment } from '../comments/comment.entity';
import { Rating } from '../ratings/rating.entity';
import { Favorite } from '../favorites/favorite.entity';

/**
 * Interface TypeScript pour typer les ingrédients stockés en JSON.
 * Ce n'est PAS une entité TypeORM, juste un type pour la sécurité TypeScript.
 */
export interface Ingredient {
  quantity: string;
  unit: string;
  name: string;
}

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  /**
   * type: 'text' → colonne TEXT en SQL (pas de limite de longueur, vs VARCHAR(255))
   * Utile pour les descriptions longues.
   */
  @Column({ type: 'text' })
  description: string;

  /**
   * Les catégories possibles sont définies en SQL comme une enum.
   * Cela garantit que seules les valeurs valides peuvent être insérées.
   *
   * POURQUOI enum en SQL plutôt qu'une simple string ?
   * - Contrainte d'intégrité au niveau base de données
   * - Meilleure documentation du schéma
   */
  @Column({
    type: 'enum',
    enum: ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Dessert', 'Collation'],
  })
  category: string;

  @Column({
    type: 'enum',
    enum: ['Facile', 'Moyen', 'Difficile'],
  })
  difficulty: string;

  @Column({ type: 'int' })
  prepTime: number;

  @Column({ type: 'int' })
  cookTime: number;

  @Column({ type: 'int' })
  servings: number;

  /**
   * Emoji optionnel pour la carte recette (ex: 🍕).
   * Remplace l'image quand il n'y a pas de photo uploadée.
   */
  @Column({ nullable: true })
  emoji: string;

  /**
   * Couleur de fond de la carte (ex: "#FFF3CD").
   * Optionnelle, utilisée pour l'affichage frontend quand pas d'image.
   */
  @Column({ nullable: true })
  bgColor: string;

  /**
   * URL de l'image stockée sur Cloudinary.
   * null = pas d'image uploadée (on utilise emoji + bgColor).
   */
  @Column({ nullable: true })
  imageUrl: string;

  /**
   * type: 'simple-array' → TypeORM sérialise/désérialise automatiquement
   * le tableau en une chaîne délimitée par des virgules dans la colonne SQL.
   * Ex: ["vegan", "healthy"] → "vegan,healthy" en base
   *
   * Pour des tableaux complexes ou plus de 255 chars, préférer 'json'.
   */
  @Column({ type: 'simple-array', nullable: true, default: '' })
  tags: string[];

  /**
   * type: 'json' → stocke le tableau d'objets Ingredient en JSON dans PostgreSQL.
   * PostgreSQL a un type JSON natif très performant avec possibilité d'indexation.
   *
   * Alternative : créer une table "ingredients" avec une FK → recipe_id.
   * On choisit JSON ici car les ingrédients n'ont pas besoin d'être requêtés
   * individuellement (on les récupère toujours avec la recette).
   */
  @Column({ type: 'json', default: '[]' })
  ingredients: Ingredient[];

  /**
   * Tableau d'étapes textuelles, stocké en JSON.
   */
  @Column({ type: 'json', default: '[]' })
  instructions: string[];

  /**
   * Statut de publication : brouillon ou publié.
   * default: 'published' → par défaut, une recette créée est publiée.
   */
  @Column({
    type: 'enum',
    enum: ['published', 'draft'],
    default: 'published',
  })
  status: 'published' | 'draft';

  /**
   * Note moyenne calculée (0-5), mise à jour à chaque nouveau vote.
   * type: 'decimal' avec precision/scale pour éviter les problèmes d'arrondi float.
   * precision: 3, scale: 1 → permet des valeurs comme 4.8, 3.5, etc.
   */
  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0 })
  rating: number;

  /**
   * Nombre total de votes. Stocké ici pour éviter un COUNT(*) à chaque requête.
   * C'est une technique d'"optimisation par dénormalisation" :
   * on duplique légèrement la donnée pour des lectures plus rapides.
   */
  @Column({ type: 'int', default: 0 })
  ratingsCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ─── RELATIONS ────────────────────────────────────────────────────────────
  /**
   * @ManyToOne(type => User)
   * "Plusieurs recettes peuvent appartenir à UN seul utilisateur"
   *
   * eager: false → l'auteur n'est PAS chargé automatiquement (on contrôle
   * explicitement quand on en a besoin avec relations: ['author'])
   *
   * onDelete: 'CASCADE' → si l'utilisateur est supprimé, ses recettes le sont aussi.
   */
  @ManyToOne(() => User, (user) => user.recipes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  /**
   * @Column() pour stocker l'ID directement dans la table recipes.
   * Cela permet de filtrer par authorId sans avoir à faire une jointure.
   * C'est le pattern "FK column" + "relation objet" de TypeORM.
   */
  @Column()
  authorId: string;

  @OneToMany(() => Comment, (comment) => comment.recipe, { cascade: true })
  comments: Comment[];

  @OneToMany(() => Rating, (rating) => rating.recipe, { cascade: true })
  ratings: Rating[];

  @OneToMany(() => Favorite, (favorite) => favorite.recipe, { cascade: true })
  favoritedBy: Favorite[];
}
