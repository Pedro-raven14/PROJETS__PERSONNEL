import {
  Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { Employee } from './employee.entity';

export type StatutHeuresSup = 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE';

@Entity('HeuresSup')
export class HeuresSup {
  @PrimaryGeneratedColumn()
  heuresSupId!: number;

  /** Date à laquelle les heures ont été effectuées */
  @Column({ type: 'date' })
  date!: string;

  /** Nombre d'heures supplémentaires déclarées */
  @Column({ type: 'decimal', precision: 6, scale: 2 })
  nb_heures!: number;

  /** Motif / description de la tâche effectuée */
  @Column({ length: 500, nullable: true })
  motif!: string;

  /** EN_ATTENTE | VALIDEE | REFUSEE */
  @Column({ length: 20, default: 'EN_ATTENTE' })
  statut!: StatutHeuresSup;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  /** Employé qui a déclaré les heures */
  @ManyToOne(() => Employee, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee!: Employee;

  /** Manager/RH qui a validé ou refusé */
  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'validateurId' })
  validateur!: Employee | null;
}
