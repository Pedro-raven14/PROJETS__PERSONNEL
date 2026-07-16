import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * @Entity Transaction
 *
 * POURQUOI une entité séparée ?
 * TypeORM utilise des classes décorées avec @Entity pour mapper une classe TypeScript
 * à une table PostgreSQL. Chaque propriété décorée avec @Column devient une colonne.
 *
 * Cette entité correspond exactement au modèle Transaction du frontend (voir BACKEND_GUIDE §3.1).
 */
@Entity('transactions') // <- nom de la table en base de données
export class Transaction {
  /**
   * Identifiant unique de la transaction.
   * @PrimaryGeneratedColumn('uuid') demande à PostgreSQL de générer un UUID
   * automatiquement à chaque insertion → même format que crypto.randomUUID() côté frontend.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Type de la transaction : revenu ou dépense.
   * Le frontend utilise ces deux valeurs exactes comme discriminant
   * pour calculer le solde (revenu = +, dépense = -).
   */
  @Column({ type: 'varchar', length: 10 })
  type: 'revenu' | 'depense';

  /**
   * ID de la catégorie (ex: "alimentation", "salaire"...).
   * Ce n'est PAS une foreign key vers une table catégorie :
   * les catégories sont statiques côté frontend (src/data/categories.js).
   * On stocke juste l'ID en string et on valide dans le DTO.
   */
  @Column({ type: 'varchar', length: 50 })
  categorie: string;

  /**
   * Texte libre décrivant la transaction (ex: "Courses du mois").
   */
  @Column({ type: 'varchar', length: 255 })
  description: string;

  /**
   * Montant TOUJOURS positif.
   * Le signe est déterminé par le champ `type` (revenu = +, dépense = -).
   * decimal(10,2) = max 99_999_999.99 avec 2 décimales exactes.
   * On utilise decimal et non float pour éviter les erreurs d'arrondi.
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montant: number;

  /**
   * Date de la transaction au format "YYYY-MM-DD".
   * On stocke en type 'date' PostgreSQL (sans heure) pour simplifier
   * les requêtes de filtrage par mois/année.
   */
  @Column({ type: 'date' })
  date: string;

  /**
   * Note optionnelle (peut être vide "").
   * `nullable: true` permet que la colonne soit NULL en base.
   * `default: ''` met une chaîne vide si rien n'est envoyé.
   */
  @Column({ type: 'text', nullable: true, default: '' })
  note: string;

  /**
   * Statut du paiement : 'paye' ou 'en_attente'.
   * Permet de distinguer les dépenses/revenus confirmés de ceux prévus.
   */
  @Column({ type: 'varchar', length: 20 })
  statut: 'paye' | 'en_attente';

  /**
   * Timestamps gérés automatiquement par TypeORM.
   * @CreateDateColumn : rempli une seule fois à la création.
   * @UpdateDateColumn : mis à jour à chaque save().
   * Utiles pour l'audit et les tris chronologiques.
   */
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
