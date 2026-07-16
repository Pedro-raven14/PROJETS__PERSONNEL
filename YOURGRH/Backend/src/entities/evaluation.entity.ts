import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { CycleEvaluation } from './cycle_evaluation.entity';

@Entity('Evaluation')
export class Evaluation {
  @PrimaryGeneratedColumn()
  evaluationId!: number;

  // Notes par critère : { "Communication": 4, "Technique": 3, ... }
  @Column({ type: 'jsonb', nullable: true })
  notes_criteres!: Record<string, number>;

  // Note globale calculée (moyenne des critères)
  @Column({ type: 'decimal', precision: 4, scale: 2, default: 0 })
  note_globale!: number;

  @Column({ type: 'date' })
  date!: Date;

  @Column({ length: 1000, nullable: true })
  commentaire!: string;

  // L'employé évalué
  @ManyToOne(() => Employee, (emp) => emp.evaluations, { nullable: false })
  @JoinColumn({ name: 'userId' })
  employee!: Employee;

  // Le manager qui a fait l'évaluation
  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'evaluateurId' })
  evaluateur!: Employee;

  // Le cycle d'évaluation auquel appartient cette évaluation
  @ManyToOne(() => CycleEvaluation, (cycle) => cycle.evaluations, { nullable: false })
  @JoinColumn({ name: 'cycleId' })
  cycle!: CycleEvaluation;
}
