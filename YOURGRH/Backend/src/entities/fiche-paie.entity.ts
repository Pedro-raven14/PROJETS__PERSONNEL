import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('FichePaie')
export class FichePaie {
  @PrimaryGeneratedColumn()
  ficheId!: number;

  // Période concernée (ex: "2025-04")
  @Column({ length: 20 })
  periode!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  salaire_base!: number;

  @Column({ type: 'int', default: 0 })
  nb_jours_absence!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  deduction_absence!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  salaire_net!: number;

  // Heures supplémentaires effectuées dans le mois
  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  nb_heures_sup!: number;

  // Montant total des heures supplémentaires
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  montant_heures_sup!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date_generation!: Date;

  // Chemin vers le PDF généré
  @Column({ nullable: true })
  documentPath!: string;

  // L'employé concerné par cette fiche de paie
  @ManyToOne(() => Employee, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  employee!: Employee;
}
