import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * @Entity Budget
 *
 * POURQUOI cette structure ?
 * Un budget est défini PAR CATÉGORIE et PAR MOIS (dans notre cas, mensuel global).
 * On utilise l'ID de catégorie comme clé primaire car il est unique
 * et correspond exactement aux IDs du frontend (ex: "alimentation", "transport"...).
 *
 * @PrimaryColumn (et non @PrimaryGeneratedColumn) car l'ID n'est pas auto-généré :
 * c'est nous qui choisissons l'ID = l'identifiant de la catégorie.
 *
 * Un seul enregistrement par catégorie → on met à jour le montant mensuel.
 */
@Entity('budgets')
export class Budget {
  /**
   * Clé primaire = l'ID de la catégorie.
   * Ex: "alimentation", "transport", "logement"...
   * Doit correspondre exactement aux catégories de type 'depense' du frontend.
   */
  @PrimaryColumn({ type: 'varchar', length: 50 })
  categorieId: string;

  /**
   * Label lisible de la catégorie (ex: "Alimentation").
   * Stocké ici pour éviter de le recalculer à chaque requête stats.
   */
  @Column({ type: 'varchar', length: 100 })
  label: string;

  /**
   * Montant du budget mensuel alloué à cette catégorie.
   * 0 = aucun budget défini pour cette catégorie.
   * Toujours >= 0.
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  montant: number;
}
