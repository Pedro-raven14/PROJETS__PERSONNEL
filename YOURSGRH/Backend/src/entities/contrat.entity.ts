import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('Contrat')
export class Contrat {
  @PrimaryGeneratedColumn()
  contratId!: number;

  @Column({ length: 100 })
  type!: string; // CDI | CDD | STAGE | etc.

  @Column({ type: 'date' })
  date_debut!: Date;

  @Column({ type: 'date', nullable: true })
  date_fin!: Date;

  @Column({ length: 150 })
  poste!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  salaire!: number;

  @Column({ length: 50, default: 'ACTIF' })
  statut!: string; // ACTIF | EXPIRE | RESILIE

  // Signature électronique
  @Column({ default: false })
  signe!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  signeLe!: Date;

  // Chemin vers le PDF généré (non signé)
  @Column({ nullable: true })
  documentPath!: string;

  // Chemin vers le PDF final avec signature
  @Column({ nullable: true })
  documentSignePath!: string;

  @ManyToOne(() => Employee, (emp) => emp.contrats, { nullable: false })
  @JoinColumn({ name: 'userId' })
  employee!: Employee;
}
