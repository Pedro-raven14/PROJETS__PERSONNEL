import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * @Entity Preferences
 *
 * POURQUOI un ID fixe à 1 ?
 * L'application est pour l'instant MONO-UTILISATEUR.
 * Il n'y a donc qu'un seul enregistrement de préférences.
 * On utilise @PrimaryColumn avec une valeur fixe (id = 1) pour avoir
 * un comportement "singleton" : on insère une seule fois, on met à jour ensuite.
 *
 * Quand on ajoutera l'authentification JWT multi-utilisateur,
 * il faudra remplacer cet id fixe par un user_id (FK vers la table users).
 */
@Entity('preferences')
export class Preferences {
  /**
   * Identifiant fixe = 1 (singleton).
   * On n'utilise pas @PrimaryGeneratedColumn pour rester en contrôle total.
   */
  @PrimaryColumn({ type: 'int', default: 1 })
  id: number;

  /**
   * Prénom affiché sur le dashboard : "Bonjour, [nom] 👋"
   */
  @Column({ type: 'varchar', length: 100, default: 'Utilisateur' })
  nom: string;

  /**
   * Symbole de la devise affichée dans l'UI.
   * Valeurs acceptées : €, $, £, CHF.
   */
  @Column({ type: 'varchar', length: 5, default: '€' })
  devise: '€' | '$' | '£' | 'CHF';

  /**
   * Premier jour de la semaine pour les calendriers et périodes.
   * Valeurs acceptées : 'lundi' ou 'dimanche'.
   */
  @Column({ type: 'varchar', length: 10, default: 'lundi' })
  premierJour: 'lundi' | 'dimanche';

  /**
   * Activer/désactiver les alertes de dépassement de budget.
   * Si true, le frontend peut afficher des notifications visuelles
   * quand une catégorie dépasse son budget.
   */
  @Column({ type: 'boolean', default: true })
  notifications: boolean;
}
