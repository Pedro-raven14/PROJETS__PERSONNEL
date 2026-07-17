/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ENTITÉ USER — user.entity.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Une "entité" TypeORM est une classe TypeScript qui représente une table
 * dans la base de données. Chaque propriété décorée devient une colonne SQL.
 *
 * Pourquoi des décorateurs (@Entity, @Column, etc.) ?
 * TypeORM utilise le pattern "Active Record" via des décorateurs pour éviter
 * de maintenir des fichiers de migration SQL à la main en développement.
 * synchronize: true dans la config TypeORM s'occupe de créer/modifier les tables.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Recipe } from '../recipes/recipe.entity';
import { Comment } from '../comments/comment.entity';
import { Rating } from '../ratings/rating.entity';
import { Favorite } from '../favorites/favorite.entity';

/**
 * @Entity('users')
 * Indique à TypeORM que cette classe correspond à la table "users" en base.
 * Si on ne précise pas le nom, TypeORM utilise le nom de la classe en minuscules.
 */
@Entity('users')
export class User {
  /**
   * @PrimaryGeneratedColumn('uuid')
   * Génère automatiquement un identifiant unique au format UUID v4.
   * Ex : "550e8400-e29b-41d4-a716-446655440000"
   *
   * POURQUOI UUID plutôt qu'un auto-increment ?
   * - Pas de fuite d'information (on ne peut pas deviner le nombre d'utilisateurs)
   * - Compatible avec des architectures distribuées
   * - Facile à fusionner des bases de données
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * @Column() — Colonne simple, type déduit depuis TypeScript (string → VARCHAR)
   */
  @Column()
  fullName: string;

  /**
   * unique: true → TypeORM crée un index UNIQUE sur cette colonne en SQL.
   * Ainsi deux utilisateurs ne peuvent pas avoir le même username.
   */
  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  /**
   * Le mot de passe est stocké haché (bcrypt), jamais en clair.
   * select: false → la colonne est exclue par défaut des SELECT.
   * Cela évite d'envoyer accidentellement le hash au client.
   * Pour le récupérer, il faudra explicitement le demander avec addSelect.
   */
  @Column({ select: false })
  password: string;

  /**
   * nullable: true → la colonne peut être NULL en SQL.
   * default: '' → valeur par défaut si non renseignée.
   */
  @Column({ default: '' })
  bio: string;

  @Column({ nullable: true })
  avatar: string;

  /**
   * refreshToken haché stocké en base pour valider les demandes de renouvellement.
   * select: false → exclu des SELECT par défaut (sécurité).
   * nullable: true → null quand l'utilisateur est déconnecté.
   * type: 'text' → obligatoire car string | null ferait déduire "Object" à TypeORM.
   */
  @Column({ type: 'text', nullable: true, select: false })
  refreshToken: string | null;

  /**
   * @CreateDateColumn / @UpdateDateColumn
   * TypeORM gère ces timestamps automatiquement :
   * - createdAt : défini à l'insertion, jamais modifié après
   * - updatedAt : mis à jour à chaque modification de la ligne
   */
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ─── RELATIONS ────────────────────────────────────────────────────────────
  /**
   * @OneToMany(type => Recipe, recipe => recipe.author)
   *
   * "Un utilisateur peut avoir PLUSIEURS recettes"
   * Le deuxième argument 'recipe => recipe.author' pointe vers la propriété
   * inverse dans Recipe qui référence cet utilisateur.
   *
   * lazy: false (par défaut) → les recettes ne sont PAS chargées automatiquement
   * à chaque requête User. Il faut explicitement les demander avec relations: ['recipes'].
   */
  @OneToMany(() => Recipe, (recipe) => recipe.author)
  recipes: Recipe[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @OneToMany(() => Rating, (rating) => rating.user)
  ratings: Rating[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  // ─── HOOKS TYPEORM ────────────────────────────────────────────────────────
  /**
   * @BeforeInsert / @BeforeUpdate
   * Ces hooks sont appelés automatiquement par TypeORM AVANT une insertion
   * ou une mise à jour en base.
   *
   * On l'utilise ici pour :
   * 1. Normaliser l'email (toujours en minuscules)
   * 2. Hacher le mot de passe avec bcrypt avant de le stocker
   *
   * bcrypt.hash(password, 10) : le "10" est le "salt rounds" (coût de calcul).
   * Plus il est élevé, plus le hash est sécurisé mais lent à générer.
   * 10 est la valeur recommandée pour un bon équilibre sécurité/performance.
   */
  @BeforeInsert()
  @BeforeUpdate()
  async hashPasswordAndNormalize() {
    // Normaliser l'email en minuscules
    if (this.email) {
      this.email = this.email.toLowerCase();
    }

    // Hacher le mot de passe SEULEMENT s'il a été modifié
    // On vérifie s'il n'est pas déjà un hash bcrypt (qui commence par "$2b$")
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }

    // Hacher également le refreshToken si présent et non déjà haché
    if (this.refreshToken && !this.refreshToken.startsWith('$2b$')) {
      this.refreshToken = await bcrypt.hash(this.refreshToken, 10);
    }
  }
}
